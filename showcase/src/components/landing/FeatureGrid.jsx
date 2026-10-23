import {
  Lock,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  FileText,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Lock,
    title: 'Argon2id Password Storage',
    description: '19MB memory-hard hashing resistant to GPU/ASIC attacks, with automatic lazy-rehash migration from legacy Bcrypt.',
  },
  {
    icon: RefreshCw,
    title: 'RFC 6819 Token Theft Detection',
    description: 'Lineage tracking via familyId. If a revoked refresh token is presented, the entire session family is instantly wiped.',
  },
  {
    icon: Smartphone,
    title: 'RFC 6238 TOTP Two-Factor Auth',
    description: 'Full authenticator app support with secrets encrypted at rest via AES-256-GCM and 10 single-use hashed recovery codes.',
  },
  {
    icon: ShieldCheck,
    title: 'Scoped Pre-Auth Token Gate',
    description: '5-minute scoped JWT issued after password verification. Full session access is denied until the 2FA code is confirmed.',
  },
  {
    icon: FileText,
    title: 'Immutable Audit Trail',
    description: 'SOC 2-ready append-only MongoDB collection recording IP, user-agent, token rotations, and attack detections.',
  },
  {
    icon: Globe,
    title: 'Google & GitHub OAuth 2.0',
    description: 'One-click social login via Passport strategies with automatic verified email detection and existing account linking.',
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Defense-in-Depth
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
          Core Security Defenses
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Engineered against real-world attack vectors: credential stuffing, token replay theft, and authentication bypass.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 hover:-translate-y-1 transition-all duration-200 flex flex-col shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 shadow-inner">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
