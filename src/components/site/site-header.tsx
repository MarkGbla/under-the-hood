"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { BrandMark } from "./brand-mark";

export function SiteHeader() {
  const pathname = usePathname();
  return <NavigationHeader key={pathname} pathname={pathname} />;
}

function NavigationHeader({ pathname }: { pathname: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          closeMenu();
          menuButton.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeMenu();
      }}
    >
      <div className="site-shell header-inner">
        <Link className="brand" href="/explore" aria-label="Explore Under the Hood" onClick={closeMenu}>
          <BrandMark className="brand-mark" />
          <span>Under the Hood</span>
        </Link>
        <button
          ref={menuButton}
          type="button"
          className="site-menu-toggle"
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
          <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
        <nav id="primary-navigation" aria-label="Primary navigation" className={`main-nav${menuOpen ? " is-open" : ""}`}>
          <Link href="/explore" aria-current={pathname === "/" || pathname === "/explore" ? "page" : undefined} onClick={closeMenu}>Explore</Link>
          <Link href="/components" aria-current={pathname === "/components" ? "page" : undefined} onClick={closeMenu}>Components</Link>
          <Link className="nav-cta" href="/playground" aria-current={pathname === "/playground" ? "page" : undefined} onClick={closeMenu}>Playground</Link>
        </nav>
      </div>
    </header>
  );
}
