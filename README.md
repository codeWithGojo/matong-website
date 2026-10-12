# Matong Energy website

A responsive company website with Matong's original navy/coral colours, its supplied project portfolio, and a clearly labelled ERP link, separate from the Staff portal. The original PHP pages remain in the repository for reference and existing PHP hosting.

## Vercel build

Run `npm run build` with Node.js 20 or later. No dependencies are required. Deploy the generated `dist` directory using the included `vercel.json`. Only static output is published; PHP source and the former PHP email handler are not exposed.

## Features

- Responsive company navigation and website search.
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

`node web/experience.test.cjs` checks slideshow playback, load failures, carousel controls and contact-panel routing.

`npm run check` checks generated pages, local routes/assets, fragment links, duplicate IDs, project coverage and the exclusion of PHP source from the deployment.

## Content and integration boundary

Project names, clients, facilities, office details, leadership and policy text are taken from the supplied company files. The client should review current accuracy before replacing the official website. No ERP database, authentication rules, company domain or live PHP hosting is changed by this website build. Shared login, CMS publishing, vendor onboarding and enquiry tracking require separate backend configuration.

## Separate Staff portal

The website labels the ERP independently from the Staff portal and staff webmail. Set `MATONG_STAFF_PORTAL_URL` at build time once the separate HTTPS portal destination is confirmed. Until then, the portal FAQ directs staff to company administration; no ERP address is labelled as the Staff portal.
