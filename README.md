# Matong Energy website

A responsive company website with Matong's original navy/coral colours, its supplied project portfolio, and a link to the existing ERP staff login. The original PHP pages remain in the repository for reference and existing PHP hosting.

## Vercel build

Run `npm run build` with Node.js 20 or later. No dependencies are required. Deploy the generated `dist` directory using the included `vercel.json`. Only static output is published; PHP source and the former PHP email handler are not exposed.

## Features

- Responsive company navigation and website search.
- Manual hero image selector; reduced-motion support.
- Twenty project records, category and text filters, individual project pages.
- Document centre, QMS download and printable capability overview.
- Keyboard-accessible photo viewer and office location tabs.
- Quote brief builder: downloads a text brief or prepares an email to `info@matongenergy.com`. Visitors send the message in their own email app. No automatic submission or enquiry database is claimed.
- ERP Staff Login remains at `https://matong-erp-favour12.vercel.app/login`; authentication and permissions are handled by the existing ERP.

## Validation

`npm run check` checks generated pages, local routes/assets, fragment links, duplicate IDs, project coverage and the exclusion of PHP source from the deployment.

## Content and integration boundary

Project names, clients, facilities, office details, leadership and policy text are taken from the supplied company files. The client should review current accuracy before replacing the official website. No ERP database, authentication rules, company domain or live PHP hosting is changed by this website build. Shared login, CMS publishing, vendor onboarding and enquiry tracking require separate backend configuration.
