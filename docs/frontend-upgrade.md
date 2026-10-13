# Matong frontend upgrade — 13 October 2026

Complete source files are committed in the existing website and ERP repositories. No snippets or external runtime libraries are required. The shared files are identical in both repositories; each deployment serves its own copy.

## Part 0: Shared system

Both repositories: `shared/matong-tokens.css`, `shared/motion.css`, `shared/reveal.js`, `shared/count-up.js`, `scripts/test-shared-motion.cjs`.

Website: `web/build.mjs`, `web/check.mjs`, `web/site.css`, `web/motion.css`, `web/experience.css`, `web/credibility.css`, `web/refinements.css`, `web/navigation.css`.

ERP: `app/layout.tsx`, `app/globals.css`, `app/operations.css`.

The token file contains primary #09445a, accent and semantic colours, light/dark surfaces, spacing, radii, shadows, fluid type, easing and durations. Compatibility tokens retain the exact colour and type details of existing components. No new remote scripts or dependencies were added.

## Part 1: ERP foundation

ERP: `components/ui.tsx`, `lib/presentation.ts`, `app/premium.css`, `app/loading.tsx`, `components/workspace.tsx`, `components/purchasing-desk.tsx`, `components/account-security.tsx`, `components/staff-invitations.tsx`, `app/layout.tsx`.

Route/loading skeletons and independently fetched security/invitation/transaction screens use the same layout. Status badges and toasts are shared. Tables gain sticky headings and labelled mobile cards, while printable documents keep their table layout.

Invoice previews use the existing rounding-safe NGN/USD calculator and existing company VAT and due-date settings. The current company settings specify 7.5% VAT and 45 days; approved exemptions or invoice-specific overrides remain intact. The existing audit page stays administrator-only. Backup status is explicitly **unverified**, because the application has no verified backup/restore feed.

## Part 2: Website motion

Website: `web/build.mjs`, `web/premium.css`, `web/shared-init.js`, `web/motion.js`, `web/motion.test.cjs`, `web/credibility.mjs`, `web/projects.json`, `web/refinements.js`, `web/refinements.test.cjs`.

The headline preserves its text and reveals by word after the intro. The active image zooms from 1 to 1.08 over eight seconds. Shared reveals and counters replace duplicate controllers. The active service progress bar pauses and resumes with the actual remaining slide time. The following header retains downward hiding and upward return, with a smaller visual treatment and static blur when scrolled. Each mega menu has a unique sentence. Project photographs zoom inside their crops; arrows slide on hover/focus. Brittania-U casing is consistent in the published source.

## Part 3: ERP overview

ERP: `lib/dashboard-visuals.ts`, `components/dashboard-visuals.tsx`, `components/dashboard.tsx`, `components/workspace.tsx`, `app/premium.css`, `tests/dashboard-visuals.test.ts`.

KPIs and charts use only records already returned to the current member. Sparklines are labelled by their actual record dates; they do not pretend to reconstruct historic operational balances. The cash chart preserves posted cash calculations. Project rings use recorded progress; stock charts use on-hand and reorder quantities. Payment alerts separate NGN/USD, ignore drafts and settled invoices, and show overdue or due within seven days. Existing activity has date/time labels.

## Part 4: ERP power tools

ERP: `components/power-tools.tsx`, `components/workspace.tsx`, `components/purchasing-desk.tsx`, `components/dashboard.tsx`, `app/premium.css`, `tests/visual-ui.spec.tsx`, `vitest.config.mts`.

Ctrl+K/Command+K searches permitted pages and loaded projects, staff and invoices. Native request dragging and a touch/keyboard select call the original mutation with the current record version and allowed transitions. Steppers reflect actual module states: invoice sending remains distinct from supplier/payroll approval. MD/director, accounts, project and store overviews follow existing roles and director designation. Dark mode is stored per member on the current browser, without changing authentication or writing account metadata.

## Verification

- Both projects build. ERP TypeScript checks pass.
- Existing finance, personnel, demo-isolation, onboarding, authentication, audit, company-requirement, database and purchasing/workflow regressions pass.
- New dashboard and permission/theme/command/board checks pass; shared utility checks cover reveal completion and reduced-motion count cancellation.
- Website browser QA: 1440px, 390px and 360px; team slider, contact control, header direction, legibility, overflow and reduced motion.
- ERP browser QA with isolated fixture responses: 1440px and 390px; dashboard, charts, dark-mode persistence, command palette, request dragging, mobile tables, NGN/USD 7.5% totals, 45-day due date and print media.
- Temporary QA route removed before the final build. Test records were not written to production.
- API handlers, auth/proxy routes, SQL, permissions, validation and financial calculations were not changed. Physical-device testing, real staff-role UAT and verified backup/restore remain separate checks.

## Additional files

`README.md` links to this report in both repositories. This report is `docs/frontend-upgrade.md` in both repositories.
