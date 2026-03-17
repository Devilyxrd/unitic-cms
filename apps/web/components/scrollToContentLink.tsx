"use client";

import { MouseEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  className?: string;
  children: ReactNode;
};

const CONTENT_SECTION_QUERY = "section=content";

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

export function ScrollToContentLink({ className, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (pathname === "/") {
      scrollToContentSection();
      return;
    }

    router.push(`/?${CONTENT_SECTION_QUERY}`);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
