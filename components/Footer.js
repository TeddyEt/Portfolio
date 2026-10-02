'use client';

import { ArrowUp, UserCog } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-mono text-[10px] font-bold">
            TE
          </span>
          <p>© {currentYear} Tewodros Endalamaw • Built with React, Next.js & Node.js</p>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <UserCog className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
          <a
            href="https://github.com/TeddyEt/Portfolio"
            target="_blank"
            rel="noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            GitHub Repo
          </a>
          <button
            onClick={scrollToTop}
            type="button"
            className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
