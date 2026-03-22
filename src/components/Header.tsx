'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/about', label: 'T' },
  { href: '/research', label: 'R' },
  { href: '/design', label: 'D' },
  { href: '/news', label: 'N' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-lab-50/90 backdrop-blur-md border-b border-lab-200/60">
      <div className="section-wrapper flex items-center justify-between h-16 md:h-18">
        {/* 로고 */}
        <Link
          href="/"
          className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-lab-900 hover:text-lab-700 transition-colors"
        >
          PlaceLab
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive
                    ? 'text-lab-900'
                    : 'text-lab-400 hover:text-lab-700'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-lab-700"
          aria-label="메뉴 열기"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-lab-200 bg-lab-50">
          <div className="section-wrapper py-6 flex flex-col gap-4">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium text-lab-700 hover:text-lab-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
