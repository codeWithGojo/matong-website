/* Shared hover, touch and keyboard behaviour for the existing site panels. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const controllers = [];
  let keyboard = false;
  document.addEventListener('keydown', () => { keyboard = true; });
  document.addEventListener('pointerdown', () => { keyboard = false; }, true);

  function createGroup(items, boundary, isTabs = false) {
    if (!items.length) return;
    let active = null, closeTimer = 0, ignoreFocus = false;
    const cancelClose = () => { clearTimeout(closeTimer); closeTimer = 0; };

    function finish(item) {
      clearTimeout(item.timer);
      item.clip.style.height = item.expanded ? 'auto' : '0px';
      if (!item.expanded) {
        if (item.details) item.host.open = false;
        else item.clip.hidden = true;
      }
    }

    function setExpanded(item, expanded, instant = false) {
      cancelAnimationFrame(item.frame);
      clearTimeout(item.timer);
      const height = item.clip.hidden || (item.details && !item.host.open)
        ? 0 : item.clip.getBoundingClientRect().height;
      item.expanded = expanded;
      item.trigger.setAttribute('aria-expanded', String(expanded));
      item.host.classList.toggle('is-expanded', expanded);
      item.clip.inert = !expanded;
      item.clip.setAttribute('aria-hidden', String(!expanded));
      if (isTabs) item.trigger.setAttribute('aria-selected', String(expanded));
      if (expanded) {
        item.clip.hidden = false;
        if (item.details) item.host.open = true;
      }
      if (instant || reduce.matches) {
        item.clip.style.transition = 'none';
        item.clip.style.opacity = expanded ? '1' : '0';
        finish(item);
        item.clip.style.removeProperty('transition');
        return;
      }
      item.clip.style.height = `${height}px`;
      // Measure once per interaction; there is no layout-reading animation loop.
      const destination = expanded ? item.inner.scrollHeight : 0;
      void item.clip.offsetHeight;
      item.frame = requestAnimationFrame(() => {
        item.clip.style.height = `${destination}px`;
        item.clip.style.opacity = expanded ? '1' : '0';
        item.timer = setTimeout(() => finish(item), 430);
      });
    }

    function close(instant = false) {
      cancelClose();
      if (!active) return;
      const previous = active;
      active = null;
      setExpanded(previous, false, instant);
    }

    function open(item) {
      cancelClose();
      if (active === item) return;
      // Hide the previous panel before revealing the next: never two open panels.
      close(true);
      items.forEach(other => {
        if (other !== item && other.expanded) setExpanded(other, false, true);
      });
      active = item;
      if (isTabs) items.forEach(other => { other.trigger.tabIndex = other === item ? 0 : -1; });
      setExpanded(item, true);
    }

    function scheduleClose() {
      cancelClose();
      closeTimer = setTimeout(() => {
        if (keyboard && boundary.contains(document.activeElement)) return;
        close();
      }, 150);
    }

    for (const item of items) {
      item.host.classList.add('panel-enhanced');
      item.clip.classList.add('panel-clip');
      item.inner.classList.add('panel-inner');
      item.trigger.setAttribute('aria-controls', item.clip.id);
      let pointerState = null;
      item.trigger.addEventListener('pointerdown', () => { pointerState = item.expanded; });
      item.trigger.addEventListener('click', event => {
        event.preventDefault();
        const wasOpen = pointerState ?? item.expanded;
        pointerState = null;
        wasOpen ? close() : open(item);
      });
      item.trigger.addEventListener('focus', () => {
        if (!ignoreFocus && pointerState === null) open(item);
      });
      item.host.addEventListener('pointerenter', event => {
        if (hover.matches && event.pointerType !== 'touch') open(item);
      });
      item.host.addEventListener('pointerleave', event => {
        if (hover.matches && event.pointerType !== 'touch') scheduleClose();
      });
      item.clip.addEventListener('pointerenter', cancelClose);
      item.clip.addEventListener('pointerleave', event => {
        if (hover.matches && event.pointerType !== 'touch') scheduleClose();
      });
      item.clip.addEventListener('transitionend', event => {
        if (event.target === item.clip && event.propertyName === 'height') finish(item);
      });
      if (isTabs) item.trigger.addEventListener('keydown', event => {
        const index = items.indexOf(item);
        const next = { ArrowRight: (index + 1) % items.length,
          ArrowLeft: (index - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[event.key];
        if (next !== undefined) {
          event.preventDefault();
          items[next].trigger.focus();
        }
      });
      if (item.expanded && !active) active = item;
      setExpanded(item, item === active, true);
    }
    boundary.addEventListener('pointerenter', cancelClose);
    boundary.addEventListener('pointerleave', event => {
      if (hover.matches && event.pointerType !== 'touch') scheduleClose();
    });
    boundary.addEventListener('focusin', cancelClose);
    boundary.addEventListener('focusout', event => {
      if (!boundary.contains(event.relatedTarget)) scheduleClose();
    });
    boundary.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const trigger = active?.trigger;
      close();
      ignoreFocus = true;
      trigger?.focus();
      ignoreFocus = false;
    });
    const controller = { boundary, close, settle: () => items.forEach(item => {
      cancelAnimationFrame(item.frame);
      finish(item);
    }) };
    controllers.push(controller);
  }

  function detailItems(selector) {
    return [...document.querySelectorAll(selector)].map((host, index) => {
      const trigger = host.querySelector('summary');
      const expanded = host.open;
      const clip = document.createElement('div');
      clip.id = `${host.classList.contains('nav-group') ? 'nav' : 'faq'}-panel-${index}`;
      const inner = document.createElement('div');
      while (trigger.nextSibling) inner.append(trigger.nextSibling);
      clip.append(inner);
      host.append(clip);
      return { host, trigger, clip, inner, details: true, expanded, frame: 0, timer: 0 };
    });
  }
  const nav = detailItems('.nav-group');
  createGroup(nav, document.querySelector('#navigation'));
  const faqs = detailItems('.faq');
  createGroup(faqs, document.querySelector('.enquiry-intro'));
  const offices = [...document.querySelectorAll('[data-office]')].map(trigger => {
    const inner = document.getElementById(`office-${trigger.dataset.office}`);
    const expanded = !inner.hidden;
    const clip = document.createElement('div');
    clip.id = `${inner.id}-clip`;
    inner.before(clip);
    clip.append(inner);
    inner.hidden = false;
    return { host: trigger, trigger, clip, inner, expanded, frame: 0, timer: 0 };
  });
  if (offices.length) createGroup(offices, document.getElementById('locations'), true);
  document.addEventListener('click', event => controllers.forEach(controller => {
    if (!controller.boundary.contains(event.target)) controller.close();
  }));
  document.querySelector('.mobile-menu')?.addEventListener('click', () => {
    if (!document.body.classList.contains('nav-open')) controllers[0]?.close(true);
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) controllers.forEach(controller => controller.settle());
  });
})();
