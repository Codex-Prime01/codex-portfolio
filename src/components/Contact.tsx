import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SplitText } from "@/components/motion/SplitText";
import { Reveal } from "@/components/motion/Reveal";
import { ContourField } from "@/components/visual/ContourField";
import { ChequerSeam } from "@/components/visual/ChequerSeam";
import { Arrow } from "@/components/site/ChamferLink";
import { Monogram } from "@/components/Navigation";
import { CONTACT, NAV, PROFILE } from "@/data/profile";

/**
 * The sign-off: an ember page edge with a dark panel inset inside it.
 *
 * The form is honest about what it does. There is no server: submitting
 * opens the visitor's own email app with the message filled in, and the
 * status line says exactly that.
 */

const Contact = () => {
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative bg-ember p-2 sm:p-4">
      <ChequerSeam />

      <div className="relative isolate overflow-hidden bg-ink-2">
        <div className="absolute inset-0 -z-10">
          <ContourField alpha={0.06} />
        </div>

        <div className="shell pb-10 pt-14 sm:pt-[24svh]">
          <p className="label">
            <span className="text-ember">(05)</span> — Contact
          </p>

          <h2 id="contact-title" className="mt-6" aria-label="Let's build something.">
            <SplitText by="letter" stagger={35} text="Let's build" className="display block text-[clamp(2.75rem,13vw,13rem)] text-paper" />
            <SplitText
              by="letter"
              stagger={35}
              delay={300}
              text="something."
              className="display block text-[clamp(2.75rem,13vw,13rem)] text-paper [&_.split-unit:last-child]:text-ember"
            />
          </h2>

          <div className="mt-10 grid gap-10 sm:mt-16 sm:gap-16 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-6">
              <Reveal>
                <p className="max-w-[36ch] text-lg leading-snug sm:text-xl text-paper/85">
                  {PROFILE.lookingFor}, remote or on-site. Freelance briefs welcome too — tell me the timeline and budget and
                  I'll reply faster.
                </p>
              </Reveal>

              <Reveal delay={120} className="mt-10">
                <EmailBlock />
              </Reveal>

              <Reveal delay={200} as="ul" className="mt-10 border-t border-line">
                {[
                  { label: "Phone", value: CONTACT.phone, href: CONTACT.phoneHref },
                  { label: "GitHub", value: CONTACT.githubHandle, href: CONTACT.github, external: true },
                  { label: "TikTok", value: CONTACT.tiktokHandle, href: CONTACT.tiktok, external: true },
                  { label: "Résumé", value: "PDF, 2 pages", href: PROFILE.resumeUrl, download: true },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      {...(item.download ? { download: true } : {})}
                      className="group flex items-center justify-between gap-4 border-b border-line py-4 transition-[padding] duration-500 ease-out hover:pl-2"
                    >
                      <span className="label w-20">{item.label}</span>
                      <span className="flex-1 text-paper transition-colors group-hover:text-ember">{item.value}</span>
                      <Arrow
                        direction={item.download ? "down" : "up-right"}
                        className="text-ember transition-transform group-hover:translate-x-1"
                      />
                      {item.external && <span className="sr-only">(opens in a new tab)</span>}
                    </a>
                  </li>
                ))}
              </Reveal>
            </div>

            <Reveal delay={150} className="lg:col-span-5 lg:col-start-8">
              <MessageForm />
            </Reveal>
          </div>

          <Footer />
        </div>
      </div>
    </section>
  );
};

function EmailBlock() {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied("done");
    } catch {
      // Clipboard blocked (permissions, insecure context): say so plainly.
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 2400);
  };

  return (
    <div>
      <p className="label mb-3">Email</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={`mailto:${CONTACT.email}`}
          className="link-underline break-all font-display text-[clamp(1.6rem,4.4vw,3.25rem)] leading-none text-paper hover:text-ember"
        >
          {CONTACT.email}
        </a>
        <button
          type="button"
          onClick={copy}
          className="label border border-line px-3 py-2 text-paper transition-colors hover:border-ember hover:text-ember"
        >
          {copied === "done" ? "Copied ✓" : copied === "failed" ? "Couldn't copy" : "Copy"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied === "done" ? "Email address copied" : copied === "failed" ? "Copy failed — select the address instead" : ""}
      </p>
    </div>
  );
}

function MessageForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    setStatus(`Your email app should now open with this message addressed to ${CONTACT.email}. It isn't sent until you press send there.`);
  };

  const field =
    "peer w-full border-0 border-b border-line-strong bg-transparent px-0 pb-3 pt-6 text-lg text-paper placeholder-transparent outline-none transition-colors focus:border-ember focus-visible:outline-none";
  const label =
    "label pointer-events-none absolute left-0 top-6 origin-left transition-all duration-300 peer-focus:top-0 peer-focus:text-ember peer-[:not(:placeholder-shown)]:top-0";

  return (
    <form onSubmit={submit} className="relative bg-ink p-6 sm:p-8" noValidate={false}>
      <p className="label mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-ember" aria-hidden="true" /> Write a message
      </p>
      <div className="space-y-6">
        <div className="relative">
          <input id="name" name="name" required autoComplete="name" placeholder="Name" value={form.name} onChange={update} className={field} />
          <label htmlFor="name" className={label}>Your name</label>
        </div>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={update}
            className={field}
          />
          <label htmlFor="email" className={label}>Your email</label>
        </div>
        <div className="relative">
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="Message"
            value={form.message}
            onChange={update}
            className={cn(field, "resize-none")}
          />
          <label htmlFor="message" className={label}>Project, role or just hello</label>
        </div>
      </div>

      <button
        type="submit"
        className="group mt-8 flex w-full items-center justify-between bg-ember px-6 py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-colors hover:bg-paper"
      >
        Open in my email app
        <Arrow className="transition-transform group-hover:translate-x-1" />
      </button>
      <p className="mt-4 min-h-[1.25rem] text-sm text-dim" role="status" aria-live="polite">
        {status || "No server involved — this hands the message to your own email app."}
      </p>
    </form>
  );
}

function Footer() {
  return (
    <footer className="mt-16 sm:mt-28 border-t border-line pt-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <Monogram />
          <p className="font-display text-lg uppercase tracking-wide">
            Codex<span className="text-ember">/</span>Prime
          </p>
        </div>
        {/* The nav as a column of display type, each word resolving letter by letter. */}
        <nav aria-label="Footer" className="w-full md:w-auto">
          <ul className="flex flex-col md:items-end">
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-line md:border-0">
                <Link
                  to={item.href}
                  className="group flex items-baseline justify-between gap-4 py-2 font-display text-3xl uppercase leading-none text-paper transition-colors hover:text-ember sm:text-4xl md:justify-end"
                >
                  <span className="font-mono text-[0.65rem] text-dim md:order-2">{item.index}</span>
                  <SplitText by="letter" text={item.label} delay={260 + i * 80} stagger={22} />
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="label mt-4 inline-block text-ember hover:text-paper"
              >
                Back to top ↑
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mt-8 flex flex-col gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-dim sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {PROFILE.name} ({PROFILE.brand})
        </p>
        <p>Built with React, TypeScript &amp; Tailwind — no templates</p>
      </div>
    </footer>
  );
}

export default Contact;
