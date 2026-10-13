# Matong Energy website

A responsive company website with Matong's original navy/coral colours, its supplied project portfolio, and a clearly labelled ERP link, separate from the Staff portal. The original PHP pages remain in the repository for reference and existing PHP hosting.

## Vercel build

Run `npm run build` with Node.js 20 or later. No dependencies are required. Deploy the generated `dist` directory using the included `vercel.json`. Only static output is published; PHP source and the former PHP email handler are not exposed.

## Features

- Responsive company navigation, header that hides on downward scroll and returns on upward scroll, and website search.
- Full-width image hero with a primary project enquiry action.
- Controlled eight-second service tabs with pause, keyboard navigation, touch selection and reduced-motion support.
- Dedicated sliding Team page with original staff names, roles and photos, touch/keyboard navigation and distinct portrait/copy motion.
- Spacious corporate footer with offices, quick links, contact details and labelled legibility settings. Compact circular contact launcher and icon-only slideshow controls.
- Shared blue hover/focus treatment, readable typography and consistent section spacing.
- Grouped scroll reveals, pump-photo enlargement and service-specific project enquiry links.
- Responsive WebP sources for hero and project imagery, with lazy loading below the fold.
- Slow hero image slideshow with pause/manual selection, visibility-aware playback and reduced-motion support.
- Service capability summaries and swipeable mobile cards with keyboard-accessible controls.
- Floating enquiry panel with service-specific WhatsApp and quote links, plus tap-to-call contact.
- Original client-logo artwork restored on the homepage and Clients page, with links to documented project experience.
- Company experience, portfolio count and listed-location stats, using the existing count-up enhancement.
- Active WhatsApp, company WhatsApp group and email icons; optional confirmed Facebook, Instagram and X profiles in `web/social-links.json`. Platform homepages are rejected at build time.
- Twenty project records, category and text filters, individual project pages.
- Document centre, QMS download and printable capability overview.
- Keyboard-accessible photo viewer and office location tabs.
- Quote brief builder: downloads a text brief or prepares an email to `info@matongenergy.com`. Visitors send the message in their own email app. No automatic submission or enquiry database is claimed.
- ERP system login remains at `https://matong-erp-favour12.vercel.app/login`; authentication and permissions are handled by the existing ERP.

## Validation

`node web/refinements.test.cjs` checks service tab selection, autoplay, keyboard, visibility and reduced motion.

`node web/experience.test.cjs` checks slideshow playback, load failures, carousel controls and contact-panel routing.

`npm run check` checks generated pages, local routes/assets, fragment links, duplicate IDs, project coverage and the exclusion of PHP source from the deployment.

## Content and integration boundary

Project names, clients, facilities, office details, leadership and policy text are taken from the supplied company files. The client should review current accuracy before replacing the official website. No ERP database, authentication rules, company domain or live PHP hosting is changed by this website build. Shared login, CMS publishing, vendor onboarding and enquiry tracking require separate backend configuration.

## Separate Staff portal

The website labels the ERP independently from the Staff portal and staff webmail. Set `MATONG_STAFF_PORTAL_URL` at build time once the separate HTTPS portal destination is confirmed. Until then, the portal FAQ directs staff to company administration; no ERP address is labelled as the Staff portal.

## Media and preview QA

Responsive media is committed to the repository. Regenerate it with `python web/prepare-media.py` when photographs change (Pillow required for this preparation step only). Vercel builds remain dependency-free Node builds.

Vercel previews (or `MATONG_PREVIEW_AUDIT=1 npm run build` locally) create a preview-only 360px/390px browser fixture at `/layout-audit`. Normal production builds exclude the fixture and its data.

## Shared design and motion upgrade

See [frontend-upgrade.md](docs/frontend-upgrade.md) for shared tokens, homepage refinements, changed files and verification.

Handover findings, verification and company acceptance requirements: [13 October audit](docs/handover-audit.md).

Mobile photo correction, reference motion and interface refinement: [13 October design update](docs/design-refinement.md).
