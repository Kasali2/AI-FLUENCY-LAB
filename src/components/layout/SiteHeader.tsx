import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";

const NAV = [
  { href: "/lab", label: "Lab" },
  { href: "/learn", label: "Learn" },
  { href: "/progress", label: "Progress" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="AI Fluency Lab — home"
        >
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg border border-glow-400/40 bg-glow-400/10 font-mono text-[11px] font-bold text-glow-300"
          >
            FL
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-mist-100">
              AI Fluency Lab
            </span>
            <span className="mt-0.5 hidden text-[11px] text-mist-400 sm:block">
              Think with AI
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-mist-300 transition-colors hover:bg-ink-800/80 hover:text-mist-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto md:ml-0">
          <ButtonLink href="/lab" size="sm">
            Start an experiment
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
