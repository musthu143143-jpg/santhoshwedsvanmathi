import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type DateRevealState = {
  /** True once all three hearts have been scratched (or revealed via the fallback). */
  revealed: boolean;
  setRevealed: (value: boolean) => void;
};

const DateRevealContext = createContext<DateRevealState>({
  revealed: false,
  setRevealed: () => {},
});

export function DateRevealProvider({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const value = useMemo(() => ({ revealed, setRevealed }), [revealed]);
  return <DateRevealContext.Provider value={value}>{children}</DateRevealContext.Provider>;
}

export function useDateReveal() {
  return useContext(DateRevealContext);
}
