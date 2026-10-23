export default function ArchitectureDiagram() {
  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">
          Pipeline Overview
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
          9-Layer Security Architecture
        </h2>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Every inbound request navigates a multi-tier pipeline before touching application business logic.
        </p>
      </div>

      {/* Frame */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xl transition-colors">
        <div className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            auth_security_layers.png
          </span>
        </div>
        <div className="p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center transition-colors">
          <img
            src="/assets/security_layers.png"
            alt="AuthORS 9-layer security architecture pipeline"
            className="rounded-xl max-w-full h-auto shadow-md"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
