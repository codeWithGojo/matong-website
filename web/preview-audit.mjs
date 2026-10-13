import fs from 'node:fs';

// Opt-in preview-only fixture: never included in a normal production build.
export function buildPreviewAudit(out) {
  const pages = Object.fromEntries(['index', 'services', 'team', 'contact'].map(name => [name,
    fs.readFileSync(`${out}/${name}.html`, 'utf8').replace('<head>', '<head><base href="/">')
      .replace('<html lang="en">', '<html lang="en" data-motion-audit-enabled="true">')]));
  fs.writeFileSync(`${out}/assets/preview-audit.json`, JSON.stringify(pages));
  fs.writeFileSync(`${out}/assets/preview-audit.css`, 'body{margin:24px;background:#e5edf0;color:#123644;font:16px system-ui}h1{font-size:24px}select{font:inherit;padding:10px}main{display:flex;align-items:start;gap:24px;margin-top:24px}iframe{display:block;border:1px solid #57707b;height:840px;background:#09445a}h2{font-size:16px}');
  fs.writeFileSync(`${out}/assets/preview-audit.js`, `let pages;const select=document.querySelector('select');fetch('/assets/preview-audit.json').then(r=>r.json()).then(data=>{pages=data;update()});function update(){if(pages)document.querySelectorAll('iframe').forEach(frame=>frame.srcdoc=pages[select.value])}select.addEventListener('change',update);`);
  fs.writeFileSync(`${out}/layout-audit.html`, '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Matong responsive preview audit</title><link rel="stylesheet" href="/assets/preview-audit.css"><script defer src="/assets/preview-audit.js"></script></head><body><h1>Matong · mobile layout audit</h1><label>Page <select><option value="index">Homepage</option><option value="services">Services</option><option value="team">Team</option><option value="contact">Contact</option></select></label><main id="main"><section><h2>360px</h2><iframe id="mobile-360" width="360" title="360px mobile preview"></iframe></section><section><h2>390px</h2><iframe id="mobile-390" width="390" title="390px mobile preview"></iframe></section></main></body></html>');
}
