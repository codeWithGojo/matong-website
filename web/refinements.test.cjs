const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('web/refinements.js', 'utf8');

function fixture({ reduced = false, observer = true } = {}) {
  let now = 0, serial = 0;
  const timers = new Map(), observers = [], mutations = [];
  class Node {
    constructor() {
      this.events = {}; this.attrs = {}; this.selectors = {}; this.hidden = false;
      const values = new Set();
      this.classList = { add: v => values.add(v), remove: v => values.delete(v), contains: v => values.has(v) };
    }
    addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
    emit(k, extra = {}) { (this.events[k] || []).forEach(fn => fn({ pointerType: 'mouse', target: this, ...extra })); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    getAttribute(k) { return this.attrs[k]; }
    querySelector(k) { return this.selectors[k] || null; }
    contains(node) { return node === this || tabs.includes(node) || panels.includes(node); }
    focus() { document.activeElement = this; box.emit('focusin'); }
  }
  const box = new Node(), playback = new Node(), status = new Node(), body = new Node();
  const panels = [0, 1, 2, 3].map(() => new Node());
  const tabs = panels.map((_, i) => { const node = new Node(); node.setAttribute('aria-controls', `panel-${i}`); return node; });
  box.querySelectorAll = () => tabs;
  box.selectors = { '.showcase-playback': playback, '.showcase-position': status };
  const document = new Node(); document.body = body; document.hidden = false;
  document.querySelector = () => box; document.getElementById = id => panels[Number(id.split('-')[1])];
  const window = new Node();
  const reduce = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  const context = { document, window, matchMedia: () => reduce,
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, at: now + delay }); return id; },
    clearTimeout: id => timers.delete(id),
    MutationObserver: class { constructor(fn) { this.fn = fn; mutations.push(this); } observe() {} },
  };
  window.MutationObserver = context.MutationObserver;
  if (observer) {
    context.IntersectionObserver = class { constructor(fn) { this.fn = fn; observers.push(this); } observe() {} };
    window.IntersectionObserver = context.IntersectionObserver;
  }
  vm.createContext(context); vm.runInContext(source, context);
  function advance(ms) {
    const end = now + ms;
    for (;;) {
      const due = [...timers].filter(([, job]) => job.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      now = due[1].at; timers.delete(due[0]); due[1].fn();
    }
    now = end;
  }
  function visibility(visible, ratio = 1) { observers[0]?.fn([{ isIntersecting: visible, intersectionRatio: ratio }]); }
  return { box, panels, tabs, playback, status, body, document, window, reduce, timers, mutations, advance, visibility };
}

