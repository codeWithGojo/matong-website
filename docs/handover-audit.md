# Matong handover audit — 13 October 2026

The company website and ERP have been reviewed and corrected in their existing repositories. The gallery now contains the supplied equipment photograph and the existing field and project photographs. The implementation is suitable for the next staff acceptance test; production financial use still requires the company setup and operational checks below.

## Gallery

The supplied photograph is captioned **Volumetric efficiency testing on rotary equipment**. Its alternative text describes the visible technician and measurement equipment. No client, location, measured efficiency or test result has been invented. The original photograph is retained, with responsive WebP copies for page delivery.

The homepage has a gallery preview; Resources navigation and the footer link to `/gallery`. The gallery contains three equipment/maintenance photographs and all 20 existing project photographs. The viewer supports previous/next arrows, keyboard arrows, Escape, focus return, loading feedback and failed-image retry. An earlier image request cannot replace a later selection.

## Bugs corrected

| Area | Problem | Correction |
| --- | --- | --- |
| Photo viewer | A failed full-size image had no usable recovery state. | Added a visible error, retry action and protection against stale image responses. |
| Website navigation | Closing mobile navigation could leave focus on a hidden link or an incorrect button label. | Escape returns focus to the menu button; search and navigation links reset its state and label. |
| ERP first load | A failed records request could reveal empty/zero-value summaries without confirmed data. | Show a retry screen until the first successful data response. |
| ERP saves | A confirmed save outside personnel could disappear from the list if its follow-up fetch failed or lagged. | Retain the server-confirmed record, preserve its version, close the saved form and report any refresh failure. Failed saves retain the form. |
| Account security | A failed authenticator fetch could say that no device existed. | Keep device status unknown until loaded, and provide retry. |
| Invitations | A successful invitation could be confused with a failed list refresh. | Keep delivery confirmation separate from refresh failure and offer a list retry. No invitations were sent by this audit. |
| Purchasing | Initial workflow fetch failure could look like an empty register; rapid repeat actions could race locally. | Added an honest retry state and a submission guard, preserving existing server idempotency. |
| Counters and reveals | Switching pages/currency during an animation could leave an old number visible or skip initialization. | Restart effects on page/currency changes and cancel stale count updates. The shared scripts remain identical. |
| Dark mode | Register footers and low-stock quantities had insufficient contrast. | Use the shared surface and danger tokens. |
| Keyboard controls | Wide printable tables lacked a keyboard scroll target; command selection could move outside the visible list. | Make document tables focusable, scroll selected commands into view, and include visible disclosures/scroll regions in the modal focus loop. |
| Invoice preview | A draft USD preview could show an exchange-rate sentence before a rate existed. | Show that sentence only for a positive entered rate; existing USD validation remains unchanged. |
| Release checks | ESLint applied an ES-module-only import rule to the CommonJS shared-motion test. | Scoped that rule to the appropriate script format. Lint exits successfully; 25 existing advisory warnings remain. |

## Verification completed

| Check | Evidence |
| --- | --- |
| Website build/link checks | 48 pages; 3,269 internal links/assets; unique IDs; all 20 project detail pages. |
| Website browser layouts | All 48 routes at 360px, 768px and 1440px: 144 checks, no horizontal page overflow, broken images or application JavaScript/CSP errors. |
| Website accessibility | Automated WCAG A/AA checks on home, gallery, team, contact, projects, services, resources and capability at phone/desktop widths reported no violations. This is not an accessibility certification. |
| Website interactions | Header direction, legibility persistence, circular contact panel, team slider, reduced motion, search failure/retry, gallery loading/retry and quote-brief download. |
| Website regressions | 40 existing interaction cases; new gallery race/error checks; five shared reveal/count scenarios, including changed values during an animation. |
| ERP browser layouts | 105 screen checks across 360px, 768px and 1440px, including all 31 module registers, overview themes, request boards and invoice editor/previews. No horizontal page overflow or JavaScript errors. |
| ERP accessibility | Automated checks on light/dark overview, personnel, requests, board, documents, stock, invoices and previews reported no violations after the fixes. |
| ERP UI flows | First-load failure/retry; save failure with retained inputs; confirmed save with failed refresh; dark-mode persistence; command palette; request dragging; NGN/USD live totals; 7.5% VAT; 45-day due dates; print media. Browser API responses used isolated fixtures, not production writes. |
| ERP role presentation | Module navigation checked for admin, accountant, engineer, procurement, HR and staff with scoped fixture data. |
| ERP regression suites | 64 Vitest cases; 13 Node finance/dashboard/workflow cases; 34 database authorization checks; 48 transactional workflow checks; 48 audit checks; 32 company-rule checks; 14 auth-protection checks. |
| ERP release checks | TypeScript and production build pass; lint exits with zero errors. Temporary QA route removed before release. |

