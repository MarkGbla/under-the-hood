type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="36" height="36" rx="11" fill="currentColor" />
      <path d="M9.5 12.5L4.5 18L9.5 23.5" stroke="#F8F7F2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26.5 12.5L31.5 18L26.5 23.5" stroke="#F8F7F2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.5 9L14.5 27" stroke="#FF8A62" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
