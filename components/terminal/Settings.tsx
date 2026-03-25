"use client";

import { useEffect, useState } from "react";

type Theme    = "terminal" | "abap";
type Font     = "d2coding" | "dunggeunmo";
type FontSize = "8" | "10" | "12" | "14" | "16" | "18";

const THEMES: { id: Theme; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "abap",     label: "ABAP" },
];

const FONTS: { id: Font; label: string }[] = [
  { id: "d2coding",   label: "D2Coding" },
  { id: "dunggeunmo", label: "둥근모" },
];

const SIZES: { id: FontSize; label: string }[] = [
  { id: "8",  label: "8px" },
  { id: "10", label: "10px" },
  { id: "12", label: "12px" },
  { id: "14", label: "14px" },
  { id: "16", label: "16px" },
  { id: "18", label: "18px" },
];

export default function Settings() {
  const [theme,    setTheme]    = useState<Theme>("terminal");
  const [font,     setFont]     = useState<Font>("d2coding");
  const [fontSize, setFontSize] = useState<FontSize>("16");

  useEffect(() => {
    const savedTheme    = (localStorage.getItem("theme")     as Theme)    ?? "terminal";
    const savedFont     = (localStorage.getItem("font")      as Font)     ?? "d2coding";
    const savedFontSize = (localStorage.getItem("fontSize")  as FontSize) ?? "16";
    applyTheme(savedTheme);
    applyFont(savedFont);
    applyFontSize(savedFontSize);
    setTheme(savedTheme);
    setFont(savedFont);
    setFontSize(savedFontSize);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.classList.remove("theme-terminal", "theme-abap");
    document.documentElement.classList.add(`theme-${t}`);
    localStorage.setItem("theme", t);
  }

  function applyFont(f: Font) {
    document.documentElement.classList.remove("font-d2coding", "font-dunggeunmo");
    document.documentElement.classList.add(`font-${f}`);
    localStorage.setItem("font", f);
  }

  function applyFontSize(s: FontSize) {
    document.documentElement.style.fontSize = `${s}px`;
    localStorage.setItem("fontSize", s);
  }

  const selectClass =
    "bg-terminal-surface text-terminal-muted border border-terminal-border text-xs px-1 py-0.5 outline-none cursor-pointer hover:border-terminal-green transition-colors";

  return (
    <div className="flex items-center gap-2 text-xs">
      <select value={theme} onChange={(e) => { applyTheme(e.target.value as Theme); setTheme(e.target.value as Theme); }} className={selectClass}>
        {THEMES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
      </select>
      <select value={font} onChange={(e) => { applyFont(e.target.value as Font); setFont(e.target.value as Font); }} className={selectClass}>
        {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
      </select>
      <select value={fontSize} onChange={(e) => { applyFontSize(e.target.value as FontSize); setFontSize(e.target.value as FontSize); }} className={selectClass}>
        {SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </div>
  );
}
