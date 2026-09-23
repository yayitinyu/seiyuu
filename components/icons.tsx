import { wavePath } from "@/lib/wave";

export function Arrow({
  external = false,
  className = "",
}: {
  external?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="25"
      height="20"
      viewBox="0 0 25 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={external ? "M6 15 19 2M6 2h13v13" : "M1 10h22m-7-7 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
export function SearchIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
export function ThemeIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor" />
      <path
        d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l1.5 1.5m13 13L20 20M4 20l1.5-1.5m13-13L20 4"
        stroke="currentColor"
      />
    </svg>
  );
}
export function Wave({ large = false }: { large?: boolean }) {
  const count = large ? 90 : 32;
  return (
    <svg
      className={large ? "wave-art" : "wave-small"}
      viewBox={`0 0 ${count * 5} 90`}
      fill="none"
      aria-hidden="true"
    >
      <path d={wavePath(count)} stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
