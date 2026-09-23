/**
 * Site identity + global copy.
 * Replace placeholder contact details with real ones before publishing.
 */
export const site = {
  brand: 'A System in Motion',
  initials: 'SYS',
  year: new Date().getFullYear(),
  /** Placeholder — swap for the real address. */
  email: 'hello@yourdomain.com',
  tagline: 'Design is a system in motion.',
  /** Placeholder profiles — set a real url (or "" to hide a link). */
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { label: 'Are.na', url: 'https://www.are.na/' },
  ],
  nav: [
    { id: 'laboratory', label: 'Experiments', index: '01' },
    { id: 'transformation', label: 'System', index: '02' },
    { id: 'work', label: 'Work', index: '03' },
    { id: 'techniques', label: 'Techniques', index: '04' },
    { id: 'contact', label: 'Contact', index: '05' },
  ],
} as const

export type NavItem = (typeof site.nav)[number]
