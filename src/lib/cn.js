import clsx from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge does not read our `@theme`, so it has no idea that `text-d2`
 * is a font size. Faced with an unknown `text-*` it guesses, and it guesses
 * color — so `cn('text-d2', 'text-ink')` resolves to just `text-ink` and the
 * heading silently renders at the inherited size.
 *
 * This is the same fault that broke every eyebrow on the site once already.
 * That was patched by renaming `.text-eyebrow` out of the `text-*` namespace,
 * which fixed one token and left `hero`, `d1`, `d2` and `lead` to fail the
 * same way — quietly, and only when a color happened to sit beside them.
 *
 * Declaring them here fixes every call site at once, and any font size added
 * to `@theme` in future must be added to this list too.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['hero', 'd1', 'd2', 'lead', 'eyebrow'] }],
    },
  },
});

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