The database suites use local Postgres through PGlite. They cover access denial, version conflicts, idempotency, maker/checker separation, financial rounding, posted-record locks, journal balance, period controls, session revocation and MFA requirements. They do not replace signed-in production tests by company staff.

## Production database observations

Read-only checks of the existing **ERP SYSTEM** project confirmed:

- The project reports `ACTIVE_HEALTHY`.
- All nine existing migrations are present, through invitation/onboarding.
- All 19 public ERP tables have row-level security enabled.
- Ten private tables have no direct SELECT grants for anonymous or authenticated clients. Their advisor “RLS without policy” notices reflect the existing denial of direct client access; the authorized application functions remain the access path.
- The staff invitation function is active. Its source validates the bearer token and staff/admin authorization; email delivery was not exercised.
- Company defaults are 7.5% VAT and 45-day invoice terms.
- One active administrator is onboarded. No confirmed director account is assigned. Invoice approval, purchase MD approval, purchase projects approval and expense threshold currency are unset.
- Supabase's security advisor reports leaked-password screening disabled. Its [password-security documentation](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) states that this feature requires Pro or above. The application's existing password-length/common-password rules and login protection remain intact. No subscription or auth configuration was changed.

No production records, memberships, director designations, migrations, finance rules or auth settings were changed during this audit.

## Company acceptance required

| Requirement | Owner / acceptance evidence |
| --- | --- |
| Staff accounts and director designations | Company administrator: invite the intended staff, assign their actual roles and confirm directors. Validate each person's permitted and denied views. |
| Approval configuration | Company management: select the confirmed invoice and purchase approvers and expense currency in Settings. Existing financial workflows deliberately fail closed until required configuration is complete. |
| Email and account recovery | Administrator plus a test mailbox: receive an invitation, finish onboarding, reset a password, check a single-use/expired link, verify MFA and backup-device recovery. |
| Operational transaction acceptance | Two real staff accounts: create/approve a purchase, receive stock, match a supplier bill, record payment and confirm stock, journal and audit results. Check denied same-person approval. Use agreed test records. |
| Backup and restore | Administrator: confirm database and private-file backup coverage/retention, then demonstrate a restore in an isolated environment. The UI correctly reports backup status as unverified. |
| Password screening | Administrator: resolve the actual Supabase advisor warning under the approved subscription/security policy. See the linked remediation above. |
| Real devices and documents | Staff: test on their actual phones/browsers and print/save representative invoices, waybills and personnel forms. Current browser tests emulate viewports. |

## Complete changed files

Website:

- `web/build.mjs`, `web/site.js`, `web/gallery.js`, `web/gallery.test.cjs`, `web/premium.css`, `web/responsive-media.json`.
- `images/volumetric-efficiency.jpg`, `web/media/volumetric-efficiency.webp`, `web/media/volumetric-efficiency-480.webp`, `web/media/volumetric-efficiency-800.webp`.
- `shared/count-up.js`, `scripts/test-shared-motion.cjs`, `docs/handover-audit.md`, `README.md`.

ERP:

- `components/workspace.tsx`, `components/ui.tsx`, `components/power-tools.tsx`, `components/printable.tsx`, `components/account-security.tsx`, `components/staff-invitations.tsx`, `components/purchasing-desk.tsx`, `app/premium.css`.
- `shared/count-up.js`, `scripts/test-shared-motion.cjs`, `tests/handover-ui.spec.tsx`, `vitest.config.mts`, `eslint.config.mjs`, `docs/handover-audit.md`, `README.md`.

The earlier upgrade parts and their complete file lists remain in [frontend-upgrade.md](frontend-upgrade.md). Existing routes, project content, authentication and database/business rules are preserved.
