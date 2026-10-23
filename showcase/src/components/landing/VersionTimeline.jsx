import { CheckCircle2 } from 'lucide-react';

const versions = [
  {
    version: 'v1.0.0',
    tag: 'Baseline',
    status: 'Deprecated',
    highlights: [
      'SHA-256 password hashing (fast single-pass)',
      'Basic access token issuance',
      'Email OTP verification',
      'Single device session state',
    ],
  },
  {
    version: 'v1.5.0',
    tag: 'Hardened',
    status: 'Superseded',
    highlights: [
      'Bcrypt password hashing (12 salt rounds)',
      'Zod request validation & payload sanitization',
      'Rate-limiting middleware on auth endpoints',
      'Helmet HTTP security headers & strict CORS',
    ],
  },
  {
    version: 'v2.0.0',
    tag: 'Identity Expansion',
    status: 'Superseded',
    highlights: [
      'Google & GitHub OAuth 2.0 via Passport',
      '32-byte CSPRNG password reset with TTL',
      'Basic refresh token rotation',
      'Modular architecture separation',
    ],
  },
  {
    version: 'v3.0.0',
    tag: 'Enterprise Defense',
    status: 'Current Release',
    isCurrent: true,
    highlights: [
      'Argon2id (19MB memory-hard) with zero-downtime lazy rehash',
      'RFC 6819 token family lineage tracking & reuse theft detection',
      'RFC 6238 TOTP 2FA with AES-256-GCM encrypted secrets at rest',
      'Scoped 5-minute Pre-Auth JWT server gate',
      '10 single-use hashed recovery backup codes',
      'Append-only immutable audit trail in MongoDB (SOC 2)',
    ],
  },
];

export default function VersionTimeline() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Evolution
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
          Version Progression
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Engineered systematically to resolve critical security vulnerabilities at each milestone.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {versions.map((v) => (
          <div
            key={v.version}
            className={`p-5 rounded-2xl flex flex-col transition-all duration-200 ${
              v.isCurrent
                ? 'bg-blue-50/40 dark:bg-zinc-900/90 border-2 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.08)] dark:shadow-[0_0_35px_rgba(59,130,246,0.15)] relative'
                : 'bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm'
            }`}
          >
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {v.version}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    v.isCurrent
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50'
                  }`}
                >
                  {v.tag}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {v.status}
              </span>
            </div>

            <ul className="space-y-2.5">
              {v.highlights.map((h, j) => (
                <li key={j} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  <CheckCircle2
                    size={14}
                    className={`shrink-0 mt-0.5 ${v.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500'}`}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
