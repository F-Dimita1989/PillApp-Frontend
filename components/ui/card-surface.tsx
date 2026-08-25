import { createContext, useContext, type ReactNode } from "react";

export type CardSurface = "light" | "brand";

const CardSurfaceContext = createContext<CardSurface>("light");

export function CardSurfaceProvider({
  surface,
  children,
}: {
  surface: CardSurface;
  children: ReactNode;
}) {
  return (
    <CardSurfaceContext.Provider value={surface}>
      {children}
    </CardSurfaceContext.Provider>
  );
}

export function useCardSurface(): CardSurface {
  return useContext(CardSurfaceContext);
}
