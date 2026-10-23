import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import GithubIcon from '../common/GithubIcon';

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-500/10 dark:bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.15] mb-5">
          Enterprise Authentication.{' '}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Built for Real Threats.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
          A production-ready Node.js, Express, and MongoDB backend featuring Argon2id memory-hard hashing,
          RFC 6819 token theft detection, and TOTP 2FA with AES-256-GCM encrypted secrets.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <Link
            to="/docs/overview"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm hover:shadow-lg transition-all no-underline"
          >
            <span>Read Documentation</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="https://github.com/adityajha-coder/AuthORS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all no-underline shadow-sm"
          >
            <GithubIcon size={16} />
            <span>GitHub Repository</span>
          </a>
        </div>

        {/* Guarantee Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800/80 pt-6 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>NIST SP 800-63B AAL2</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>OWASP Top 10 Defenses</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>SOC 2 Audit Trail</span>
          </div>
        </div>
      </div>
    </section>
  );
}
