"use client";

import { useEffect, useState } from "react";

type Theme = "terminal" | "abap";
type Font  = "d2coding" | "dunggeunmo";

const THEMES: { id: Theme; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "abap",     label: "ABAP" },
];

const FONTS: { id: Font; label: string }[] = [
  { id: "d2coding",    label: "D2Coding" },
  { id: "dunggeunmo",  label: "둥근모" },
];

export default function Settings() {
  const [theme, setTheme] = useState<Theme>("terminal");
  const [font,  setFont]  = useState<Font>("d2coding");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) ?? "terminal";
    const savedFont  = (localStorage.getItem("font")  as Font)  ?? "d2coding";
    applyTheme(savedTheme);
    applyFont(savedFont);
    setTheme(savedTheme);
    setFont(savedFont);
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

  function onThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as Theme;
    applyTheme(val);
    setTheme(val);
  }

  function onFontChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as Font;
    applyFont(val);
    setFont(val);
  }

  const selectClass =
    "bg-terminal-surface text-terminal-muted border border-terminal-border text-xs px-1 py-0.5 outline-none cursor-pointer hover:border-terminal-green transition-colors";

  return (
    <div className="flex items-center gap-2 text-xs">
      <select value={theme} onChange={onThemeChange} className={selectClass}>
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
      <select value={font} onChange={onFontChange} className={selectClass}>
        {FONTS.map((f) => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>
    </div>
  );
}
