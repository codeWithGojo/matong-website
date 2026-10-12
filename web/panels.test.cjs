const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const source = fs.readFileSync('web/panels.js', 'utf8');

function fixture({ touch = false, reduced = false } = {}) {
  let clock = 0, serial = 0;
  const timers = new Map(), frames = new Map();
  class Node {
    constructor() {
      this.children = []; this.events = {}; this.attrs = {}; this.dataset = {};
      this.hidden = false; this.open = false; this.inert = false; this.scrollHeight = 180;
      this.style = { removeProperty(k) { delete this[k]; } };
      const values = new Set();
      this.classList = { add: v => values.add(v), contains: v => values.has(v),
        toggle(v, on) { on ? values.add(v) : values.delete(v); } };
    }
    append(node) {
      if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
      this.children.push(node); node.parent = this;
    }
    before(node) {
      const parent = this.parent;
      parent.children.splice(parent.children.indexOf(this), 0, node); node.parent = parent;
    }
    get nextSibling() { return this.parent.children[this.parent.children.indexOf(this) + 1]; }
    querySelector() { return this.children[0]; }
    contains(node) { return !!node && (this === node || this.children.some(c => c.contains(node))); }
    setAttribute(k, v) { this.attrs[k] = String(v); }
    addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
    emit(type, extra = {}, bubble = true) {
      const event = { target: this, pointerType: touch ? 'touch' : 'mouse', preventDefault() {}, ...extra };
      for (let node = this; node; node = bubble ? node.parent : null)
        (node.events[type] || []).forEach(fn => fn(event));
    }
    focus() {
      const previous = document.activeElement;
      if (previous === this) return;
      previous?.emit('focusout', { relatedTarget: this });
      document.activeElement = this;
      this.emit('focus', {}, false); this.emit('focusin');
    }
    getBoundingClientRect() { return { height: this.style.height === 'auto' ? 180 : parseFloat(this.style.height) || 0 }; }
    get offsetHeight() { return this.getBoundingClientRect().height; }
  }
  const document = new Node(), body = new Node(), nav = new Node(), intro = new Node(), locations = new Node();
  document.append(body); body.append(nav); body.append(intro); body.append(locations);
  const details = [0, 1].map(() => {
    const host = new Node(); host.classList.add('faq');
    host.append(new Node()); host.append(new Node()); intro.append(host); return host;
  });
  const panels = [0, 1, 2].map((i) => {
    const panel = new Node(); panel.id = `office-${i}`; panel.hidden = i !== 0; locations.append(panel); return panel;
  });
  const tabs = panels.map((_, i) => {
    const tab = new Node(); tab.dataset.office = String(i); locations.append(tab); return tab;
  });
  document.querySelectorAll = s => s === '.faq' ? details : s === '[data-office]' ? tabs : [];
  document.querySelector = s => ({ '#navigation': nav, '.enquiry-intro': intro }[s]) || null;
  document.getElementById = id => id === 'locations' ? locations : panels.find(p => p.id === id);
  document.createElement = () => new Node();
  const reduce = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  const context = { document, matchMedia: s => s.includes('reduced') ? reduce : { matches: !touch },
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, { fn, at: clock + delay }); return id; },
    clearTimeout: id => timers.delete(id), requestAnimationFrame(fn) { const id = ++serial; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id) };
  vm.runInNewContext(source, context);
  function advance(ms) {
    clock += ms;
    const current = [...frames.values()]; frames.clear(); current.forEach(fn => fn());
    for (const [id, timer] of [...timers]) if (timer.at <= clock) { timers.delete(id); timer.fn(); }
  }
  const click = trigger => { trigger.emit('pointerdown'); trigger.focus(); trigger.emit('click'); };
  return { tabs, panels, details, locations, intro, reduce, document, advance, click, frames };
}
let passed = 0;
function test(name, run) { run(); console.log('PASS', name); passed++; }
test('Hover selects one office and synchronises expanded/selected state', () => {
  const f = fixture(); f.tabs[1].emit('pointerenter', {}, false);
  assert.equal(f.tabs[1].attrs['aria-expanded'], 'true');
  assert.equal(f.tabs[0].attrs['aria-selected'], 'false');
  assert(f.panels[0].parent.hidden); assert(!f.panels[1].parent.inert);
});
test('Close waits 150ms and entering the content cancels it', () => {
  const f = fixture(); f.tabs[1].emit('pointerenter', {}, false); f.advance(16);
  f.tabs[1].emit('pointerleave', {}, false); f.advance(149);
  assert.equal(f.tabs[1].attrs['aria-expanded'], 'true');
  f.panels[1].parent.emit('pointerenter', {}, false); f.advance(500);
  assert.equal(f.tabs[1].attrs['aria-expanded'], 'true');
  f.locations.emit('pointerleave', {}, false); f.advance(150);
  assert.equal(f.tabs[1].attrs['aria-expanded'], 'false');
});
test('Touch tap opens and closes despite pointer-induced focus', () => {
  const f = fixture({ touch: true }); f.click(f.tabs[1]);
  assert.equal(f.tabs[1].attrs['aria-expanded'], 'true');
  f.click(f.tabs[1]); assert.equal(f.tabs[1].attrs['aria-expanded'], 'false');
  f.tabs[2].emit('pointerenter', {}, false); assert.equal(f.tabs[2].attrs['aria-expanded'], 'false');
});
test('Focus opens; arrow keys move focus; Escape closes without reopening', () => {
  const f = fixture(); f.tabs[1].focus(); f.tabs[1].emit('keydown', { key: 'ArrowRight' });
  assert.equal(f.document.activeElement, f.tabs[2]); assert.equal(f.tabs[2].attrs['aria-expanded'], 'true');
  f.tabs[2].emit('keydown', { key: 'Escape' }); assert.equal(f.tabs[2].attrs['aria-expanded'], 'false');
});
test('Closed panels immediately become inert and are hidden after transition', () => {
  const f = fixture(); f.click(f.tabs[0]); f.advance(16);
  assert(f.panels[0].parent.inert); assert.equal(f.panels[0].parent.attrs['aria-hidden'], 'true');
  f.advance(431); assert(f.panels[0].parent.hidden);
});
test('FAQ keeps only one disclosure open and retains native details semantics', () => {
  const f = fixture(); f.details[0].emit('pointerenter', {}, false);
  f.details[1].emit('pointerenter', {}, false);
  assert(!f.details[0].open); assert(f.details[1].open);
  assert.equal(f.details[1].children[0].attrs['aria-expanded'], 'true');
});
test('Reduced motion updates panels immediately without animation frames', () => {
  const f = fixture({ reduced: true }); f.tabs[1].focus();
  assert.equal(f.frames.size, 0); assert.equal(f.panels[1].parent.style.height, 'auto');
  f.click(f.tabs[1]); assert(f.panels[1].parent.hidden);
});
test('Changing to reduced motion cancels a pending expansion', () => {
  const f = fixture(); f.tabs[1].focus(); f.reduce.matches = true; f.reduce.change();
  assert.equal(f.frames.size, 0); assert.equal(f.panels[1].parent.style.height, 'auto');
});
console.log(`${passed} panel interaction regressions passed.`);
