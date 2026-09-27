import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width={20}
      height={20}
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconHome = (props: IconProps) => (
  <Base {...props}>
    <path d="M3 10.4 12 3l9 7.4" />
    <path d="M5.5 9.4V20h13V9.4" />
    <path d="M9.5 20v-5.5h5V20" />
  </Base>
);

export const IconLab = (props: IconProps) => (
  <Base {...props}>
    <path d="M9 3h6" />
    <path d="M10 3v6.2L5.4 17A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.8-3L14 9.2V3" />
    <path d="M7.6 14.5h8.8" />
  </Base>
);

export const IconLearn = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 5.5A2 2 0 0 1 6 3.5h5v16H6a2 2 0 0 0-2 2z" />
    <path d="M20 5.5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z" />
  </Base>
);

export const IconProgress = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Base>
);

export const IconAbout = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 7.75h.01" />
  </Base>
);

export const IconArrowRight = (props: IconProps) => (
  <Base {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Base>
);

export const IconCheck = (props: IconProps) => (
  <Base {...props}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Base>
);

export const IconSpark = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3v4" />
    <path d="M12 17v4" />
    <path d="M3 12h4" />
    <path d="M17 12h4" />
    <path d="m6.2 6.2 2.4 2.4" />
    <path d="m15.4 15.4 2.4 2.4" />
    <path d="m17.8 6.2-2.4 2.4" />
    <path d="m8.6 15.4-2.4 2.4" />
  </Base>
);

export const IconTarget = (props: IconProps) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </Base>
);

export const IconShield = (props: IconProps) => (
  <Base {...props}>
    <path d="M12 3.5 5 6v6c0 4 3 6.8 7 8.5 4-1.7 7-4.5 7-8.5V6z" />
    <path d="m9 12 2 2 4-4.5" />
  </Base>
);

export const IconRefresh = (props: IconProps) => (
  <Base {...props}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Base>
);

export const IconWrench = (props: IconProps) => (
  <Base {...props}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5l-8.4 8.4a2.6 2.6 0 0 1-3.7-3.7z" />
    <path d="M14.5 6.5 17 4l3 3-2.5 2.5" />
  </Base>
);
