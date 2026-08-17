# BUG-129 · MAVEN and NaviNetics AI hold the main thread at ~95%

**Author:** shubhvmhaske
**Status:** Open
**Severity:** Major — the page is readable, and every interaction on it waits
**Area:** Website · `/products/maven-neuromodulation`, `/technology/navinetics-ai`
**Supersedes:** BUG-128, which named four routes; two of them are fixed

---

## What happens

Both routes sit at roughly 95% of a throttled CPU **with the page doing nothing**, and run at
5.7 and 11.7 frames per second in WebKit with nothing moving on screen.

Consequence: nothing on either page can appear before the next frame. At 5.7fps a frame lands every
175ms, so a tap whose handler costs 1ms still takes that long to show anything, and a scroll-reveal
needing a run of frames inherits the wait several times over. It reads as the page being stuck.

## Reproduce

```
npm run build && npx vite preview --port 4319 --strictPort
node tools/check-busy-cause.mjs      # share of a 5s idle window in long tasks, per route
node tools/check-fps-webkit.mjs      # frame cadence in real WebKit, idle and scrolling
```

## What is known

`check-busy-cause.mjs` isolates the cause by removing one suspect at a time:

| Route | as shipped | no logo | **no canvas** |
|---|---|---|---|
| `/products/maven-neuromodulation` | 94.4% | 92.0% | **1.0%** |
| `/technology/navinetics-ai` | 8.7% | 3.5% | **0%** |
| `/` | 0% | 0% | 0% |

**The canvases are the entire cost.** Not the logo, not `backdrop-filter`, not script — all three
were ruled out by A/B on the same page in the same session.

## What has already been tried, and did not fix it

Recording these so nobody repeats them:

- **MAVEN's hero was gated on visibility and capped at 30fps.** It had been rewriting ten style
  properties across five elements every frame, uncapped, for as long as the page was open. Correct
  fix, real saving elsewhere, **did not move this number**.
- **The voltammogram field was rebuilt pixel by pixel every frame** — 232 × 132, each pixel looping
  over Gaussian lobes calling `Math.exp`. The lobes depend only on position, the divider only on the
  row, and the striation was recomputed 132 times per frame for the same 232 values. All three are
  now lookup tables. Arithmetically identical output. **Did not move this number either.**

So the cost is a canvas on those pages that has not yet been identified. The likely remaining
candidates are the `ScienceBand` scenes on MAVEN and the volume renderer on the AI page — neither has
been isolated individually.

## Next step

Isolate per-canvas rather than per-page: hide one `<canvas>` at a time and re-measure. The tooling
already supports this pattern; it needs a per-element variant of the `no canvas` column.

## Not to do

**Do not remove the scenes.** They are the argument of both pages. The two fixes above show the
pattern that works: find the work that is being repeated when nothing has changed, and stop repeating
it. Both were invisible to a reader and neither cost a frame of animation.

## Related

- `documentation/dev/shubham/website/PR-TICKET-founders-and-copy.md` §11 — the whole performance
  investigation, including the four wrong guesses before the cause was found
- `tools/check-busy-cause.mjs`, `tools/check-fps-webkit.mjs`
