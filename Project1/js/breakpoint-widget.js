document.addEventListener('DOMContentLoaded', () => {
  const widthEl = document.getElementById('viewportWidth');
  const modeEl = document.getElementById('layoutMode');
  const badgeEl = document.getElementById('breakpointBadge');

  function updateViewportInfo() {
    const width = window.innerWidth;
    if (widthEl) widthEl.textContent = `${width}px`;

    let mode = 'Mobile (< 768px)';
    let badgeLabel = 'Mobile';
    let badgeClass = 'badge-mocha';

    if (width >= 1024) {
      mode = 'Desktop (≥ 1024px 2D Grid)';
      badgeLabel = 'Desktop';
      badgeClass = 'badge-ethereal';
    } else if (width >= 768) {
      mode = 'Tablet (768px - 1023px)';
      badgeLabel = 'Tablet';
      badgeClass = 'badge-mocha';
    }

    if (modeEl) modeEl.textContent = mode;
    if (badgeEl) {
      badgeEl.textContent = badgeLabel;
      badgeEl.className = `badge ${badgeClass}`;
    }
  }

  updateViewportInfo();
  window.addEventListener('resize', updateViewportInfo);

  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.roadmap-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', 'true');
        }
      });
    });
  });
});
