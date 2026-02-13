import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

// Removed TypeScript-specific parts:
// import { ComponentProps } from "react";
// type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}