import fs from 'node:fs';

// Restore the artwork and names from the company-supplied clients.php.
export const clients = [
  ['Total', '01', 'Total Energies Nigeria Limited'],
  ['Chevron', '02', 'Chevron Nigeria Limited'],
  ['Addax Petroleum', '03', 'Addax Petroleum Nigeria Limited'],
  ['Brittania-U', '04', 'Brittania-U Nigeria Limited'],
  ['BW Offshore', '05', 'BW Offshore Nigeria Limited'],
  ['Upstream International', '06', null],
  ['ExxonMobil', '07', null],
];

const icons = {
  whatsapp: '<path d="M20 11.8a8 8 0 0 1-11.9 7L4 20l1.2-4.1A8 8 0 1 1 20 11.8Z"/><path d="m9 7-1 1c-.7 2 3 6 5 7l2-1-2-2-1 1c-1-.5-2.5-2-3-3l1-1Z"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  facebook: '<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5"/>',
  x: '<path d="M4 3h4l12 18h-4ZM20 3 4 21"/>',
};

const profiles = JSON.parse(fs.readFileSync('web/social-links.json', 'utf8'));
const hosts = { facebook: ['facebook.com', 'www.facebook.com'], instagram: ['instagram.com', 'www.instagram.com'], x: ['x.com', 'www.x.com'] };
for (const [network, value] of Object.entries(profiles)) {
  if (!hosts[network]) throw new Error(`Unknown social network: ${network}`);
  if (!value) continue;
  const url = new URL(value);
  if (url.protocol !== 'https:' || !hosts[network].includes(url.hostname) || url.pathname === '/' || url.username || url.password) {
    throw new Error(`Use Matong's confirmed ${network} profile URL, not a platform homepage.`);
  }
}

const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function socialLinks() {
  const links = [
    ['whatsapp', 'WhatsApp Matong', 'https://wa.me/2348037445836'],
    ['group', 'Join our WhatsApp group', 'https://chat.whatsapp.com/HGYXw1kPNOQBD4Pf1Q3e07'],
    ['email', 'Email Matong', 'mailto:info@matongenergy.com'],
    ...Object.entries(profiles).filter(([, value]) => value).map(([network, value]) => [network, `Matong on ${network === 'x' ? 'X' : network[0].toUpperCase() + network.slice(1)}`, value]),
  ];
  return `<nav class="social-links" aria-label="Contact and social links">${links.map(([icon, label, href]) => `<a href="${escape(href)}" aria-label="${label}" title="${label}"${href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}><svg viewBox="0 0 24 24" aria-hidden="true">${icons[icon]}</svg></a>`).join('')}</nav>`;
}

export function clientLogos() {
  return `<ul class="client-logos">${clients.map(([name, image, projectClient]) => {
    const artwork = `<span class="client-artwork"><img src="/images/partners/${image}.png" alt="${escape(name)}" width="240" height="120" loading="lazy" decoding="async"></span><span class="client-label">${escape(name)}${projectClient ? '<small>View project experience →</small>' : ''}</span>`;
    return `<li>${projectClient ? `<a href="/projects?q=${encodeURIComponent(projectClient)}">${artwork}</a>` : `<div>${artwork}</div>`}</li>`;
  }).join('')}</ul>`;
}

export function credibilitySection(projectCount, officeCount) {
  return `<section id="client-experience" class="section credibility"><div class="wrap"><div class="section-heading"><div><span class="eyebrow">CLIENT EXPERIENCE</span><h2>The companies behind the work.</h2></div><a class="text-link" href="/clients">Client experience →</a></div>${clientLogos()}<div class="company-facts"><div><strong data-count="10" data-count-suffix="+ years">10+ years</strong><span>Company experience</span></div><div><strong data-count="${projectCount}">${projectCount}</strong><span>Projects in our portfolio</span></div><div><strong data-count="${officeCount}">${officeCount}</strong><span>Listed office locations</span></div></div><a class="text-link" href="/contact#locations">Find our offices →</a></div></section>`;
}
