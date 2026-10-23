export const docsManifest = [
  {
    category: 'Getting Started',
    items: [
      { slug: 'overview', title: 'Overview', file: '01-overview' },
      { slug: 'quickstart', title: 'Quick Start & Setup', file: '02-quickstart' },
    ],
  },
  {
    category: 'Architecture',
    items: [
      { slug: 'architecture', title: 'Project Structure', file: '03-architecture' },
    ],
  },
  {
    category: 'Security Architecture',
    items: [
      { slug: 'security-layers', title: '9-Layer Defense Model', file: '04-security-layers' },
      { slug: 'nist-compliance', title: 'NIST AAL2 Compliance', file: '05-nist-compliance' },
      { slug: 'owasp-mitigations', title: 'OWASP Top 10 Mitigations', file: '06-owasp-mitigations' },
    ],
  },
  {
    category: 'Deep Dives',
    items: [
      { slug: 'rfc6819-token-defense', title: 'RFC 6819 — Token Theft', file: '07-rfc6819-token-defense' },
      { slug: 'rfc6238-totp-2fa', title: 'RFC 6238 — TOTP 2FA', file: '08-rfc6238-totp-2fa' },
    ],
  },
  {
    category: 'API Reference',
    items: [
      { slug: 'api-reference', title: 'All Endpoints', file: '09-api-reference' },
    ],
  },
  {
    category: 'Evolution',
    items: [
      { slug: 'version-history', title: 'Version History', file: '10-version-evolution' },
      { slug: 'roadmap', title: 'Roadmap & TODO', file: '11-roadmap' },
    ],
  },
];

// flat list helper
export function getAllDocs() {
  return docsManifest.flatMap(cat => cat.items);
}

// find doc by slug
export function getDocBySlug(slug) {
  return getAllDocs().find(d => d.slug === slug);
}
