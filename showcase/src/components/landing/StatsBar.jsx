const stats = [
  { value: '9 Layers', label: 'Defense Architecture' },
  { value: '17 Endpoints', label: 'Hardened Routes' },
  { value: 'AAL2', label: 'NIST SP 800-63B' },
  { value: 'RFC 6819 & 6238', label: 'Security Standards' },
  { value: 'SOC 2 Ready', label: 'Immutable Audit Trail' },
];

export default function StatsBar() {
  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl transition-colors">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 p-6 text-center flex flex-col justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
          >
            <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
              {stat.value}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
