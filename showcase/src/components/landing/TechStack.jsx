const techs = [
  { name: 'Node.js', role: 'Runtime Environment', version: 'v20+ LTS' },
  { name: 'Express', role: 'HTTP Web Engine', version: 'v5.x' },
  { name: 'MongoDB', role: 'Data Layer & TTL Indexes', version: 'Mongoose' },
  { name: 'Argon2id', role: 'Password Hashing KDF', version: '19MB Cost' },
  { name: 'JWT & Cookies', role: 'Dual-Token Architecture', version: 'httpOnly Strict' },
  { name: 'Zod', role: 'Schema & Sanitization', version: 'Runtime' },
  { name: 'Helmet', role: 'HTTP Security Headers', version: '11+ Directives' },
  { name: 'Passport.js', role: 'Google & GitHub OAuth', version: 'OAuth 2.0' },
  { name: 'otplib & QRCode', role: 'TOTP 2FA Verification', version: 'RFC 6238' },
  { name: 'Node Crypto', role: 'AES-256-GCM & CSPRNG', version: 'Native' },
];

export default function TechStack() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Stack
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
          Engineered With
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Modern cryptographic libraries, battle-tested middleware, and standard protocols.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {techs.map((tech, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                {tech.name}
              </span>
              <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                {tech.version}
              </span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
              {tech.role}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
