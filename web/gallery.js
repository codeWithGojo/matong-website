/* A shared photo viewer for the homepage, services, gallery and project pages. */
(() => {
  const photos = [...document.querySelectorAll('[data-gallery]')];
  const dialog = document.getElementById('gallery-dialog');
  if (!photos.length || !dialog) return;
  const image = document.getElementById('gallery-image');
  const caption = document.getElementById('gallery-caption');
  const status = document.getElementById('gallery-status');
  const retry = dialog.querySelector('.gallery-retry');
  const previous = dialog.querySelector('.gallery-prev');
  const next = dialog.querySelector('.gallery-next');
  let index = 0, generation = 0;

  function showPhoto(position) {
    index = (position + photos.length) % photos.length;
    const photo = photos[index], request = ++generation;
    caption.textContent = `${index + 1} / ${photos.length} — ${photo.dataset.caption}`;
    image.alt = photo.dataset.alt || photo.dataset.caption;
    image.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading photo…';
    retry.hidden = true;
    previous.disabled = next.disabled = photos.length < 2;
    // Separate preloads prevent a delayed response for an earlier photo changing the current state.
    const pending = new Image();
    pending.onload = () => {
      if (request !== generation) return;
      image.src = pending.src;
      image.removeAttribute('aria-busy');
      status.textContent = '';
    };
    pending.onerror = () => {
      if (request !== generation) return;
      image.removeAttribute('src');
      image.removeAttribute('aria-busy');
      status.textContent = 'This photo could not be loaded. Try again or choose another photo.';
      retry.hidden = false;
    };
    pending.src = photo.dataset.src;
  }
  photos.forEach((photo, position) => photo.addEventListener('click', () => {
    showPhoto(position);
    dialog.showModal();
    document.body.classList.add('modal-open');
  }));
  previous.addEventListener('click', () => showPhoto(index - 1));
  next.addEventListener('click', () => showPhoto(index + 1));
  retry.addEventListener('click', () => showPhoto(index));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showPhoto(index + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  dialog.addEventListener('close', () => { ++generation; });
})();
