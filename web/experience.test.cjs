const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('web/experience.js', 'utf8');

function fixture({ reduced = false, hasHero = true } = {}) {
  let clock = 0, serial = 0;
  const timers = new Map(), observers = [], probes = [], mutations = [];
  class Node {
    constructor() {
      this.events = {}; this.attrs = {}; this.dataset = {}; this.children = [];
      this.selectors = {}; this.value = ''; this.textContent = ''; this.hidden = false;
      const values = new Set();
      this.classList = { add: v => values.add(v), remove: v => values.delete(v), contains: v => values.has(v),
        toggle(v, on) { on = on ?? !values.has(v); on ? values.add(v) : values.delete(v); return on; } };
    }
    querySelector(s) { return this.selectors[s] || null; }
    querySelectorAll(s) { return this.lists?.[s] || []; }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
    emit(k, extra = {}) { (this.events[k] || []).forEach(fn => fn({ target: this, pointerType: 'mouse', ...extra })); }
    contains(node) { return node === this || this.children.includes(node); }
    scrollTo(options) { this.lastScroll = options; }
  }
  const root = new Node(), body = new Node(), hero = new Node(), image = new Node(), nextImage = new Node();
  const playback = new Node(), label = new Node(), icon = new Node();
  playback.selectors = { '.playback-label': label, '.playback-icon': icon };
  const buttons = [0, 1, 2].map(i => { const b = new Node(); b.dataset = { image: `/slide-${i}.webp`, alt: `Photo ${i}` }; return b; });
  image.src = '/slide-0.webp'; image.alt = 'Photo 0';
  hero.selectors = { '#hero-image': image, '#hero-next': nextImage, '.hero-playback': playback };
  hero.lists = { '[data-slide]': buttons }; hero.children = buttons;
  const grid = new Node(), controls = new Node(), prev = new Node(), next = new Node(), position = new Node();
  grid.children = [0, 1, 2, 3].map(i => { const n = new Node(); n.offsetLeft = 10 + 290 * i; return n; });
  grid.nextElementSibling = controls;
  controls.selectors = { '.service-prev': prev, '.service-next': next, '.service-position': position };
  const launcher = new Node(), dialog = new Node(), service = new Node(), whatsapp = new Node(), quote = new Node();
  launcher.hidden = true;
  dialog.selectors = { '#enquiry-service': service, '[data-enquiry-whatsapp]': whatsapp, '[data-enquiry-quote]': quote };
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; body.classList.remove('modal-open'); dialog.emit('close'); };
  const document = new Node(); document.documentElement = root; document.body = body; document.hidden = false;
  document.selectors = { '.hero': hasHero ? hero : null, '.enquiry-launcher': launcher, '#enquiry-dialog': dialog };
  document.lists = { '.service-carousel': [grid] };
  const reduce = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  const window = new Node(); window.IntersectionObserver = true; window.MutationObserver = true;
  const context = { document, window, matchMedia: () => reduce,
    Image: class { constructor() { probes.push(this); } },
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, at: clock + delay, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    IntersectionObserver: class { constructor(fn, options = {}) { this.fn = fn; this.options = options; this.nodes = []; observers.push(this); } observe(n) { this.nodes.push(n); } },
    MutationObserver: class { constructor(fn) { mutations.push(fn); } observe() {} } };
  vm.runInNewContext(source, context);
  const heroObserver = observers.find(o => o.nodes.includes(hero));
  const visible = on => heroObserver?.fn([{ isIntersecting: on, target: hero }]);
  async function advance(ms) {
    clock += ms;
    for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.fn(); }
    await Promise.resolve(); await Promise.resolve();
  }
  async function loaded(index, fail = false) {
    const probe = [...probes].reverse().find(p => p.src === `/slide-${index}.webp`);
    assert(probe, `No pending image for ${index}`);
    fail ? probe.onerror() : probe.onload();
    await Promise.resolve(); await Promise.resolve();
  }
  const automaticTimers = () => [...timers.values()].filter(t => t.delay === 8000);
  return { document, body, hero, image, nextImage, playback, label, buttons, grid, prev, next, position,
    launcher, dialog, service, whatsapp, quote, reduce, window, visible, advance, loaded, observers, mutations, automaticTimers };
}

