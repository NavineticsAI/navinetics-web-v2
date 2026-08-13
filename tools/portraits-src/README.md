# Portrait sources

`lee-graded.jpg` and `goerss-graded.jpg` are the old site's web exports with the
tone grade of §7 already applied, at their original dimensions (500×400 and
1000×800). They are kept here because **no camera originals exist for these two**
— these files are the most upstream version we have, and `tools/founder-portraits.py`
crops from them rather than from the shipped `public/` JPEGs, so re-running the
tool never stacks a second encode.

Do not overwrite them with anything from `public/`, and do not re-grade them —
they are the reference the other two portraits are matched to.

Bennet's and Oh's 2026 camera originals (`dr_benett_final.JPG`,
`dr_oh_tie_final.jpg`) are **not** in the repo — they are ~24 MB together. The
tool reads them from `~/Downloads` by default; override with `--originals`.
Keep them somewhere durable: without them those two cannot be rebuilt.

See `documentation/dev/shubham/website/11-founder-portraits.md`.
