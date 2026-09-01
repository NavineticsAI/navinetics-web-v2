/**
 * The media library.
 *
 * Two collections: the videos, and every photograph, render and figure the
 * site publishes. Each image carries the page it appears on, so the library is
 * a way into the site rather than a dead end — a reader who finds a picture
 * here can go and read what it illustrates.
 *
 * WHERE THE ENTRIES COME FROM. Not a directory listing. The list was built by
 * crawling the built site for every rendered image and then curating: marks,
 * logos, icons and UI chrome are excluded because a gallery is the wrong place
 * for a wordmark, and masters are excluded where an optimised sibling exists.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NOT HERE, deliberately
 *
 * SURGICAL FOOTAGE IS PUBLISHED HERE, on NaviNetics' instruction of
 * 2026-08-18, after both clips were reviewed frame by frame and what is in
 * them was reported. tools/media-review.mjs holds that review in full. Three
 * things about it remain open and are NaviNetics' to close:
 *
 *   · Consent. The operating-room clip shows an identifiable patient and
 *     identifiable staff, and at 22 s a fluoroscopy monitor carries
 *     handwritten annotation that may identify a patient.
 *   · Whose device it is. The frame in that clip is black with a "COLLAR ANG"
 *     arc, where the NRSS is anodized blue. Its caption therefore describes
 *     what is on screen and stops short of calling the instrument ours.
 *   · Surface scanning. The launch clip's slides at 44 s and 52 s name 3D
 *     surface scans, which this site is otherwise under standing instruction
 *     never to mention.
 *   · Audio. Both clips are served as supplied and both carry a sound track,
 *     which nobody has reviewed. An operating room is a room full of people
 *     talking. The first published pass happened to be silent — the canvas
 *     recorder that produced it drops audio — so this is new surface, not
 *     pre-existing.
 *
 * Poster frames are chosen deliberately. The still a visitor sees before
 * deciding to play shows the instrument, not the surgical field.
 *
 * TWO MAVEN FIGURES. fig-waveform and fig-fscv appear on the MAVEN and
 * neuromodulation pages but not in this library. They look like journal
 * figures and their permissions are unresolved. A library reads as "assets you
 * may reuse", which is a stronger claim than an inline citation, so they go in
 * when the permissions answer does.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { asset } from '../lib/asset.js';

import d1Hero from '../assets/d1/hero.webp';
import d1Detail from '../assets/d1/detail.webp';
import d1Head from '../assets/d1/head.webp';
import mavenDevice from '../assets/maven/device.webp';
import table from '../assets/or-tables/table.webp';
import swFusion from '../assets/software/fusion.webp';
import swNbar from '../assets/software/nbar.webp';
import swAcpc from '../assets/software/acpc.webp';
import swDti1 from '../assets/software/dti1.webp';
import swDti2 from '../assets/software/dti2.webp';
import swTarget from '../assets/software/target.webp';
import frameVideo from '../assets/education/02.1.web.mp4';
import framePoster from '../assets/education/02.1.web.poster.webp';
import orVideo from '../assets/media/or-footage.mp4';
import orPoster from '../assets/media/or-footage.poster.webp';
import launchVideo from '../assets/media/launch.mp4';
import launchPoster from '../assets/media/launch.poster.webp';

/** Where each asset is used. One place, so a route rename breaks once. */
const P = {
  d1: { to: '/products/d1-stereotactic-frame', label: 'NRSS' },
  tables: { to: '/products/carbon-fiber-surgical-tables', label: 'Surgical Tables' },
  maven: { to: '/products/maven-neuromodulation', label: 'MAVEN' },
  ai: { to: '/technology/navinetics-ai', label: 'NaviNetics AI' },
  neuro: { to: '/technology/neuromodulation', label: 'Neuromodulation' },
  education: { to: '/technology/education', label: 'Education' },
  founders: { to: '/company/our-founders', label: 'Our Founders' },
};

/** Videos. The first entry is the one the page leads with. */
export const videos = [
  {
    id: 'or-footage',
    title: 'In the operating room',
    src: orVideo,
    poster: orPoster,
    w: 720,
    h: 1280,
    length: '0:53',
    note: 'Surgical footage',
    /* Describes what is on screen and no more. The instrument in this clip is
       not the one the rest of the site shows — see the notice above. */
    caption: 'A stereotactic frame in use: the arc set on its collar, instruments laid out, and '
      + 'the trajectory taken down to target under fluoroscopy.',
  },
  {
    id: 'launch',
    title: 'The system, shown',
    src: launchVideo,
    poster: launchPoster,
    w: 720,
    h: 1280,
    length: '1:08',
    caption: 'A NaviNetics launch event: the instruments on the stand, the method presented, and '
      + 'the frame itself in hand.',
    page: P.d1,
  },
  {
    id: 'instrument-turned',
    title: 'The instrument, turned',
    src: frameVideo,
    poster: framePoster,
    w: 1280,
    h: 720,
    length: '0:16',
    caption: 'The stereotactic frame on a head model, turning, with a probe held on its '
      + 'trajectory as the arc moves around it. A render, not a photograph.',
    page: P.education,
  },
];

