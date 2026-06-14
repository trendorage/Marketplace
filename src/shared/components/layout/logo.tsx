import Link from 'next/link';

type LogoProps = {
  onClick?: () => void;
};

export const Logo = ({ onClick }: LogoProps) => (
  <Link href="/" onClick={onClick} className="flex items-center gap-2">
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cart handle + body */}
      <path
        d="M3 5h5l2 6h17l-3 12H13L10 11"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="15" cy="29" r="2" className="fill-primary" />
      <circle cx="23" cy="29" r="2" className="fill-primary" />
      {/* Double chevron >> */}
      <path
        d="M14 16l3 3-3 3M18 16l3 3-3 3"
        className="stroke-primary-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    <span className="text-base font-black tracking-widest text-primary sm:text-lg">
      TRENDORA
    </span>
  </Link>
);
