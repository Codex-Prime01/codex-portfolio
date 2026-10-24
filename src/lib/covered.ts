import { createContext, useContext } from "react";

/** True while a block is fully covered by the one stacked over it. */
export const CoveredContext = createContext(false);
export const useCovered = () => useContext(CoveredContext);
