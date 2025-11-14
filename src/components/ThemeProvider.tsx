"use client";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
    try { localStorage.setItem("theme", "dark"); } catch {}
  }, []);
  return <>{children}</>;
}