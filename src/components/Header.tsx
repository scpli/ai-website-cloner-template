"use client";

import { useState } from "react";
import { HkteLogoSvg, ChevronDownSvg } from "@/components/icons";

const navItems = [
  { label: "香港優勢", href: "#" },
  { label: "居港須知", href: "#" },
  { label: "人才支援", href: "#" },
  { label: "就業資訊", href: "#" },
  { label: "在港營商", href: "#" },
  { label: "活動情報", href: "#" },
  { label: "最新消息", href: "#" },
];

const utilityLinks = [
  { label: "關於我們", href: "#" },
  { label: "常見問題", href: "#" },
  { label: "聯絡我們", href: "#" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <>
      <header id="header" className="fixed left-0 top-0 z-50 w-screen bg-white">
        {/* Desktop top bar - utility links */}
        <div className="hidden min-[1400px]:block w-full border-b border-[#e8e8e8]">
          <div className="mx-auto w-full max-w-[1438px] px-12">
            <div className="flex items-center justify-between h-[56px]">
              {/* Logo */}
              <a href="#" className="inline-block w-[140px] text-[#606060]">
                <HkteLogoSvg className="w-full h-auto" />
              </a>

              {/* Right side */}
              <div className="flex items-center gap-6">
                {/* Utility links */}
                <div className="flex items-center gap-4 text-[#363636] text-[13px]">
                  {utilityLinks.map((link) => (
                    <a key={link.label} href={link.href} className="hover:text-[#E00004] transition-colors">
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Language switcher */}
                <div className="relative">
                  <button
                    onClick={() => setLangOpen(!langOpen)}
                    className="flex items-center gap-1 text-sm text-[#363636] hover:text-[#E00004] transition-colors"
                  >
                    繁
                    <ChevronDownSvg className="w-3 h-3" />
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 top-full mt-1 rounded-lg bg-white shadow-lg border border-[#e8e8e8] py-1 min-w-[60px] z-50">
                      <a href="#" className="block px-4 py-1 text-sm text-[#363636] hover:bg-[#f5f5f5]">
                        繁
                      </a>
                      <a href="#" className="block px-4 py-1 text-sm text-[#363636] hover:bg-[#f5f5f5]">
                        EN
                      </a>
                      <a href="#" className="block px-4 py-1 text-sm text-[#363636] hover:bg-[#f5f5f5]">
                        简
                      </a>
                    </div>
                  )}
                </div>

                {/* Search */}
                <button className="text-[#363636] hover:text-[#E00004] transition-colors">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="bg-[#08415C]">
          <div className="mx-auto w-full max-w-[1438px] px-12">
            <div className="flex items-center justify-between h-[72px]">
              {/* Left - main nav */}
              <nav className="hidden min-[1400px]:flex items-center gap-8">
                {navItems.map((item) => (
                  <a key={item.label} href={item.href} className="text-white text-[15px] font-medium hover:opacity-80 transition-opacity">
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Right - current page title */}
              <div className="flex items-center gap-2 text-white text-xl font-bold">
                簽證資訊
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="min-[1400px]:hidden text-white p-2"
              >
                {mobileOpen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12h18M3 6h18M3 18h18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="min-[1400px]:hidden fixed inset-0 z-40 bg-white pt-[128px]">
          <div className="px-5 py-4 space-y-4">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="block text-[#363636] text-lg font-medium py-2 border-b border-[#e8e8e8]">
                {item.label}
              </a>
            ))}
            <div className="pt-4">
              {utilityLinks.map((link) => (
                <a key={link.label} href={link.href} className="block text-sm text-[#606060] py-1">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-[128px] min-[1400px]:h-[128px]" />
    </>
  );
}
