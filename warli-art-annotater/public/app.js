const $ = s => document.querySelector(s);
const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

let state;
let img = new Image();
let current = null;
let selected = null;
let hovered = null;
let mouse = { x: 0.5, y: 0.5 };
let box = { left: 0.06, right: 0.06, top: 0.06, bottom: 0.06 };
let pressedKeys = new Set();
let pendingBounds = null;

async function api(url, opt) {
  const r = await fetch(url, opt);
  if (!r.ok) {
    let message = r.statusText;
    try { message = (await r.json()).error || message; } catch {}
    throw new Error(message);
  }
  return r.json();
}

async function load() {
  state = await api('/api/state');
  state.project.tagShortcuts ||= {};
  $('#grid').value = state.project.defaultGrid || 10;
  renderSources();
  renderLabels();
  renderThumbs();
  if (state.images[0]) setSource(state.images[0].filename);
}

function renderSources() {
  $('#source').innerHTML = state.images.map(i => `<option>${escapeHtml(i.filename)}</option>`).join('');
}

function renderLabels() {
  const cats = Object.keys(state.labels);
  $('#cat').innerHTML = cats.map(x => `<option>${escapeHtml(x)}</option>`).join('');
  updateTags();
}

function updateTags() {
  const c = $('#cat').value;
  $('#tag').innerHTML = (state.labels[c] || []).map(x => `<option>${escapeHtml(x)}</option>`).join('');
  ensureShortcuts(c);
  updateShortcutEditor();
}

function ensureShortcuts(category) {
  if (!category) return;
  state.project.tagShortcuts ||= {};
  state.project.tagShortcuts[category] ||= {};
  const used = new Set(Object.values(state.project.tagShortcuts[category]).map(x => String(x).toLowerCase()));
  let changed = false;
  for (const tag of state.labels[category] || []) {
    if (state.project.tagShortcuts[category][tag]) continue;
    const chars = tag.toLowerCase().replace(/[^a-z0-9]/g, '').split('');
    const key = chars.find(ch => !used.has(ch));
    if (key) {
      state.project.tagShortcuts[category][tag] = key;
      used.add(key);
      changed = true;
    }
  }
  if (changed) saveProject().catch(console.error);
}

function updateShortcutEditor() {
  const c = $('#cat').value;
  const t = $('#tag').value;
  $('#shortcut').value = state?.project?.tagShortcuts?.[c]?.[t] || '';
}

function setSource(name) {
  closeTagCloud();
  current = state.images.find(x => x.filename === name);
  if (!current) return;
  $('#source').value = name;
  img.onload = () => { fitCanvas(); draw(); };
  img.src = '/source/' + encodeURIComponent(name);
  selected = null;
  hovered = null;
  renderThumbs();
}

function fitCanvas() {
  const wrap = $('#canvasWrap');
  const ratio = current.width / current.height;
  const wr = wrap.clientWidth / wrap.clientHeight;
  if (ratio > wr) {
    canvas.width = Math.floor(wrap.clientWidth);
    canvas.height = Math.floor(canvas.width / ratio);
  } else {
    canvas.height = Math.floor(wrap.clientHeight);
    canvas.width = Math.floor(canvas.height * ratio);
  }
}

function gridCell(nx, ny) {
  const n = +$('#grid').value;
  const col = Math.min(n - 1, Math.max(0, Math.floor(nx * n)));
  const row = Math.min(n - 1, Math.max(0, Math.floor(ny * n)));
  return letters(col) + (row + 1);
}

