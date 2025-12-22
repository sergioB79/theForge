"use client";

import { usePathname } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/crucible") return null;

  return (
    <div className="forge-back">
      <a href="/crucible" className="forge-back-link">
        Back to Crucible
      </a>
    </div>
  );
}
