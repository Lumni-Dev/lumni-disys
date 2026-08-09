import type { ReactNode } from "react";

type IconProps = { className?: string; strokeWidth?: number };

function Svg({
  children,
  className = "h-4 w-4",
  strokeWidth = 1.8,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </Svg>
);

export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h3a1 1 0 011 1v11" />
    <path d="M8 8h1M8 12h1M11 8h1M11 12h1" />
  </Svg>
);

export const IconBriefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M4 20a5 5 0 0110 0M16 3.5a3 3 0 010 5.8M20 20a5 5 0 00-4-4.9" />
  </Svg>
);

export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4h9l5 5v11a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    <path d="M14 4v5h5M8 13h8M8 17h5" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const IconLinkedin = ({
  className = "h-5 w-5",
}: {
  className?: string;
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="#0A66C2">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0z" />
  </svg>
);

export const IconGoogle = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="#4285F4"
      d="M21.6 12.2c0-.64-.06-1.25-.16-1.84H12v3.48h5.4a4.62 4.62 0 01-2 3.03v2.52h3.23c1.89-1.74 2.97-4.3 2.97-7.19z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.07v2.6A10 10 0 0012 22z"
    />
    <path
      fill="#FBBC05"
      d="M6.41 13.91c-.2-.6-.31-1.24-.31-1.91s.11-1.31.31-1.91V7.49H3.07A10 10 0 002 12c0 1.61.39 3.14 1.07 4.51l3.34-2.6z"
    />
    <path
      fill="#EA4335"
      d="M12 5.98c1.47 0 2.79.5 3.82 1.49l2.87-2.87A10 10 0 003.07 7.49l3.34 2.6C7.2 7.74 9.4 5.98 12 5.98z"
    />
  </svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg strokeWidth={3} {...p}>
    <path d="M5 12l5 5L20 7" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

export const IconCreditCard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 3h3a2 2 0 012 2v14a2 2 0 01-2 2h-3M10 17l-5-5 5-5M15 12H5" />
  </Svg>
);

export const IconShare = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
  </Svg>
);

export const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8a2 2 0 012-2h1l1.5-2h7L15 6h1a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    <circle cx="11" cy="12.5" r="3.2" />
  </Svg>
);

export const IconPencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 6.5l3 3" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);

export const IconSparkles = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3z" />
    <path d="M19 14l.9 2.4 2.4.9-2.4.9L19 21l-.9-2.4-2.4-.9 2.4-.9L19 14z" />
  </Svg>
);

export const IconSpinner = ({ className = "h-4 w-4" }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={`animate-spin ${className}`}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </Svg>
);

export const IconMoon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);
