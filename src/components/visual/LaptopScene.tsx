import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { SWITCH, ease, prefersReducedMotion } from "@/lib/motion";
import type { Theme } from "@/lib/theme";

/**
 * The home stage: a laptop built from primitives, with a live terminal on
 * its screen, and a second terminal window floating beside it.
 *
 * - The laptop leans toward the cursor and bobs gently.
 * - When `active` changes it spins twice with a motion blur; at the peak of
 *   the first turn the screen swaps to the new slide and starts typing.
 * - On touch screens there is no cursor, so it sways on its own.
 *
 * Everything is drawn by three.js into one canvas. The render loop only runs
 * while the canvas is on screen and the tab is visible.
 */

export interface TerminalSlide {
  /** Shell command shown after the prompt. */
  command: string;
  /** Output lines. A line starting with "✓" is drawn green, "#" is a heading. */
  output: string[];
}

interface LaptopSceneProps {
  slides: TerminalSlide[];
  active: number;
  theme: Theme;
  className?: string;
}

const PROMPT = "pete@codex-prime ~ $ ";
const TYPE_CPS = 55; // characters typed per second
const SCREEN = { width: 1024, height: 640 };
const LOG = [
  "GET  /api/parcels        200  14ms",
  "POST /api/register       201  38ms",
  "check_overlap(p_2231)  → 0 hits",
  "anchor → polygon amoy   ✓ tx ok",
  "GET  /quiz/live          200   9ms",
  "POST /orders             201  22ms",
  "SELECT … ST_Intersects   3.1ms",
  "gunicorn: 4 workers up",
  "GET  /api/tasks          200  11ms",
  "migrate: no changes",
];

/** Colours the terminal uses whatever the theme — terminals stay dark. */
const TERM = {
  bg: "#0b0b0e",
  bar: "#17171c",
  text: "#e9e7df",
  dim: "#8a897f",
  ember: "#ff5a36",
  green: "#3ecf8e",
};

const BODY_COLOR: Record<Theme, string> = { dark: "#2a2a30", light: "#bdbab2" };
const DECK_COLOR: Record<Theme, string> = { dark: "#1b1b20", light: "#a9a69e" };