function letters(n) {
  let s = '';
  do {
    s = String.fromCharCode(65 + n % 26) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

function boundsCells(b) {
  return {
    start: gridCell(b.x, b.y),
    end: gridCell(Math.min(.999999, b.x + b.width), Math.min(.999999, b.y + b.height))
  };
}

function cropBounds() {
  // The crop is always centred on the mouse. Near an image edge, the
  // effective crop is symmetrically limited so it never shifts away from
  // the cursor or extends outside the source image.
  const requestedWidth = box.left + box.right;
  const requestedHeight = box.top + box.bottom;
  const width = Math.max(0.002, Math.min(requestedWidth, 2 * Math.min(mouse.x, 1 - mouse.x)));
  const height = Math.max(0.002, Math.min(requestedHeight, 2 * Math.min(mouse.y, 1 - mouse.y)));
  const x = mouse.x - width / 2;
  const y = mouse.y - height / 2;
  return { x, y, width, height };
}

function sourceCrops() {
  return state.crops.filter(r => r.source === current?.filename);
}

function hitTest(nx, ny) {
  const hits = sourceCrops().filter(r => {
    const b = r.bounds;
    return nx >= b.x && nx <= b.x + b.width && ny >= b.y && ny <= b.y + b.height;
  });
  return hits.length ? hits[hits.length - 1].id : null;
}

function draw() {
  if (!current) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const n = +$('#grid').value;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  for (let i = 1; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * canvas.width / n, 0);
    ctx.lineTo(i * canvas.width / n, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * canvas.height / n);
    ctx.lineTo(canvas.width, i * canvas.height / n);
    ctx.stroke();
  }

  for (const r of sourceCrops()) {
    const b = r.bounds;
    const active = r.id === selected || r.id === hovered;
    ctx.fillStyle = active ? 'rgba(255,220,0,.30)' : 'rgba(0,180,255,.18)';
    ctx.strokeStyle = active ? 'rgba(255,220,0,.95)' : 'rgba(0,180,255,.70)';
    ctx.lineWidth = active ? 2 : 1;
    ctx.fillRect(b.x * canvas.width, b.y * canvas.height, b.width * canvas.width, b.height * canvas.height);
    ctx.strokeRect(b.x * canvas.width, b.y * canvas.height, b.width * canvas.width, b.height * canvas.height);
  }

  const b = cropBounds();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x * canvas.width, b.y * canvas.height, b.width * canvas.width, b.height * canvas.height);
  const centre = gridCell(b.x + b.width / 2, b.y + b.height / 2);
  $('#cropInfo').textContent = `Centre ${centre} · ${(b.width * 100).toFixed(1)}% × ${(b.height * 100).toFixed(1)}%`;
  canvas.style.cursor = hovered ? 'pointer' : 'crosshair';
}

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  mouse.y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
  hovered = hitTest(mouse.x, mouse.y);
  draw();
});

canvas.addEventListener('mouseleave', () => {
  hovered = null;
  draw();
});

canvas.addEventListener('click', e => {
  if (!current) return;
  if (hovered) {
    selected = hovered;
    renderThumbs();
    draw();
    return;
  }

  const shortcutTag = tagForPressedShortcut();
  if (shortcutTag) {
    captureWithTag(shortcutTag);
    return;
  }

  pendingBounds = cropBounds();
  openTagCloud(e.clientX, e.clientY);
});

function tagForPressedShortcut() {
  const category = $('#cat').value;
  const map = state.project.tagShortcuts?.[category] || {};
  for (const [tag, key] of Object.entries(map)) {
    if (pressedKeys.has(String(key).toLowerCase())) return tag;
  }
  return null;
}

