import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, BookOpen, Home as HomeIcon } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../common/ThemeToggle';
import GithubIcon from '../common/GithubIcon';

export default function Header({ theme, toggleTheme }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isDocs = location.pathname.startsWith('/docs');

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 no-underline">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Shield size={18} />
          </div>
          <span className="font-semibold text-base text-zinc-900 dark:text-zinc-100">AuthORS</span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-inner">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all no-underline ${
              isHome
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <HomeIcon size={14} />
            <span>Overview</span>
          </Link>
          <Link
            to="/docs/overview"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all no-underline ${
              isDocs
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen size={14} />
            <span>Documentation</span>
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/adityajha-coder/AuthORS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium transition-all no-underline"
            title="GitHub Repository"
          >
            <GithubIcon size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />

          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 flex flex-col gap-2 shadow-2xl">
          <Link
            to="/"
            className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors ${
              isHome
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <HomeIcon size={16} />
            <span>Overview</span>
          </Link>
          <Link
            to="/docs/overview"
            className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors ${
              isDocs
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BookOpen size={16} />
            <span>Documentation</span>
          </Link>
          <a
            href="https://github.com/adityajha-coder/AuthORS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <GithubIcon size={16} />
            <span>GitHub Repository</span>
          </a>
        </div>
      )}
    </header>
  );
}
