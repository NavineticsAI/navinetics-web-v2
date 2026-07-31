/**
 * Partners and collaborators.
 *
 * PLACEHOLDER — the list below is empty on purpose. NaviNetics' public site
 * names Mayo Clinic and the Neural Engineering Laboratories as the company's
 * origin, but "we came out of X" and "X is a named partner" are different
 * claims, and the second needs both confirmation and, usually, permission to
 * use the other party's name and marks.
 *
 * Add records here and the Partners page switches from its placeholder state
 * to a logo wall automatically. Shape:
 *
 *   { id, name, kind, blurb, logo?, href? }
 *     kind: 'clinical' | 'research' | 'manufacturing' | 'distribution'
 */
export const partners = [];

/** What the placeholder promises while the list is empty. */
export const partnerKinds = [
  {
    kind: 'Clinical',
    body: 'Hospitals and surgical teams who use the devices and tell us what is wrong with them.',
  },
  {
    kind: 'Research',
    body: 'Laboratories and universities running the studies that turn a method into evidence.',
  },
  {
    kind: 'Manufacturing',
    body: 'Precision machining and materials partners who hold the tolerances the geometry depends on.',
  },
  {
    kind: 'Distribution',
    body: 'Partners bringing the systems to operating rooms outside our direct reach.',
  },
];