function openTagCloud(clientX, clientY) {
  const cloud = $('#tagCloud');
  const category = $('#cat').value;
  const tags = state.labels[category] || [];
  if (!tags.length) return;
  ensureShortcuts(category);
  cloud.innerHTML = tags.map(tag => {
    const key = state.project.tagShortcuts?.[category]?.[tag] || '';
    return `<button class="tag-chip" data-tag="${escapeAttr(tag)}"><span>${escapeHtml(tag)}</span>${key ? `<kbd>${escapeHtml(key.toUpperCase())}</kbd>` : ''}</button>`;
  }).join('');
  cloud.classList.remove('hidden');

  const wrap = $('#canvasWrap').getBoundingClientRect();
  const maxLeft = Math.max(8, wrap.width - 250);
  const maxTop = Math.max(8, wrap.height - 180);
  cloud.style.left = `${Math.max(8, Math.min(maxLeft, clientX - wrap.left + 12))}px`;
  cloud.style.top = `${Math.max(8, Math.min(maxTop, clientY - wrap.top + 12))}px`;

  cloud.querySelectorAll('.tag-chip').forEach(btn => {
    btn.onclick = ev => {
      ev.stopPropagation();
      captureWithTag(btn.dataset.tag, pendingBounds);
      closeTagCloud();
    };
  });
}

function closeTagCloud() {
  $('#tagCloud').classList.add('hidden');
  pendingBounds = null;
}

document.addEventListener('mousedown', e => {
  if (!$('#tagCloud').classList.contains('hidden') && !$('#tagCloud').contains(e.target) && e.target !== canvas) closeTagCloud();
});

async function captureWithTag(tag, explicitBounds = null) {
  const category = $('#cat').value;
  if (!current || !category || !tag) return;
  const b = explicitBounds || cropBounds();
  const centre = gridCell(b.x + b.width / 2, b.y + b.height / 2);
  const bc = boundsCells(b);
  const primaryLabel = { category, tag };
  const extras = [...document.querySelectorAll('.extra')]
    .map(el => ({ category: el.children[0].value, tag: el.children[1].value }))
    .filter(x => x.category && x.tag);

  const rec = await api('/api/crop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: current.filename,
      bounds: b,
      grid: { resolution: +$('#grid').value, centre, bounds: bc },
      primaryLabel,
      labels: [primaryLabel, ...extras]
    })
  });
  state.crops.push(rec);
  $('#tag').value = tag;
  updateShortcutEditor();
  selected = rec.id;
  hovered = null;
  renderThumbs();
  draw();
}

function renderThumbs() {
  if (!state) return;
  const list = $('#thumbList');
  list.innerHTML = state.crops
    .filter(r => !current || r.source === current.filename)
    .map(r => `<div class="thumb ${r.id === selected ? 'selected' : ''}" data-id="${escapeAttr(r.id)}"><img src="/crops/${encodeURIComponent(r.filename)}"><small>${escapeHtml(r.grid.centre)} · ${escapeHtml(r.primaryLabel.category)}:${escapeHtml(r.primaryLabel.tag)}</small><span class="badge">${escapeHtml(r.id)}</span></div>`)
    .join('');

  list.querySelectorAll('.thumb').forEach(el => {
    el.onclick = () => {
      selected = el.dataset.id;
      hovered = null;
      renderThumbs();
      draw();
    };
    el.onmouseenter = () => {
      hovered = el.dataset.id;
      draw();
    };
    el.onmouseleave = () => {
      hovered = null;
      draw();
    };
  });
  $('#delete').disabled = !selected;
}

$('#cat').onchange = () => { updateTags(); closeTagCloud(); };
$('#tag').onchange = updateShortcutEditor;
$('#source').onchange = e => setSource(e.target.value);
$('#grid').onchange = async e => {
  state.project.defaultGrid = +e.target.value;
  await saveProject();
  draw();
};

$('#shortcut').addEventListener('input', async e => {
  const category = $('#cat').value;
  const tag = $('#tag').value;
  const key = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(-1);
  e.target.value = key;
  if (!category || !tag) return;
  state.project.tagShortcuts ||= {};
  state.project.tagShortcuts[category] ||= {};
  for (const [otherTag, otherKey] of Object.entries(state.project.tagShortcuts[category])) {
    if (otherTag !== tag && otherKey === key && key) delete state.project.tagShortcuts[category][otherTag];
  }
  if (key) state.project.tagShortcuts[category][tag] = key;
  else delete state.project.tagShortcuts[category][tag];
  await saveProject();
});

