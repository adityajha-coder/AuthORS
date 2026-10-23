import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const compliance = [
  { label: 'NIST SP 800-63B AAL2', status: 'Compliant' },
  { label: 'OWASP Top 10 (2021)', status: 'Mitigated' },
  { label: 'SOC 2 Audit Trail', status: 'Ready' },
  { label: 'RFC 6819', status: 'Implemented' },
  { label: 'RFC 6238', status: 'Implemented' },
];

export default function ComplianceBadges() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-16">
      <motion.div
        className="flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {compliance.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
              color: 'var(--color-success)',
              background: 'color-mix(in srgb, var(--color-success) 5%, transparent)',
            }}
          >
            <CheckCircle size={13} />
            <span className="font-medium">{item.label}</span>
            <span style={{ color: 'var(--color-text-subtle)' }}>·</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{item.status}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
