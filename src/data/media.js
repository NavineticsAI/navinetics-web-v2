/**
 * Media gallery — video and image library.
 *
 * Items below reference existing site assets so the gallery is functional
 * today. Real photography, surgical footage and animations replace them as
 * they become available.
 *
 * Shape:
 *   { id, title, kind, category, src, poster?, caption }
 *     kind:     'image' | 'video'
 *     category: drives the filter chips, derived automatically below
 *
 * NOTE ON SURGICAL FOOTAGE: any clinical video needs patient consent and,
 * depending on content, an interstitial warning. None is included here.
 */
/**
 * ASSET WARNING — do not use /stereotactic_halo.png or /halo_ring.png.
 * The first carries a competitor's trademark (Stryker) on the device and
 * appears to be an AI render; the second is an unbranded AI render of a
 * base head ring — the component NaviNetics' anchor key replaces. Neither
 * depicts a NaviNetics product. Use photography of actual devices.
 */

export const mediaItems = [
  {
    id: 'anchor-key-model',
    title: 'Skull anchor key on anatomical model',
    kind: 'image',
    category: 'Devices',
    src: '/model-head-clean-750x998-1-451x600.png',
    fit: 'contain',
    caption: 'The anchor key replaces the base head ring, leaving the face unobstructed.',
  },
  {
    id: 'frame-assembly',
    title: 'D1 stereotactic frame',
    kind: 'image',
    category: 'Devices',
    src: '/DSC05397-1024x695.jpg',
    fit: 'cover',
    caption: 'Arc-centred frame assembly.',
  },
  {
    id: 'microdrive',
    title: 'Mechanical microdrive',
    kind: 'image',
    category: 'Devices',
    src: '/microdrive-image-1024x797.png',
    fit: 'contain',
    caption: 'Fine advancement of electrodes and leads along the planned trajectory.',
  },
  {
    id: 'wincs',
    title: 'WINCS Harmoni device',
    kind: 'image',
    category: 'Research',
    src: '/WINC-Harmoni-Device.png',
    fit: 'contain',
    caption: 'Wireless neurochemical and electrophysiological recording.',
  },
  {
    id: 'wincs-preclinical',
    title: 'WINCS in a preclinical model',
    kind: 'image',
    category: 'Research',
    src: '/WINCS-Swine-Model-1024x668.png',
    fit: 'cover',
    caption: 'Preclinical application.',
  },
  {
    id: 'probe',
    title: 'Sensing probe',
    kind: 'image',
    category: 'Research',
    src: '/surgical_probe.png',
    fit: 'contain',
    caption: 'Carbon-fibre microelectrode assembly.',
  },
];

export const mediaCategories = [...new Set(mediaItems.map((m) => m.category))].sort();
