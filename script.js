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

const varMap = {
  '--background-color': 'bgColorPicker',
  '--outer-border-color': 'borderColorPicker',
  '--inner-border-color': 'innerBorderColorPicker',
  '--text-color': 'textColorPicker',
  '--href-color': 'linkColorPicker',
  '--href-color-active': 'linkActiveColorPicker'
};

const pickrs = {};

pickrs.preview = Pickr.create({
  el: '#previewBgPicker',
  theme: 'classic',
  default: '#ffffff',
  swatches: [
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
  ],
  comparison: false,
  components: {
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
  }
}).on('change', (color, instance) => {
  previewEl.style.background = color.toHEXA().toString();
});

Object.entries(varMap).forEach(([cssVar, elementId]) => {
  pickrs[cssVar] = Pickr.create({
    el: '#' + elementId,
    theme: 'classic',
    default: (darkDefaults[cssVar] || lightDefaults[cssVar]),
    swatches: [
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
    ],
    comparison: false,
    components: {
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
    }
  }).on('change', (color, instance) => {
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
dividerEl.addEventListener('mousedown', () => {
  isResizing = true;
  document.body.style.cursor = 'row-resize';
});

window.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  document.body.style.setProperty('--preview-height', e.clientY + 'px');
});

window.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = '';
  }
});

let isDragging = false;
let startX = 0, startY = 0;
let origX = 0, origY = 0;

bannerEl.addEventListener('mousedown', (e) => {
  isDragging = true;
  bannerEl.style.cursor = 'grabbing';
  startX = e.clientX;
  startY = e.clientY;

  const previewRect = previewEl.getBoundingClientRect();
  const bannerRect = bannerEl.getBoundingClientRect();
  origX = bannerRect.left - previewRect.left;
  origY = bannerRect.top - previewRect.top;

  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  let newX = origX + dx;
  let newY = origY + dy;

  const previewRect = previewEl.getBoundingClientRect();
  const bannerWidth = bannerEl.offsetWidth;
  const bannerHeight = bannerEl.offsetHeight;

  newX = Math.max(0, Math.min(newX, previewRect.width - bannerWidth));
  newY = Math.max(0, Math.min(newY, previewRect.height - bannerHeight));

  bannerEl.style.left = newX + 'px';
  bannerEl.style.top = newY + 'px';
});

window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    bannerEl.style.cursor = 'grab';
  }
});

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
  const previewRect = previewEl.getBoundingClientRect();
  const bannerRect = bannerEl.getBoundingClientRect();
  bannerEl.style.left = (previewRect.width - bannerRect.width) / 2 + 'px';
  bannerEl.style.top = (previewRect.height - bannerRect.height) / 2 + 'px';
  applyTheme(darkDefaults);
});
