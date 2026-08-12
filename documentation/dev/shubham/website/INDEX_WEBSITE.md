# INDEX_WEBSITE

**Author:** shubhvmhaske
**Branch:** `site-fixes-2026-08` → `main`
**Status:** ready to publish

Publication pack for the website repair and audit work. Format follows
`documentation/dev/shubham/TICKET_PUBLICATION_FLOW.md` in `navinetics-ai-suite`.

The drafting run produced 72 tickets, which is too many to run a project from and duplicated across
streams. They are consolidated here into nine and kept in full in [10-tickets.md](10-tickets.md);
[10-epics.md](10-epics.md) maps every one of the 72 onto its ticket, so nothing was dropped.

| Local ID | Published title | Type | Status | Priority |
|---|---|---|---|---|
| `SHB-WEBSITE-001` | BUG-001 Deployed site rendered the 404 page and served no images | Bug | Fixed on this branch | critical |
| `SHB-WEBSITE-002` | TASK-001 Published claims and regulatory status need NaviNetics sign-off | Task | Blocked on NaviNetics | critical |
| `SHB-WEBSITE-003` | TASK-002 Legal pages, third-party permissions and patient imagery | Task | Blocked on NaviNetics | high |
| `SHB-WEBSITE-004` | BUG-002 Contact form discarded every message, and product pages had no next step | Bug | Partly fixed on this branch | critical |
| `SHB-WEBSITE-005` | FEAT-001 Unify the site onto one measure, one gutter and one vertical rhythm | Feature | Fixed on this branch | high |
| `SHB-WEBSITE-006` | BUG-003 Mega-menu unreachable by keyboard; lightbox not a real dialog; dark contrast below AA | Bug | Partly fixed on this branch | high |
| `SHB-WEBSITE-007` | BUG-004 Partners and MAVEN hold the main thread at ~93% while the page is idle | Bug | Open — cause not yet proven | high |
| `SHB-WEBSITE-008` | FEAT-002 Per-route metadata, structured data and prerendering | Feature | Partly fixed on this branch | medium |
| `SHB-WEBSITE-009` | TASK-003 Automated checks for the failure classes that reached production | Task | Partly fixed on this branch | medium |

**Three of the nine are blocked on NaviNetics, not on engineering** — TASK-001 and TASK-002 hold
almost everything that cannot be closed by writing code.

## Publication rule

Never publish the local `SHB-WEBSITE-NNN —` prefix in the live issue title. Publish
`<ISSUE-CODE> <title>`, e.g. `BUG-001 Deployed site rendered the 404 page and served no images`.

## Supporting documents

| Document | What it holds |
|---|---|
| [01-audit.md](01-audit.md) | How the audit was run; 204 findings |
| [02-fixes-applied.md](02-fixes-applied.md) | Every change, with its reason |
| [03-layout-system.md](03-layout-system.md) | The layout engine, measured before and after |
| [04-open-items.md](04-open-items.md) | What is not done, split by who can close it |
| [05-verification.md](05-verification.md) | The check tools and what each catches |
| [06-copy-policy.md](06-copy-policy.md) | Internal notes must not reach the page |
| [07-scene-accuracy.md](07-scene-accuracy.md) | Animation quality; a rebuild tried and reverted |
| [08-existing-site.md](08-existing-site.md) | What navinetics.com already says |
| [09-performance.md](09-performance.md) | Measured performance, and how the measurement went wrong first |
| [10-epics.md](10-epics.md) · [10-tickets.md](10-tickets.md) | The 72 drafted tickets and their mapping |
