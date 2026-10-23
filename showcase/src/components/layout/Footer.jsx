import { Shield } from 'lucide-react';
import GithubIcon from '../common/GithubIcon';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-8 px-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-blue-600 dark:text-blue-400" />
          <span>
            <strong className="text-zinc-900 dark:text-zinc-200">AuthORS</strong> — High-End Authentication Engine • ISC Licensed
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/adityajha-coder/AuthORS"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors no-underline"
          >
            <GithubIcon size={14} />
            <span>Repository</span>
          </a>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="font-mono text-zinc-500">v3.0.0</span>
        </div>
      </div>
    </footer>
  );
}