export default function LaptopScene({ slides, active, theme, className }: LaptopSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // The scene lives outside React; these refs are how props reach it.
  const api = useRef<{ show: (index: number) => void; setTheme: (theme: Theme) => void } | null>(null);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;
  const firstActive = useRef(active);
  const firstTheme = useRef(theme);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (error) {
      // No WebGL (old device, disabled GPU): the page still works without the laptop.
      console.warn("LaptopScene: WebGL unavailable, skipping the 3D stage.", error);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const lookAt = new THREE.Vector3(0, 0.75, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    scene.add(key);
    // An ember rim from behind, so the edges glow against the dark.
    const rim = new THREE.DirectionalLight(0xff5a36, 2.2);
    rim.position.set(-4, 2, -4);
    scene.add(rim);

    // ---------- Textures drawn on 2D canvases ----------
    const disposables: { dispose: () => void }[] = [pmrem, envMap];

    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = SCREEN.width;
    screenCanvas.height = SCREEN.height;
    const screenCtx = screenCanvas.getContext("2d")!;
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = 4;
    disposables.push(screenTex);

    const logCanvas = document.createElement("canvas");
    logCanvas.width = 640;
    logCanvas.height = 400;
    const logCtx = logCanvas.getContext("2d")!;
    const logTex = new THREE.CanvasTexture(logCanvas);
    logTex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(logTex);

    const keysCanvas = document.createElement("canvas");
    keysCanvas.width = 1024;
    keysCanvas.height = 400;
    const keysTex = new THREE.CanvasTexture(keysCanvas);
    keysTex.colorSpace = THREE.SRGBColorSpace;
    disposables.push(keysTex);

    let sceneTheme: Theme = firstTheme.current;
    const drawKeys = (deck: string) => {
      const ctx = keysCanvas.getContext("2d")!;
      ctx.fillStyle = deck;
      ctx.fillRect(0, 0, keysCanvas.width, keysCanvas.height);
      const keyColor = sceneTheme === "light" ? "#8f8c84" : "#0e0e11";
      const rows = 5;
      const cols = 14;
      const pad = 8;
      const w = (keysCanvas.width - pad * (cols + 1)) / cols;
      const h = (keysCanvas.height - pad * (rows + 1)) / rows;
      ctx.fillStyle = keyColor;
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          // The bottom row gets a long space bar in the middle.
          if (r === rows - 1 && c > 3 && c < 10) continue;
          ctx.fillRect(pad + c * (w + pad), pad + r * (h + pad), w, h);
        }
      }
      ctx.fillRect(pad + 4 * (w + pad), pad + (rows - 1) * (h + pad), 6 * w + 5 * pad, h);
      keysTex.needsUpdate = true;
    };

    // ---------- The laptop ----------
    const bodyMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR[sceneTheme], metalness: 0.7, roughness: 0.32 });
    const keysMat = new THREE.MeshStandardMaterial({ map: keysTex, metalness: 0.2, roughness: 0.8 });
    const padMat = new THREE.MeshStandardMaterial({ color: DECK_COLOR[sceneTheme], metalness: 0.5, roughness: 0.45 });
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
    const bezelMat = new THREE.MeshStandardMaterial({ color: "#060608", metalness: 0.3, roughness: 0.5 });
    disposables.push(bodyMat, keysMat, padMat, screenMat, bezelMat);
    drawKeys(DECK_COLOR[sceneTheme]);

    const laptop = new THREE.Group();
    const W = 3.2;
    const D = 2.15;

    const baseGeo = new RoundedBoxGeometry(W, 0.12, D, 4, 0.05);
    const base = new THREE.Mesh(baseGeo, bodyMat);
    base.position.y = 0.06;
    laptop.add(base);

    const keysGeo = new THREE.PlaneGeometry(W * 0.86, D * 0.38);
    const keys = new THREE.Mesh(keysGeo, keysMat);
    keys.rotation.x = -Math.PI / 2;
    keys.position.set(0, 0.121, -D * 0.17);
    laptop.add(keys);

    const padGeo = new THREE.PlaneGeometry(W * 0.32, D * 0.26);
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, 0.122, D * 0.27);
    laptop.add(pad);

    // The lid pivots on the back edge of the base.
    const lid = new THREE.Group();
    lid.position.set(0, 0.12, -D / 2 + 0.04);
    lid.rotation.x = -0.24; // open a little past upright
    const LID_H = 2.05;
    const lidGeo = new RoundedBoxGeometry(W, LID_H, 0.07, 4, 0.04);
    const lidMesh = new THREE.Mesh(lidGeo, bodyMat);
    lidMesh.position.set(0, LID_H / 2, 0);
    lid.add(lidMesh);
    const bezelGeo = new THREE.PlaneGeometry(W - 0.08, LID_H - 0.08);
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, LID_H / 2, 0.0365);
    lid.add(bezel);
    const screenGeo = new THREE.PlaneGeometry(W - 0.24, (W - 0.24) * (SCREEN.height / SCREEN.width));
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, LID_H / 2 + 0.02, 0.037);
    lid.add(screen);
    laptop.add(lid);
    disposables.push(baseGeo, keysGeo, padGeo, lidGeo, bezelGeo, screenGeo);

    // A soft light spilling off the screen onto the keys.
    const glow = new THREE.PointLight(0xffb59e, 0.9, 4, 2);
    glow.position.set(0, 1.0, 0.2);
    laptop.add(glow);

    // ---------- The floating terminal window ----------
    const panel = new THREE.Group();
    const panelGeo = new RoundedBoxGeometry(1.7, 1.06, 0.05, 3, 0.03);
    const panelMesh = new THREE.Mesh(panelGeo, bodyMat);
    panel.add(panelMesh);
    const logGeo = new THREE.PlaneGeometry(1.62, 1.0);
    const logMat = new THREE.MeshBasicMaterial({ map: logTex, toneMapped: false });
    const logMesh = new THREE.Mesh(logGeo, logMat);
    logMesh.position.z = 0.026;
    panel.add(logMesh);
    disposables.push(panelGeo, logGeo, logMat);

    const rig = new THREE.Group(); // spins and leans as one
    rig.add(laptop);
    laptop.position.set(0, 0, 0);
    scene.add(rig);
    scene.add(panel);

    // ---------- Terminal drawing ----------
    let slideIndex = firstActive.current;
    let typedChars = 0;
    let typingStart = performance.now();

    const currentSlide = () => slidesRef.current[Math.max(0, Math.min(slideIndex, slidesRef.current.length - 1))];

    const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const drawScreen = (now: number) => {
      const ctx = screenCtx;
      const { width, height } = SCREEN;
      ctx.fillStyle = TERM.bg;
      ctx.fillRect(0, 0, width, height);

      // Title bar with the three window dots.
      ctx.fillStyle = TERM.bar;
      ctx.fillRect(0, 0, width, 54);
      ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(34 + i * 30, 27, 9, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = TERM.dim;
      ctx.font = '500 22px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = "center";
      ctx.fillText("pete@codex-prime: ~ — zsh", width / 2, 35);
      ctx.textAlign = "left";

      const slide = currentSlide();
      if (!slide) return;
      ctx.font = '500 27px "JetBrains Mono", ui-monospace, monospace';
      const lineH = 40;
      const left = 36;
      const maxW = width - left * 2;

      // Lay out every line first, then reveal characters up to `typedChars`.
      const rows: { text: string; color: string; prompt?: boolean }[] = [];
      rows.push({ text: slide.command, color: TERM.text, prompt: true });
      for (const out of slide.output) {
        const color = out.startsWith("✓") ? TERM.green : out.startsWith("#") ? TERM.ember : TERM.dim;
        const clean = out.startsWith("#") ? out.slice(1).trim() : out;
        for (const piece of wrap(ctx, clean, maxW)) rows.push({ text: piece, color });
      }

      let budget = typedChars;
      let y = 100;
      let cursorX = left;
      let cursorY = y;
      for (const row of rows) {
        if (budget <= 0) break;
        let x = left;
        if (row.prompt) {
          ctx.fillStyle = TERM.ember;
          ctx.fillText(PROMPT, x, y);
          x += ctx.measureText(PROMPT).width;
        }
        const shown = row.text.slice(0, budget);
        budget -= row.text.length + 1;
        ctx.fillStyle = row.color;
        ctx.fillText(shown, x, y);
        cursorX = x + ctx.measureText(shown).width;
        cursorY = y;
        y += lineH;
      }
      const total = rows.reduce((sum, row) => sum + row.text.length + 1, 0);
      const finished = typedChars >= total;
      if (finished) {
        // A fresh prompt waits for the next command.
        ctx.fillStyle = TERM.ember;
        ctx.fillText(PROMPT, left, y);
        cursorX = left + ctx.measureText(PROMPT).width;
        cursorY = y;
      }
      if (!finished || Math.floor(now / 530) % 2 === 0) {
        ctx.fillStyle = TERM.ember;
        ctx.fillRect(cursorX + 4, cursorY - 24, 15, 30);
      }
      screenTex.needsUpdate = true;
      return finished;
    };

    let logOffset = 0;
    const drawLog = () => {
      const ctx = logCtx;
      const { width, height } = logCanvas;
      ctx.fillStyle = TERM.bg;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = TERM.bar;
      ctx.fillRect(0, 0, width, 40);
      ctx.fillStyle = TERM.dim;
      ctx.font = '500 17px "JetBrains Mono", ui-monospace, monospace';
      ctx.fillText("~/logs — tail -f", 18, 26);
      ctx.fillStyle = TERM.green;
      ctx.beginPath();
      ctx.arc(width - 24, 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '500 19px "JetBrains Mono", ui-monospace, monospace';
      for (let i = 0; i < 9; i += 1) {
        const line = LOG[(logOffset + i) % LOG.length];
        ctx.fillStyle = line.includes("✓") ? TERM.green : i === 8 ? TERM.text : TERM.dim;
        ctx.fillText(line, 18, 74 + i * 36);
      }
      logTex.needsUpdate = true;
    };

    // ---------- Layout ----------
    let panelBaseY = 0;
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Narrow boxes (phones) frame the laptop to ~85% of the width instead.
      const distance = camera.aspect < 1.25 ? 8.6 / camera.aspect : 9.4;
      camera.position.set(0, 1.9, distance);
      camera.lookAt(lookAt);
      camera.updateProjectionMatrix();
      // Wide: the log window floats up-left, half behind the lid. Narrow: tucked up-right.
      if (camera.aspect >= 1.25) {
        panel.position.set(-1.85, 2.2, -2.4);
        panelBaseY = 2.2;
        panel.scale.setScalar(1);
      } else {
        panel.position.set(1.35, 2.55, -1.8);
        panelBaseY = 2.55;
        panel.scale.setScalar(0.8);
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    // ---------- Input ----------
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = prefersReducedMotion();
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      target.x = event.clientX / window.innerWidth - 0.5;
      target.y = event.clientY / window.innerHeight - 0.5;
    };
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    // ---------- The spin ----------
    let spin: { start: number; next: number; swapped: boolean } | null = null;
    let spinAngle = 0;

    const show = (index: number) => {
      if (index === slideIndex && !spin) return;
      if (reduced) {
        slideIndex = index;
        typedChars = Number.MAX_SAFE_INTEGER;
        return;
      }
      spin = { start: performance.now(), next: index, swapped: false };
    };

    const setTheme = (next: Theme) => {
      sceneTheme = next;
      bodyMat.color.set(BODY_COLOR[next]);
      padMat.color.set(DECK_COLOR[next]);
      drawKeys(DECK_COLOR[next]);
    };

    api.current = { show, setTheme };

    // ---------- Loop ----------
    let raf = 0;
    let onScreen = true;
    let lastLog = 0;
    if (reduced) typedChars = Number.MAX_SAFE_INTEGER;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const time = now / 1000;

      // Ease toward the cursor; with no cursor, a slow figure-of-eight sway.
      if (!fine && !reduced) {
        target.x = Math.sin(time * 0.35) * 0.18;
        target.y = Math.sin(time * 0.5) * 0.1;
      }
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      if (spin) {
        const elapsed = now - spin.start;
        if (elapsed < SWITCH.in) {
          const t = ease.inQuad(elapsed / SWITCH.in);
          spinAngle = t * Math.PI * 2;
          renderer.domElement.style.filter = `blur(${t * 6}px)`;
        } else {
          if (!spin.swapped) {
            // Peak of the first turn: swap the screen while it's a blur.
            spin.swapped = true;
            slideIndex = spin.next;
            typedChars = 0;
            typingStart = now;
          }
          const t = Math.min(1, (elapsed - SWITCH.in) / (SWITCH.out + SWITCH.hold));
          spinAngle = Math.PI * 2 + ease.outBack(t, 0.9) * Math.PI * 2;
          renderer.domElement.style.filter = t < 0.35 ? `blur(${6 * (1 - t / 0.35)}px)` : "";
          if (t >= 1) {
            spin = null;
            spinAngle = 0;
            renderer.domElement.style.filter = "";
          }
        }
      }

      const bob = reduced ? 0 : Math.sin(time * ((Math.PI * 2) / 6)) * 0.08;
      rig.position.y = bob;
      rig.rotation.y = -0.38 + current.x * 0.7 + spinAngle;
      rig.rotation.x = 0.06 + current.y * 0.25;

      panel.rotation.y = (camera.aspect >= 1.25 ? 0.35 : -0.45) + current.x * 0.35;
      panel.rotation.x = current.y * 0.2;
      panel.position.y = panelBaseY + (reduced ? 0 : Math.sin(time * 0.8 + 1.3) * 0.1);

      if (!reduced) typedChars = Math.floor(((now - typingStart) / 1000) * TYPE_CPS);
      drawScreen(now);
      if (now - lastLog > 900) {
        lastLog = now;
        logOffset += 1;
        drawLog();
      }

      renderer.render(scene, camera);
    };

    const start = () => {
      if (!raf && onScreen && document.visibilityState === "visible") raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    visibility.observe(host);
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);

    // The terminal font must be loaded before the first draw, or it renders in a fallback.
    drawLog();
    (document.fonts?.load('500 27px "JetBrains Mono"') ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => {
        drawLog();
        start();
      });

    return () => {
      stop();
      api.current = null;
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    api.current?.show(active);
  }, [active]);

  useEffect(() => {
    api.current?.setTheme(theme);
  }, [theme]);

  return <div ref={hostRef} className={className} />;
}
