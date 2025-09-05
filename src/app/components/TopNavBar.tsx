"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cx } from "lib/cx";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b border-black px-3 lg:px-12 bg-white/80 backdrop-blur-sm sticky top-0 z-50 font-mono",
        isHomePage && "bg-dot"
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <Link href="/" className="group">
          <span className="sr-only">CV Builder</span>
          <div className="relative">
            <span className="text-xl font-bold terminal-text group-hover:scale-105 transition-transform duration-200">
              cv---maker
            </span>
          </div>
        </Link>
        <nav
          aria-label="Site Nav Bar"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Link
            href="/resume-builder"
            className={cx(
              "rounded-none px-3 py-2 terminal-text hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white transition-all duration-200 font-medium border border-transparent hover:border-black",
              pathName === "/resume-builder" && "bg-black text-white"
            )}
          >
            Resume
          </Link>
          <Link
            href="/cover"
            className={cx(
              "rounded-none px-3 py-2 terminal-text hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white transition-all duration-200 font-medium border border-transparent hover:border-black",
              pathName === "/cover" && "bg-black text-white"
            )}
          >
            Cover Letter
          </Link>
          <Link
            href="https://filippo---raw.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-none px-3 py-2 terminal-text hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white transition-all duration-200 font-medium border border-transparent hover:border-black"
          >
            filippo---raw
          </Link>
        </nav>
      </div>
    </header>
  );
};