let passed = 0;
async function test(name, run) { await run(); console.log('PASS', name); passed++; }
(async () => {
  await test('Visible hero advances after eight seconds and commits only a loaded image', async () => {
    const f = fixture(); f.visible(true); await f.advance(7999); assert.equal(f.image.src, '/slide-0.webp');
    await f.advance(1); assert.equal(f.image.src, '/slide-0.webp');
    await f.loaded(1); assert(f.nextImage.classList.contains('is-blending'));
    await f.advance(760); assert.equal(f.image.src, '/slide-1.webp'); assert.equal(f.buttons[1].attrs['aria-pressed'], 'true');
  });
  await test('Off-screen, hidden and modal states stop autoplay and it resumes safely', async () => {
    const f = fixture(); f.visible(true); assert.equal(f.automaticTimers().length, 1);
    f.visible(false); assert.equal(f.automaticTimers().length, 0);
    f.visible(true); f.document.hidden = true; f.document.emit('visibilitychange'); assert.equal(f.automaticTimers().length, 0);
    f.document.hidden = false; f.document.emit('visibilitychange');
    f.body.classList.add('modal-open'); f.mutations.forEach(fn => fn()); assert.equal(f.automaticTimers().length, 0);
    f.body.classList.remove('modal-open'); f.mutations.forEach(fn => fn()); assert.equal(f.automaticTimers().length, 1);
  });
  await test('Leaving the viewport during a fade does not leave playback stuck', async () => {
    const f = fixture(); f.visible(true); await f.advance(8000); await f.loaded(1);
    f.visible(false); assert.equal(f.image.src, '/slide-1.webp');
    f.visible(true); assert.equal(f.automaticTimers().length, 1);
  });
  await test('Manual selection pauses and late image requests cannot replace a newer choice', async () => {
    const f = fixture(); f.visible(true); f.buttons[2].emit('click'); f.buttons[1].emit('click');
    await f.loaded(1); await f.advance(760); await f.loaded(2);
    assert.equal(f.image.src, '/slide-1.webp'); assert.equal(f.playback.attrs['aria-label'], 'Resume slideshow');
    assert.equal(f.automaticTimers().length, 0);
  });
  await test('A failed image leaves the displayed image and selected capability intact', async () => {
    const f = fixture(); f.visible(true); await f.advance(8000); await f.loaded(1, true);
    assert.equal(f.image.src, '/slide-0.webp'); assert(!f.nextImage.classList.contains('is-blending'));
    assert.notEqual(f.buttons[1].attrs['aria-pressed'], 'true'); assert.equal(f.automaticTimers().length, 1);
  });
  await test('Reduced motion disables autoplay and changes manually selected images immediately', async () => {
    const f = fixture({ reduced: true }); f.visible(true); assert.equal(f.automaticTimers().length, 0); assert(f.playback.disabled);
    f.buttons[1].emit('click'); await f.loaded(1); assert.equal(f.image.src, '/slide-1.webp');
    assert(!f.nextImage.classList.contains('is-blending'));
  });
  await test('Changing reduced motion during a fade settles it and cancels automatic work', async () => {
    const f = fixture(); f.visible(true); await f.advance(8000); await f.loaded(1);
    f.reduce.matches = true; f.reduce.change(); assert.equal(f.image.src, '/slide-1.webp');
    assert(!f.nextImage.classList.contains('is-blending')); assert.equal(f.automaticTimers().length, 0);
  });
  await test('Carousel controls use horizontal scrolling and stop at both ends', async () => {
    const f = fixture(); assert(f.prev.disabled); f.next.emit('click');
    assert.equal(f.grid.lastScroll.left, 290); assert.equal(f.grid.lastScroll.behavior, 'smooth');
    f.next.emit('click'); f.next.emit('click'); assert(f.next.disabled); assert.equal(f.position.textContent, '4 / 4');
    f.reduce.matches = true; f.prev.emit('click'); assert.equal(f.grid.lastScroll.behavior, 'auto');
  });
  await test('Contact panel opens, closes and passes the selected service to real contact links', async () => {
    const f = fixture({ hasHero: false }); assert(!f.launcher.hidden); f.launcher.emit('click');
    assert(f.dialog.open); assert.equal(f.launcher.attrs['aria-expanded'], 'true');
    f.service.value = 'Offshore & subsea'; f.service.emit('change');
    assert.equal(f.quote.href, '/contact?service=Offshore%20%26%20subsea#quote');
    assert(f.whatsapp.href.startsWith('https://wa.me/2348037445836?text='));
    f.dialog.close(); assert.equal(f.launcher.attrs['aria-expanded'], 'false');
  });
  console.log(`${passed} experience regressions passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
