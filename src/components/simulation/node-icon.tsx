import type { SystemNodeKind } from "@/types/simulation";

type NodeIconProps = {
  kind: SystemNodeKind;
};

export function NodeIcon({ kind }: NodeIconProps) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (kind === "browser") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="4.5" width="22" height="19" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9.5H25" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="6.7" cy="7" r="0.8" fill="currentColor" />
        <circle cx="9.7" cy="7" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "database") {
    return (
      <svg {...common} aria-hidden="true">
        <ellipse cx="14" cy="6.5" rx="9" ry="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 6.5V14C5 15.93 9.03 17.5 14 17.5C18.97 17.5 23 15.93 23 14V6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 14V21.5C5 23.43 9.03 25 14 25C18.97 25 23 23.43 23 21.5V14" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "middleware") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M6 24V5M22 24V5M4 24H24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 8H20M8 13H20M8 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="13" r="2.3" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "router") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M5 7H15C18.31 7 21 9.69 21 13V21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 17L21 21L25 17M5 21H11C13.21 21 15 19.21 15 17V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "controller") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="5" y="5" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 11H19M9 15H16M9 19H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "service") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M14 4V8M14 20V24M4 14H8M20 14H24M6.9 6.9L9.7 9.7M18.3 18.3L21.1 21.1M21.1 6.9L18.3 9.7M9.7 18.3L6.9 21.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="14" r="6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="14" cy="14" r="2" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "user") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="14" cy="9" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 24C6 19.58 9.58 16 14 16C18.42 16 22 19.58 22 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "token") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 14H24M21 14V18M18 14V17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "code") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="5" width="22" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 11L6 14L9 17M19 11L22 14L19 17M16 9L12 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "repository") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="8" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="20" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="8" cy="21" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 9.5V18.5M10.5 8C16 8 14 14 17.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "build") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M5 9L14 4L23 9V19L14 24L5 19V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M5 9L14 14L23 9M14 14V24" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "tests") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="5" y="4" width="18" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 10L11 12L15 8M9 17L11 19L15 15M17 11H20M17 18H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "cloud") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M8 21H21C23.21 21 25 19.21 25 17C25 14.79 23.21 13 21 13C20.64 8.52 17.47 6 14 6C10.46 6 7.52 8.6 7 12.02C4.72 12.25 3 14.17 3 16.5C3 18.99 5.01 21 8 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "domain") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 14H24M14 4C17 7 18 10 18 14C18 18 17 21 14 24M14 4C11 7 10 10 10 14C10 18 11 21 14 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <rect x="5" y="3.5" width="18" height="21" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 9H19M9 14H19M9 19H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}
