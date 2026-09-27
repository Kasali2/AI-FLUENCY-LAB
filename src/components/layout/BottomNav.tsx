"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconAbout,
  IconHome,
  IconLab,
  IconLearn,
  IconProgress,
} from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Home", Icon: IconHome },
  { href: "/lab", label: "Lab", Icon: IconLab },
  { href: "/learn", label: "Learn", Icon: IconLearn },
  { href: "/progress", label: "Progress", Icon: IconProgress },
  { href: "/about", label: "About", Icon: IconAbout },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/95 backdrop-blur-xl md:hidden"
    >
      <ul className="safe-bottom mx-auto grid max-w-lg grid-cols-5 px-1 pt-1.5">
        {ITEMS.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-glow-300"
                    : "text-mist-400 hover:bg-ink-900 hover:text-mist-200"
                }`}
              >
                <Icon
                  width={21}
                  height={21}
                  className={active ? "text-glow-400" : undefined}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