let passed = 0;
function check(name, fn) { fn(); console.log('PASS', name); passed++; }
check('One service is open with correct selection and roving tabindex', () => {
  const f = fixture(); assert.deepEqual(f.panels.map(p => p.hidden), [false, true, true, true]);
  assert.deepEqual(f.tabs.map(t => t.tabIndex), [0, -1, -1, -1]); assert.equal(f.tabs[0].attrs['aria-selected'], 'true');
});
check('Offscreen showcase stays still, visible showcase advances at eight seconds', () => {
  const f = fixture(); f.advance(16000); assert.equal(f.status.textContent, '1 / 4');
  f.visibility(true); f.advance(7999); assert.equal(f.status.textContent, '1 / 4');
  f.advance(1); assert.equal(f.status.textContent, '2 / 4'); assert.equal(f.status.attrs['aria-live'], 'off');
});
check('Manual choice pauses automatic rotation until Resume', () => {
  const f = fixture(); f.visibility(true); f.tabs[2].emit('click'); f.advance(16000);
  assert.equal(f.status.textContent, '3 / 4'); assert.equal(f.playback.attrs['aria-label'], 'Resume service rotation');
  assert.equal(f.status.attrs['aria-live'], 'polite'); f.playback.emit('click'); f.advance(8000);
  assert.equal(f.status.textContent, '4 / 4');
});
check('Mouse hover pauses; touch pointer events do not leave a sticky hover pause', () => {
  const f = fixture(); f.visibility(true); f.box.emit('pointerenter'); f.advance(16000);
  assert.equal(f.status.textContent, '1 / 4'); f.box.emit('pointerleave'); f.box.emit('pointerenter', { pointerType: 'touch' });
  f.advance(8000); assert.equal(f.status.textContent, '2 / 4');
});
check('Keyboard focus suspends playback until focus leaves the component', () => {
  const f = fixture(); f.visibility(true); f.tabs[0].focus(); f.advance(16000); assert.equal(f.status.textContent, '1 / 4');
  f.box.emit('focusout', { relatedTarget: null }); f.advance(8000); assert.equal(f.status.textContent, '2 / 4');
});
check('Arrow keys wrap and Home/End select and focus the correct tab', () => {
  const f = fixture(); let prevented = 0;
  f.tabs[0].emit('keydown', { key: 'ArrowLeft', preventDefault() { prevented++; } });
  assert.equal(f.document.activeElement, f.tabs[3]); assert.equal(f.status.textContent, '4 / 4');
  f.tabs[3].emit('keydown', { key: 'Home', preventDefault() {} }); assert.equal(f.document.activeElement, f.tabs[0]);
  f.tabs[0].emit('keydown', { key: 'End', preventDefault() {} }); assert.equal(f.document.activeElement, f.tabs[3]);
  assert.equal(prevented, 1);
});
check('Hidden browser tabs and barely visible sections stop the timer', () => {
  const f = fixture(); f.visibility(true); f.document.hidden = true; f.document.emit('visibilitychange');
  f.advance(16000); assert.equal(f.status.textContent, '1 / 4'); f.document.hidden = false; f.document.emit('visibilitychange');
  f.visibility(true, .1); f.advance(16000); assert.equal(f.status.textContent, '1 / 4');
});
check('Open navigation or dialogs suspend service autoplay', () => {
  const f = fixture(); f.visibility(true); f.body.classList.add('modal-open'); f.mutations[0].fn();
  f.advance(16000); assert.equal(f.status.textContent, '1 / 4'); f.body.classList.remove('modal-open');
  f.body.classList.add('nav-open'); f.mutations[0].fn(); f.advance(16000); assert.equal(f.status.textContent, '1 / 4');
});
check('Reduced motion allows manual selection but no autoplay or entrance classes', () => {
  const f = fixture({ reduced: true }); f.visibility(true); f.advance(16000); assert.equal(f.status.textContent, '1 / 4');
  f.tabs[1].emit('click'); assert.equal(f.status.textContent, '2 / 4'); assert(f.playback.disabled);
  assert(!f.panels.some(p => p.classList.contains('is-entering'))); assert.equal(f.timers.size, 0);
});
check('Changing reduced-motion preference cancels both animation and playback', () => {
  const f = fixture(); f.visibility(true); f.advance(8000); assert(f.panels[1].classList.contains('is-entering'));
  f.reduce.matches = true; f.reduce.change(); assert.equal(f.timers.size, 0);
  assert(!f.panels.some(p => p.classList.contains('is-entering')));
});
check('Rapid choices settle on the newest panel without a stale arrival timer', () => {
  const f = fixture(); f.tabs[1].emit('click'); f.tabs[3].emit('click'); f.advance(600);
  assert.deepEqual(f.panels.map(p => p.hidden), [true, true, true, false]);
  assert(!f.panels.some(p => p.classList.contains('is-entering')));
});
check('Observer fallback remains usable, and pagehide clears pending work', () => {
  const f = fixture({ observer: false }); f.advance(8000); assert.equal(f.status.textContent, '2 / 4');
  f.window.emit('pagehide'); assert.equal(f.timers.size, 0);
});
console.log(`${passed} service showcase regressions passed.`);
