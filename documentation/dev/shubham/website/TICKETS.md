# NaviNetics website — Tickets

Branch: `site-fixes-2026-08` — Status: local, not filed as GitHub issues.

Nine tickets. Numbering starts at 001 because this repository has no existing BUG/FEAT/TASK series to
continue; it is a different repository from the suite.

| Ticket | Title | Type | Priority | Status |
|---|---|---|---|---|
| [BUG-125](tickets/BUG-125_Deploy-Broken-On-GitHub-Pages.md) | The deployed site rendered the 404 page and served no images | Bug | Critical | Fixed on this branch |
| [TASK-001](tickets/TASK-001_Published-Claims-And-Regulatory-Status.md) | Published claims and regulatory status need NaviNetics sign-off | Task | Critical | Blocked on NaviNetics |
| [TASK-002](tickets/TASK-002_Legal-Pages-Permissions-Patient-Imagery.md) | Legal pages, third-party permissions and patient imagery | Task | High | Blocked on NaviNetics |
| [BUG-126](tickets/BUG-126_Contact-Form-Discarded-Every-Message.md) | The contact form discarded every message, and product pages had no next step | Bug | Critical | Partly fixed on this branch |
| [FEAT-045](tickets/FEAT-045_Unify-Layout-Measure-Gutter-Rhythm.md) | Unify the site onto one measure, one gutter and one vertical rhythm | Feature | High | Done |
| [BUG-127](tickets/BUG-127_Accessibility-Keyboard-Dialog-Contrast.md) | Mega-menu unreachable by keyboard, lightbox not a real dialog, dark contrast below AA | Bug | High | Partly fixed on this branch |
| [BUG-128](tickets/BUG-128_Partners-And-Maven-Peg-Main-Thread.md) | Partners and MAVEN hold the main thread at ~93% while the page is idle | Bug | High | Open — cause not proven |
| [FEAT-046](tickets/FEAT-046_Discoverability-Metadata-And-Prerendering.md) | Per-route metadata, structured data and prerendering | Feature | Medium | Partly done |
| [TASK-003](tickets/TASK-003_Verification-Tooling.md) | Automated checks for the failure classes that reached production | Task | Medium | Partly done |

**Three of the nine are blocked on NaviNetics rather than on engineering.** TASK-001 and TASK-002
between them hold almost everything that cannot be closed by writing code: the 510(k) number, MR
safety, intended use, reprocessing, MAVEN's use status, per-market status, the legal pages,
third-party permissions, and the patient imaging whose de-identification review this repository
itself flags as outstanding.

These nine were consolidated from 72 drafted tickets, which duplicated across drafting streams — the
510(k) number was raised twice, the patient CT twice, the Mayo wording twice. The full set is kept in
[10-tickets.md](10-tickets.md), and [10-epics.md](10-epics.md) maps every one of the 72 onto its
ticket, so nothing was dropped in the consolidation.

---

# Supporting record

| Document | What it holds |
|---|---|
| [01-audit.md](01-audit.md) | How the audit was run; 204 findings |
| [02-fixes-applied.md](02-fixes-applied.md) | Every change, with its reason |
| [03-layout-system.md](03-layout-system.md) | The layout engine, measured before and after |
| [04-open-items.md](04-open-items.md) | What is not done, split by who can close it |
| [05-verification.md](05-verification.md) | The check tools, and what each catches |
| [06-copy-policy.md](06-copy-policy.md) | Internal notes must not reach the page |
| [07-scene-accuracy.md](07-scene-accuracy.md) | Animation quality; a rebuild tried and reverted |
| [08-existing-site.md](08-existing-site.md) | What navinetics.com already says |
| [09-performance.md](09-performance.md) | Measured performance, and how the measurement went wrong first |
