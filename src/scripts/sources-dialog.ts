/** Footer “Sources for figures”: opens the full source list in a modal dialog. */
export function initSourcesDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-sources-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  let opener: HTMLElement | null = null;
  document.querySelectorAll<HTMLAnchorElement>('[data-open-sources]').forEach((a) => {
    a.setAttribute('role', 'button');
    a.setAttribute('aria-haspopup', 'dialog');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      opener = a;
      dialog.showModal();
    });
    a.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        a.click();
      }
    });
  });
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
}

if (!document.querySelector('[data-header]')) initSourcesDialog();
