"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const links = ["Platform", "Features", "Technology", "Security", "About"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5" aria-label="Primary navigation">
      <nav
        className={cn(
          "relative mx-auto mt-3 flex h-[88px] max-w-[1440px] items-center justify-between overflow-hidden rounded-[34px] border px-6 transition duration-500 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.24)_18%,rgba(255,255,255,0.18)_72%,rgba(255,255,255,0.06))] before:transition-opacity before:duration-500 before:content-[''] sm:px-10 lg:px-[72px]",
          scrolled
            ? "border-white/45 bg-white/28 shadow-[0_18px_70px_rgba(17,24,39,0.05)] backdrop-blur-2xl before:opacity-80"
            : "border-transparent bg-transparent shadow-none backdrop-blur-0 before:opacity-0",
        )}
      >
        <a href="#top" className="relative z-10 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/35">
          <Image
            src="/vantage-logo.png"
            alt="Vantage"
            width={150}
            height={48}
            priority
            className="h-auto w-[120px] sm:w-[130px] lg:w-[140px]"
          />
        </a>

        <div className="absolute left-1/2 z-10 hidden -translate-x-1/2 items-center gap-11 lg:flex">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className={cn(
                "rounded-full text-[17px] font-semibold tracking-[-0.035em] text-[rgba(17,24,39,0.82)] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/35",
                scrolled ? "hover:text-[#111827]" : "hover:text-[#111827]",
              )}
            >
              {link}
            </a>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="relative z-10 hidden items-center justify-center gap-2 rounded-[20px] bg-white px-[34px] py-[18px] text-[17px] font-semibold tracking-[-0.035em] text-[#111827] shadow-[0_18px_48px_rgba(17,24,39,0.08)] transition duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_58px_rgba(17,24,39,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f78ff]/35 sm:inline-flex"
        >
          Open Dashboard
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </nav>
    </header>
  );
}
