# Landable website redesign

The website introduces the current `landable/SKILL.md`: find under-the-radar repositories worth joining, assess whether a contribution can realistically land, and work through Profile → Scout → Assess → Implement → Ship → Track with an explicit human choice at each boundary. It must never promise acceptance or imply that only two approvals are needed.

## Design direction

A contribution atlas: scattered repositories become a legible route toward a useful contribution. The main visual is an original SVG star chart whose selected route responds to the visitor's interests. Quiet typography, a deliberately asymmetric first screen, and a continuous git-route motif give the rest of the page structure. This translates momo's concept-led interaction into Landable's own subject.

Palette: ocean `#091426`, deep water `#060e1e`, chart blue `#11253e`, pearl `#edf4f5`, sea glass `#9edbc7`, periwinkle `#b6b1eb`. Sand `#e4cca0` is reserved for human decisions. Instrument Serif carries English headings; Songti/Noto Serif CJK fallbacks carry Chinese headings; Manrope and system CJK sans carry interface and body copy.

Layout: left-aligned navigation and narrative, with an open atlas on the right. Subsequent sections alternate quiet reading space and useful diagrams. No equal-card feature grid, fabricated metrics, or excessive section labels. The user subsequently requested localized, gently animated particle keepsakes on each resting chapter.

    wordmark                         process / work / language / install
    clear purpose              repository constellation
    primary action             selected historic contribution
    -----------------------------------------------------------------
    acceptance evidence        trace from issue to merged patch
    six-stage journey          current artifact + human choice
    real merged contributions  direct PR links
    install command            example first request

## Implementation and verification

- Replace `web/index.html`; split visual rules into `web/styles.css` and interaction/translation data into `web/app.js`. Keep GitHub Pages' buildless `web/` deployment.
- Self-host Latin fonts and preserve EN/中文 selection, including the existing `landable-lang` preference. All essential content and installation remain readable without JavaScript.
- Atlas interest buttons select a representative historic contribution; six workflow buttons reveal each deliverable and decision; copy installation reports success/failure honestly; mobile navigation supports Escape and focus.
- Motion follows the scroll story described below. Respect reduced motion, data-saving preferences, page visibility, and reading space. Limit idle particle rendering to local keepsakes and pause it when hidden/offscreen.
- Verify desktop, 667px narrow preview, and 390px mobile in both languages; keyboard and clipboard interactions; reduced motion; storage denied; JavaScript disabled; browser errors and missing resources. Verify selected PR links against GitHub and disclose examples as historical rather than live recommendations.

## Initial reading-layout verification on 2026-10-24

- Final browser pass: 43 assertions passed across English and Chinese, all six stages, all three atlas selections, keyboard focus/navigation, clipboard content, persisted language, and reduced motion. Both languages have no horizontal overflow at 320, 390, 667, 800, 801, 1024, and 1440 CSS pixels.
- Separate fallback pass: eight assertions passed for denied storage, denied clipboard, and JavaScript-disabled reading/navigation/installation.
- Independent review found two keyboard focus issues; both were corrected and rechecked. No remaining blocker reported.
- GitHub GraphQL confirmed all ten displayed example PRs are merged. These are explicitly presented as historical contributions.
- `node --check web/app.js` and `git diff --check` passed. The browser reported no JavaScript errors or failed resources in the final pass. All initial runtime assets and fonts were local, totaling about 131 KB before transfer compression; the scroll modules below were added afterward.
- Local implementation only; GitHub Pages deployment has not been triggered.

## Scroll story revision

The user requested a presentation-like chapter rhythm with particle handovers on every section, and a deeper starry background. Retain the five actual content sections in a progressively enhanced sticky stage. The full document stays available without JavaScript, with reduced motion, on short viewports, or if canvas initialization fails.

- Midnight indigo base `#091426`, deeper water `#060e1e`, restrained mint and periwinkle particles.
- Four handovers: atlas → acceptance heading/icons → journey/dossier → merged contributions → installation heading/command. Particle source and destination points are sampled from actual SVG geometry and rendered text, so the effect belongs to the content.
- Each handover holds its source for normalized progress 0–0.2, morphs over 0.2–0.8, then holds its destination for 0.8–1. An exponential visual follow supplies damping without intercepting wheel or touch scrolling. The base paths and reverse progress are deterministic; localized ambient glints have their own bounded clock.
- Long sections get their own native reading distance before the handover, including on mobile. Navigation/deep links jump directly to a stable scene; browser history, keyboard focus, and existing controls remain usable.
- Canvas backing scale is capped at 1.5. Up to 3,000 particles on desktop / 1,500 on phones. Shape sampling happens on layout/content changes, never on scroll frames. Settled panels and camera stop updating. Local particle keepsakes render at a capped 28 Hz, with no layout reads; their animation pauses while hidden/offscreen. A paused mid-transition canvas stays still until scrolling resumes.
- Six pure motion tests pin the two resting plateaus, refresh-rate-independent damping, long-section reading ranges, scene boundaries, deterministic particle endpoints/reversal, and bounded ambient glints. Run `node --test tests/story-motion.test.mjs`.

