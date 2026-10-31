import type { ReactNode } from "react";

type IconProps = { className?: string };

function Icon({ className = "size-5", children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 4.5v15l12-7.5z" fill="currentColor" />
  </Icon>
);
export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 5v14M16 5v14" strokeWidth="3.5" />
  </Icon>
);
export const PrevIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 5v14L8 12z" fill="currentColor" />
    <path d="M5 5v14" />
  </Icon>
);
export const NextIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5v14l11-7z" fill="currentColor" />
    <path d="M19 5v14" />
  </Icon>
);
export const ShuffleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7h3.5c5 0 6 10 11 10H21M3 17h3.5c1.6 0 2.8-1 3.8-2.4M13.7 9.4C14.7 8 15.9 7 17.5 7H21" />
    <path d="m18 4 3 3-3 3M18 14l3 3-3 3" />
  </Icon>
);
export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </Icon>
);
export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Icon {...p}>
    <path
      d="M12 20s-7.5-4.6-9-9.3C2 7.3 4.2 4.5 7.3 4.5c2 0 3.7 1 4.7 2.8 1-1.8 2.7-2.8 4.7-2.8 3.1 0 5.3 2.8 4.3 6.2-1.5 4.7-9 9.3-9 9.3z"
      fill={filled ? "currentColor" : "none"}
    />
  </Icon>
);
export const MoreIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5.5h.01M12 12h.01M12 18.5h.01" strokeWidth="3" />
  </Icon>
);
export const LibraryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4v16M10 4v16M15 4.5 20 20" />
  </Icon>
);
export const BackIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m14.5 5-7 7 7 7" />
  </Icon>
);
export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Icon>
);
export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
  </Icon>
);
export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);
export const RepeatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m17 2.5 3.5 3.5L17 9.5" />
    <path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5" />
    <path d="m7 21.5-3.5-3.5L7 14.5" />
    <path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5" />
  </Icon>
);
export const VolumeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M11 5 6.5 9H3v6h3.5l4.5 4z" />
    <path d="M15.5 9a4.5 4.5 0 0 1 0 6" />
    <path d="M18.5 6.5a8 8 0 0 1 0 11" />
  </Icon>
);