/**
 * Every photograph, render and figure the site publishes.
 *
 * `page` is where the image is used, not where it came from.
 */
export const images = [
  /* ── Devices ─────────────────────────────────────────────────────────── */
  {
    id: 'nrss-hero',
    title: 'NRSS, three-quarter view',
    src: d1Hero, w: 1027, h: 1565, category: 'Devices', page: P.d1,
    caption: 'The frame ray traced from its own assembly CAD, in the anodized blue the '
      + 'instrument is finished in.',
  },
  {
    id: 'nrss-detail',
    title: 'NRSS from the opposite side',
    src: d1Detail, w: 759, h: 1134, category: 'Devices', page: P.d1,
    caption: 'The same model and the same studio, one camera further round.',
  },
  {
    id: 'nrss-head',
    title: 'NRSS on a head model',
    src: d1Head, w: 444, h: 1042, category: 'Devices', page: P.d1,
    caption: 'The frame fitted to an anatomical head model, with the face left clear.',
  },
  {
    id: 'nrss-system',
    title: 'The NRSS system, laid out',
    src: asset('/DSC05397-1024x695.jpg'), w: 1024, h: 695, category: 'Devices', page: P.d1,
    caption: 'Frame, localizers, microdrive and accessories in the case they ship in.',
  },
  {
    id: 'anchor-key',
    title: 'Skull Anchor Key on a head model',
    src: asset('/model-head-clean-750x998-1-451x600.png'), w: 451, h: 600,
    category: 'Devices', page: P.d1,
    caption: 'The Skull Anchor Key fixes near the top of the skull, which is what keeps the face '
      + 'unobstructed.',
  },
  {
    id: 'microdrive',
    title: 'Mechanical microdrive',
    src: asset('/microdrive-image-1024x797.png'), w: 1024, h: 797, category: 'Devices', page: P.d1,
    caption: 'Advances electrodes and leads along the trajectory the arc has set.',
  },
  {
    id: 'maven-device',
    title: 'MAVEN',
    src: mavenDevice, w: 620, h: 869, category: 'Devices', page: P.maven,
    caption: 'The neuromodulation instrument: neurochemical and electrophysiological recording '
      + 'with stimulation, on one timebase.',
  },
  {
    id: 'table-hero',
    title: 'Carbon fiber operating table',
    src: table, w: 1500, h: 571, category: 'Devices', page: P.tables,
    caption: 'A carbon-fiber tabletop for imaging-guided procedures.',
  },

  /* ── Software ────────────────────────────────────────────────────────── */
  {
    id: 'sw-fusion',
    title: 'CT and MR in one space',
    src: swFusion, w: 2400, h: 1316, category: 'Software', page: P.ai,
    caption: 'The stereotactic CT carries the frame and the MR carries the anatomy; fusion puts '
      + 'them in the same coordinate space.',
  },
  {
    id: 'sw-nbar',
    title: 'N-Bar detection',
    src: swNbar, w: 1399, h: 1124, category: 'Software', page: P.ai,
    caption: 'The localizer rods found in the scan, three points per plate on every slice.',
  },
  {
    id: 'sw-acpc',
    title: 'AC-PC landmarks',
    src: swAcpc, w: 2400, h: 907, category: 'Software', page: P.ai,
    caption: 'The anterior and posterior commissures placed, which is what an indirect target is '
      + 'measured from.',
  },
  {
    id: 'sw-dti1',
    title: 'Tractography',
    src: swDti1, w: 1152, h: 1112, category: 'Software', page: P.ai,
    caption: 'Fiber tracts reconstructed from diffusion imaging.',
  },
  {
    id: 'sw-dti2',
    title: 'Tractography in the surgical plan',
    src: swDti2, w: 2126, h: 1137, category: 'Software', page: P.ai,
    caption: 'The tracts shown against the planned trajectory, so an approach can be judged '
      + 'against what it passes.',
  },
  {
    id: 'sw-target',
    title: 'Target and trajectory',
    src: swTarget, w: 2400, h: 912, category: 'Software', page: P.ai,
    caption: 'A target set and the approach to it, in the workspace.',
  },


];

/** Filter chips, in the order the page shows them. */
export const imageCategories = ['Devices', 'Software'];
