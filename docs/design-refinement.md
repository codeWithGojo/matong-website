# Matong mobile and design refinement — 13 October 2026

This update applies the Gojo/Favour web design method to the existing company website and ERP, using the supplied mobile screenshot and nine-second Seplat recording as references.

## Website

The mobile screenshot exposed a real photo-sizing defect: gallery images shrank in width while retaining their declared height. Earlier overflow and missing-asset checks did not detect that incorrect crop. Gallery photographs now use their natural proportions, with a single column on phones, two columns on tablets and three columns on desktop. Build output uses each optimized photograph's actual width and height to reserve the correct space. Captions remain readable and the full-size viewer retains keyboard navigation, focus return and failed-image retry.

The company facts and project-page heading now say **20+ projects**, as requested. All 20 supplied project records and their routes remain intact; no extra project histories were invented. Filter results still count the actual displayed records.

Typography now uses licensed, self-hosted IBM Plex Sans from the existing ERP assets. The Google font requests are removed. Headings are upright, project photography has more room, and the homepage document area reads as a short list rather than another three-tile section.

Two effects observed in the recording are recreated with Matong's own content and colours:

- The three homepage project features reveal a blue colour panel and translated project text on hover or keyboard focus. On touch screens the image, client, project title, facility and link are visible without a gesture.
- Circular brand shapes move gently with each hero image. The existing eight-second image zoom remains. Hero image motion and circles now share the slideshow's pause state, including interaction, off-screen, hidden-tab and open-navigation/dialog conditions.

Only transform and opacity are animated. Reduced motion cancels the hero animations and makes interactions immediate. Footer legibility settings hide the hero shapes and remain persistent. Header hide/return behavior, the circular contact control, team page, existing company content and navigation remain available.

## ERP

The overview has a joined metric strip with dividers, concise date-based sparkline labels and flatter register surfaces. Company setup is a compact native disclosure showing its current progress; opening it exposes the same explanations and settings actions. No setup requirement is bypassed. Mobile project rows give identity, status, due date and progress explicit positions. Loading metrics use the same joined structure and tablet column count.

Role permissions, authentication, API handlers, invoice calculations, approvals, records and database rules are unchanged. No production data or staff invitations were written during this visual work.

## Verification

- Website: 48 routes at 320px, 390px, 768px and 1440px, for 192 layout checks. No horizontal page overflow, broken photos or application JavaScript/CSP errors were observed.
- Every gallery thumbnail was checked against its loaded photograph's natural aspect ratio. Phone thumbnails were also checked to occupy the available column width. These checks directly cover the defect in the supplied screenshot.
- Automated WCAG A/AA checks on representative phone/desktop routes reported no violations. They are not a certification or physical-device test.
- Reference hover and keyboard panels, hero circle pause/resume, the 20+ counter suffix, reduced motion and legibility were checked in the browser. Existing header, hero, service tab, office panel and gallery regressions pass.
- ERP: 105 screen checks across 360px, 768px and 1440px, with isolated fixture responses. No horizontal page overflow, JavaScript errors or reported violations in the checked overview/register/editor states.
- ERP setup disclosure, settled count-up values and visible posted-cash chart bars were checked. Request-board, command, theme, save recovery, invoice VAT/currencies/due dates and print preview checks continue to pass.
- ERP TypeScript, 64 Vitest cases, 13 Node cases, lint and production build pass. Lint retains its 25 existing advisory warnings. The temporary QA route is removed before release.

The earlier production audit and remaining company acceptance requirements remain in [handover-audit.md](handover-audit.md). Signed-in company UAT and testing on the staff's physical devices are separate from these viewport and fixture checks.

## Complete changed files

Website: `web/build.mjs`, `web/credibility.mjs`, `web/experience.js`, `web/shared-init.js`, `web/premium.css`, `web/fonts/IBMPlexSans-Regular.woff2`, `web/fonts/IBMPlexSans-Medium.woff2`, `web/fonts/IBMPlexSans-SemiBold.woff2`, `web/fonts/LICENSE.txt`, `docs/design-refinement.md`, `README.md`.

ERP: `app/premium.css`, `components/dashboard.tsx`, `components/setup-checklist.tsx`, `DESIGN.md`, `docs/design-refinement.md`, `README.md`.