$('#addCat').onclick = async () => {
  const v = $('#newCat').value.trim().toLowerCase();
  if (!v) return;
  state.labels[v] ??= [];
  await saveLabels();
  renderLabels();
  $('#cat').value = v;
  updateTags();
  $('#newCat').value = '';
};

$('#addTag').onclick = async () => {
  const v = $('#newTag').value.trim().toLowerCase();
  const c = $('#cat').value;
  if (!v || !c) return;
  if (!state.labels[c].includes(v)) state.labels[c].push(v);
  await saveLabels();
  updateTags();
  $('#tag').value = v;
  ensureShortcuts(c);
  updateShortcutEditor();
  await saveProject();
  $('#newTag').value = '';
};

function saveLabels() {
  return api('/api/labels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.labels) });
}

function saveProject() {
  return api('/api/project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.project) });
}

$('#addExtra').onclick = () => {
  const d = document.createElement('div');
  d.className = 'extra';
  d.innerHTML = `<select></select><select></select><button>×</button>`;
  const c = d.children[0], t = d.children[1];
  c.innerHTML = Object.keys(state.labels).map(x => `<option>${escapeHtml(x)}</option>`).join('');
  const upd = () => t.innerHTML = (state.labels[c.value] || []).map(x => `<option>${escapeHtml(x)}</option>`).join('');
  c.onchange = upd;
  upd();
  d.children[2].onclick = () => d.remove();
  $('#extras').appendChild(d);
};

$('#delete').onclick = async () => {
  if (!selected) return;
  await api('/api/crop/' + encodeURIComponent(selected), { method: 'DELETE' });
  state.crops = state.crops.filter(x => x.id !== selected);
  selected = null;
  hovered = null;
  renderThumbs();
  draw();
};

window.addEventListener('keydown', async e => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  const key = e.key.toLowerCase();
  pressedKeys.add(key);

  if ((e.ctrlKey || e.metaKey) && key === 'z') {
    e.preventDefault();
    const own = sourceCrops();
    if (own.length) {
      selected = own.at(-1).id;
      await $('#delete').onclick();
    }
    return;
  }
  if (e.key === 'Delete') {
    e.preventDefault();
    await $('#delete').onclick();
    return;
  }
  if (e.key === 'Escape') {
    closeTagCloud();
    selected = null;
    hovered = null;
    renderThumbs();
    draw();
    return;
  }

  const fine = e.altKey ? 0.002 : 0.006;

  if (e.key === '[' || e.key === ']') {
    e.preventDefault();
    const width = box.left + box.right;
    const height = box.top + box.bottom;
    const avg = (width + height) / 2;
    const side = Math.max(0.01, Math.min(0.8, avg + (e.key === ']' ? fine * 2 : -fine * 2)));
    box.left = box.right = box.top = box.bottom = side / 2;
    draw();
    return;
  }

  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  e.preventDefault();

  // One-handed, centred rectangle sizing:
  // Left / Up increase; Right / Down decrease. Both opposing sides move
  // equally, so the crop never becomes asymmetric around the mouse.
  const minSize = 0.008;
  const maxSize = 0.8;
  let width = box.left + box.right;
  let height = box.top + box.bottom;
  const step = fine * 2;

  if (e.key === 'ArrowLeft') width = clamp(width + step, minSize, maxSize);
  if (e.key === 'ArrowRight') width = clamp(width - step, minSize, maxSize);
  if (e.key === 'ArrowUp') height = clamp(height + step, minSize, maxSize);
  if (e.key === 'ArrowDown') height = clamp(height - step, minSize, maxSize);

  box.left = box.right = width / 2;
  box.top = box.bottom = height / 2;
  draw();
});

window.addEventListener('keyup', e => pressedKeys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => pressedKeys.clear());
window.addEventListener('resize', () => { if (current) { fitCanvas(); draw(); } });

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
function escapeAttr(s) { return escapeHtml(s); }

load();
