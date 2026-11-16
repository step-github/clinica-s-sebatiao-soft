"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

export function useDark() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function toggleTheme() {
  const next = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("css-theme", next ? "dark" : "light");
}

export function useChartPalette() {
  const dark = useDark();
  return {
    consultas: dark ? "#5ec4dc" : "#006889",
    exames: dark ? "#7dd3fc" : "#3d8ca8",
    cirurgias: dark ? "#fbbf24" : "#d97706",
    muted: dark ? "#64748b" : "#94a3b8",
    grid: dark ? "#1e293b" : "#e2e8f0",
    axis: dark ? "#94a3b8" : "#64748b",
    bar: dark ? "#1f6f86" : "#b7dbe6",
    barStrong: dark ? "#5ec4dc" : "#006889",
  };
}
