"use client";

import { useEffect } from "react";

function scrollToContentSection() {
  const section = document.getElementById("content-grid");
  if (!section) {
    return;
  }

  const headerOffset = 96;
  const top = section.getBoundingClientRect().top + window.scrollY - headerOffset;

  window.scrollTo({
    top: Math.max(top, 0),
    behavior: "smooth",
  });
}

export function HomeScrollController() {
  useEffect(() => {
    if (window.location.pathname !== "/") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("section") !== "content") {
      return;
    }

    // Wait one frame so section layout is present before smooth scroll.
    requestAnimationFrame(() => {
      scrollToContentSection();
      window.history.replaceState({}, "", "/");
    });
  }, []);

  return null;
}