## Responsive landings and persistent particles

- Resting compositions have per-chapter top/bottom spacing and alignment. Wide short screens scale the hero atlas to available height; narrow screens and phones use their own chapter anchors and reading ranges. Every viewport dimension change rebuilds target masks, and font loading completes a second layout-aware sampling pass.
- The final orbital keepsake occupies actual grid space beside/below the introduction, rather than floating over its text. The assessment copy uses its own selector so inserting a particle keepsake cannot invalidate its typography.
- Particle identities persist through resting and morphing: the atlas, an assessment constellation, dossier/stage outlines, project emblems, and the final orbit keep localized motion. Body copy, headings, camera, and layout remain stable throughout the two scroll-distance plateaus.
- Responsive browser pass checked 70 chapter/language/viewport combinations at 1440×960, 1440×768, 1024×768, 667×807, 667×700, 390×844, and 390×740. No horizontal overflow or header overlap at incoming stable positions; long chapters retain their measured reading distance.

## Final particle-story verification

- Six motion tests pass. Final browser pass: 36 assertions cover all four source/target plateaus, scroll-driven morphs, persistent ambient particles in all five chapters, unchanged resting compositions, visibility pause/resume, and reduced-motion disable/re-enable.
- Existing controls, deep links/history, mobile reading completion/focus, clipboard, no-JavaScript/data-saving fallbacks, malformed hashes, and footer-position preservation were checked separately.
- Independent review found and verified the skip-link stacking correction; no remaining blockers reported after the responsive/ambient pass.
- The user approved this version for publication on 2026-10-24. Publication target: https://momoyeyu.github.io/landable/. Deployment and live verification results are reported in the chat.

## Daily discovery and live contribution data

- The hero atlas is a public discovery preview, not the author's contribution history or a personal recommendation. It now uses the actual GitHub Trending daily order, up to 20 repositories, in groups of four. A shorter source list produces fewer groups, without invented entries. Each group rests for nine seconds before a 320 ms fade; the five-group case loops back to the beginning.
- Stars can be selected to inspect a repository's description and open its canonical GitHub URL. Previous/next and pause/play controls are keyboard accessible. Hover, focus, hidden tabs, offscreen content, a scrolling chapter transition, reduced motion and data saving suspend autoplay. The scroll handover still owns its 0–0.2 / 0.2–0.8 / 0.8–1 resting/morphing/resting rhythm.
- `scripts/update_website_data.py` reuses the skill's stdlib Trending parser. GitHub Pages refreshes same-origin JSON daily at 00:37 UTC (08:37 Asia/Shanghai), on pushes, and on manual workflow dispatch. GitHub's scheduled jobs may be delayed. The browser reads this public JSON because GitHub Trending HTML does not provide browser CORS access. Snapshot dates are visible; failed/empty fetches do not replace the deployed site.
- The contribution section remains scoped to the four selected case-study repositories. Current merged PRs by Momoyeyu are fetched with pagination, and repositories are sorted numerically by current GitHub stars. Minimum PR numbers preserve the start of each case study; archify's earlier manual #513/#634 remain excluded. At verification there are 17 included merged PRs, with descriptive titles on links.
- A second deployment script refreshes contribution snapshots using the workflow's server-side token. Each page visit then attempts fresh anonymous GitHub requests; partial failures preserve verified values and identify the fallback date. Tokens never enter `web/` or browser requests. External descriptions and titles enter only text nodes/attributes, with canonical GitHub URLs constructed from validated names/numbers.
- Narrow atlases put the detail card in normal flow so project descriptions, controls and footnotes cannot overlap. Longer contribution lists receive native reading distance and trigger a particle/timeline rebuild on data updates.
- Verification: `node --test tests/*.test.mjs` (19 tests), `python3 tests/test_website_data.py` (2 tests), live GitHub contribution snapshot refresh, and browser checks for actual autoplay, offscreen pause, explicit pause, reduced motion/manual navigation, bilingual status and 320–1440px responsive reading positions. Independent review found no blockers.
