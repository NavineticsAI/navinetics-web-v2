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
 * ASSET NOTE — four fabricated device images were deleted from public/ on
 * 2026-08-03: stereotactic_halo.png, halo_ring.png, skull_anchor.png and
 * surgical_probe.png. All four were AI renders of devices that do not exist,
 * carrying fake CE marks and invented model, serial and lot numbers; one bore
 * a competitor's trademark (Stryker) and one a fabricated Ø0.8 mm dimension
 * callout. surgical_probe.png was live here and in MAVEN's gallery, captioned
 * as a carbon-fiber microelectrode assembly, which it was not.
 *
 * A fabricated specification or CE mark on a medical device company's site is
 * a regulatory problem, not a stock-photo problem. Use photography of actual
 * devices, or renders derived from our own CAD — see tools/d1-frame.mjs.
 */

import { asset } from '../lib/asset.js';

export const mediaItems = [
  {
    id: 'anchor-key-model',
    title: 'Skull Anchor Key on anatomical model',
    kind: 'image',
    category: 'Devices',
    src: asset('/model-head-clean-750x998-1-451x600.png'),
    fit: 'contain',
    caption: 'The Skull Anchor Key leaves the face unobstructed.',
  },
  {
    id: 'frame-assembly',
    title: 'NRSS stereotactic frame',
    kind: 'image',
    category: 'Devices',
    src: asset('/DSC05397-1024x695.jpg'),
    fit: 'cover',
    caption: 'Arc-centered frame assembly.',
  },
  {
    id: 'microdrive',
    title: 'Mechanical microdrive',
    kind: 'image',
    category: 'Devices',
    src: asset('/microdrive-image-1024x797.png'),
    fit: 'contain',
    caption: 'Fine advancement of electrodes and leads along the planned trajectory.',
  },
  {
    id: 'wincs',
    title: 'WINCS Harmoni device',
    kind: 'image',
    category: 'Research',
    src: asset('/WINC-Harmoni-Device.png'),
    fit: 'contain',
    caption: 'Wireless neurochemical and electrophysiological recording.',
  },
  {
    id: 'wincs-preclinical',
    title: 'WINCS in a preclinical model',
    kind: 'image',
    category: 'Research',
    src: asset('/WINCS-Swine-Model-1024x668.png'),
    fit: 'cover',
    caption: 'Preclinical application.',
  },
];

export const mediaCategories = [...new Set(mediaItems.map((m) => m.category))].sort();
