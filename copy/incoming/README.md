# Drop reviewed documents here

A reviewed Word document arriving in this folder triggers
`.github/workflows/copy-review.yml`, which applies the edits and opens a pull
request. Nobody reviewing the copy needs the code, a checkout, or an account
here — they have the shared document and nothing else.

The document gets here by itself: a Power Automate flow in Microsoft 365
watches the shared OneDrive folder and commits the file when it is saved. The
setup is in `documentation/dev/shubham/website/15-copy-round-trip.md`.

Nothing in here is read by the website. The most recent `.docx` is the one the
workflow uses.
