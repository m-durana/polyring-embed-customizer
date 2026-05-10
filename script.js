const previewEl = document.getElementById('preview');
const bannerEl = document.getElementById('banner');
const dividerEl = document.getElementById('divider');
const controlsEl = document.getElementById('controls');

const lightDefaults = {
  '--background-color': '#FFFFFF',
  '--outer-border-color': '#DDDDDD',
  '--inner-border-color': '#DDDDDD',
  '--text-color': '#444444',
  '--href-color': '#7b16ff',
  '--href-color-active': '#6200e2'
};
const darkDefaults = {
  '--background-color': '#000000',
  '--outer-border-color': '#222222',
  '--inner-border-color': '#DDDDDD',
  '--text-color': '#DDDDDD',
  '--href-color': '#9f56ff',
  '--href-color-active': '#9f56ff'
};

const colorSwatches = [
  'rgba(244, 67, 54, 1)',
  'rgba(233, 30, 99, 0.95)',
  'rgba(156, 39, 176, 0.9)',
  'rgba(103, 58, 183, 0.85)',
  'rgba(63, 81, 181, 0.8)',
  'rgba(33, 150, 243, 0.75)',
  'rgba(3, 169, 244, 0.7)',
  'rgba(0, 188, 212, 0.7)',
  'rgba(0, 150, 136, 0.75)',
  'rgba(76, 175, 80, 0.8)',
  'rgba(139, 195, 74, 0.85)',
  'rgba(205, 220, 57, 0.9)',
  'rgba(255, 235, 59, 0.95)',
  'rgba(255, 193, 7, 1)'
];

const pickrComponents = {
  preview: true,
  opacity: false,
  hue: true,
  interaction: {
    hex: true,
    rgba: true,
    hsla: true,
    hsva: true,
    cmyk: true,
    input: true
  }
};

const varMap = {
  '--background-color': 'bgColorPicker',
  '--outer-border-color': 'borderColorPicker',
  '--inner-border-color': 'innerBorderColorPicker',
  '--text-color': 'textColorPicker',
  '--href-color': 'linkColorPicker',
  '--href-color-active': 'linkActiveColorPicker'
};

const pickrs = {};

function createPicker(el, defaultColor) {
  return Pickr.create({
    el,
    theme: 'classic',
    default: defaultColor,
    swatches: colorSwatches,
    comparison: false,
    components: pickrComponents
  });
}

pickrs.preview = createPicker('#previewBgPicker', '#ffffff').on('change', (color) => {
  previewEl.style.background = color.toHEXA().toString();
});

Object.entries(varMap).forEach(([cssVar, elementId]) => {
  pickrs[cssVar] = createPicker('#' + elementId, darkDefaults[cssVar] || lightDefaults[cssVar]).on('change', (color) => {
    bannerEl.style.setProperty(cssVar, color.toHEXA().toString());
  });
});

const transToggle = document.getElementById('transparentToggle');
transToggle.addEventListener('change', (event) => {
  const isChecked = event.target.checked;
  const bgColor = pickrs['--background-color'].getColor().toHEXA().toString();
  bannerEl.style.setProperty('--background-color', isChecked ? 'transparent' : bgColor);
});

function applyTheme(themeDefaults) {
  for (const [cssVar, colorValue] of Object.entries(themeDefaults)) {
    if (pickrs[cssVar]) {
      pickrs[cssVar].setColor(colorValue);
      bannerEl.style.setProperty(cssVar, colorValue);
    }
  }
  transToggle.checked = false;
}

let isResizing = false;

function resizePreview(clientY) {
  const minPreviewHeight = 150;
  const minControlsHeight = 180;
  const maxPreviewHeight = Math.max(minPreviewHeight, window.innerHeight - minControlsHeight);
  const nextHeight = Math.max(minPreviewHeight, Math.min(clientY, maxPreviewHeight));
  document.body.style.setProperty('--preview-height', nextHeight + 'px');
  clampBannerToPreview();
}

dividerEl.addEventListener('pointerdown', (e) => {
  isResizing = true;
  document.body.style.cursor = 'row-resize';
  dividerEl.setPointerCapture?.(e.pointerId);
  e.preventDefault();
});

window.addEventListener('pointermove', (e) => {
  if (!isResizing) return;
  resizePreview(e.clientY);
});

window.addEventListener('pointerup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = '';
  }
});

window.addEventListener('pointercancel', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = '';
  }
});

let isDragging = false;
let startX = 0, startY = 0;
let origX = 0, origY = 0;

function clampBannerPosition(x, y) {
  const previewRect = previewEl.getBoundingClientRect();
  const maxX = Math.max(0, previewRect.width - bannerEl.offsetWidth);
  const maxY = Math.max(0, previewRect.height - bannerEl.offsetHeight);

  return {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  };
}

function clampBannerToPreview() {
  const currentX = parseFloat(bannerEl.style.left || '0');
  const currentY = parseFloat(bannerEl.style.top || '0');
  const { x, y } = clampBannerPosition(currentX, currentY);

  bannerEl.style.left = x + 'px';
  bannerEl.style.top = y + 'px';
}

function centerBanner() {
  const previewRect = previewEl.getBoundingClientRect();
  const bannerRect = bannerEl.getBoundingClientRect();
  bannerEl.style.left = Math.max(0, (previewRect.width - bannerRect.width) / 2) + 'px';
  bannerEl.style.top = Math.max(0, (previewRect.height - bannerRect.height) / 2) + 'px';
}

bannerEl.addEventListener('pointerdown', (e) => {
  isDragging = true;
  bannerEl.style.cursor = 'grabbing';
  startX = e.clientX;
  startY = e.clientY;

  const previewRect = previewEl.getBoundingClientRect();
  const bannerRect = bannerEl.getBoundingClientRect();
  origX = bannerRect.left - previewRect.left;
  origY = bannerRect.top - previewRect.top;

  bannerEl.setPointerCapture?.(e.pointerId);
  e.preventDefault();
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  const { x, y } = clampBannerPosition(origX + dx, origY + dy);

  bannerEl.style.left = x + 'px';
  bannerEl.style.top = y + 'px';
});

window.addEventListener('pointerup', () => {
  if (isDragging) {
    isDragging = false;
    bannerEl.style.cursor = 'grab';
  }
});

window.addEventListener('pointercancel', () => {
  if (isDragging) {
    isDragging = false;
    bannerEl.style.cursor = 'grab';
  }
});

window.addEventListener('resize', clampBannerToPreview);

function exportJson() {
  const themeJson = {};
  Object.keys(varMap).forEach(cssVar => {
    themeJson[cssVar] = getComputedStyle(bannerEl).getPropertyValue(cssVar).trim();
  });

  if (transToggle.checked) {
    themeJson['--background-color'] = 'transparent';
  }

  const blob = new Blob([JSON.stringify(themeJson, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'polyring-theme.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

document.getElementById('resetLight').onclick = () => applyTheme(lightDefaults);
document.getElementById('resetDark').onclick = () => applyTheme(darkDefaults);
document.getElementById('exportJson').onclick = exportJson;

customElements.whenDefined('webring-banner').then(() => {
  centerBanner();
  applyTheme(darkDefaults);
});
