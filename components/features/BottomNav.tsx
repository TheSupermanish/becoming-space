'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Wind, BookOpen, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Feed' },
  { href: '/blog', icon: FileText, label: 'Blog' },
  { href: '/breathe', icon: Wind, label: 'Breathe' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
  { href: '/checkin', icon: Sparkles, label: 'Check-in' },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on login page or blog editor pages
  if (
    pathname === '/login' ||
    pathname === '/' ||
    pathname === '/blog/new' ||
    pathname.startsWith('/blog/edit/')
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-sand/50 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-around items-center py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/blog'
              ? pathname.startsWith('/blog')
              : pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-all ${
                  isActive
                    ? 'text-earth'
                    : 'text-stone/50 hover:text-stone'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-earth' : ''} />
                <span className={`text-[10px] font-medium ${isActive ? 'text-earth' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

