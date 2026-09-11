import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link className="brand" href="/explore" aria-label="Explore Under the Hood">
          <BrandMark className="brand-mark" />
          <span>Under the Hood</span>
        </Link>
        <nav aria-label="Primary navigation" className="main-nav">
          <Link href="/explore">Explore</Link>
          <Link href="/components">Components</Link>
          <Link className="nav-cta" href="/playground">Playground</Link>
        </nav>
      </div>
    </header>
  );
}
