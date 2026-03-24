"use client";

import { useEffect, useState } from "react";

type Font = "d2coding" | "dunggeunmo";

const FONTS: { id: Font; label: string }[] = [
  { id: "d2coding", label: "D2Coding" },
  { id: "dunggeunmo", label: "둥근모" },
];

export default function FontToggle() {
  const [current, setCurrent] = useState<Font>("d2coding");

  useEffect(() => {
    const saved = (localStorage.getItem("font") as Font) ?? "d2coding";
    applyFont(saved);
    setCurrent(saved);
  }, []);

  function applyFont(font: Font) {
    document.documentElement.classList.remove("font-d2coding", "font-dunggeunmo");
    document.documentElement.classList.add(`font-${font}`);
    localStorage.setItem("font", font);
  }

  function toggle() {
    const next = current === "d2coding" ? "dunggeunmo" : "d2coding";
    applyFont(next);
    setCurrent(next);
  }

  return (
    <button
      onClick={toggle}
      className="text-terminal-muted hover:text-terminal-yellow transition-colors text-xs"
      title="폰트 전환"
    >
      [{FONTS.find((f) => f.id === current)?.label}]
    </button>
  );
}
