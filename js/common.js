/* 共用工具：載入資料、國旗、日期格式、Markdown 渲染 */

const DATA_BASE = '';
// 每次改資料就 bump 這個版本號，讓瀏覽器/CDN 一定抓到最新的 JSON/MD（避免部署後看到舊快取）
const SITE_VER = '20260705g';

function flagEmoji(code) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('');
}

async function loadJSON(path) {
  const r = await fetch(DATA_BASE + path + '?v=' + SITE_VER);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return r.json();
}

async function loadText(path) {
  const r = await fetch(DATA_BASE + path + '?v=' + SITE_VER);
  if (!r.ok) return null;
  return r.text();
}

function fmtRange(t) {
  const s = t.dateStart.replaceAll('-', '/');
  const e = t.dateEnd.replaceAll('-', '/');
  if (s === e) return s;
  return s + ' – ' + e.slice(5);
}

/* 極簡 Markdown 渲染（標題/粗體/清單/連結/引用） */
function renderMD(md) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = s => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[^"(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');

  const lines = md.split('\n');
  let html = '', inList = false;
  const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { closeList(); continue; }
    if (/^(source|date|published|notion|trip|note):/i.test(line.trim())) {
      closeList();
      html += '<p class="meta-line">' + inline(line.trim()) + '</p>';
    } else if (line.startsWith('### ')) { closeList(); html += '<h3>' + inline(line.slice(4)) + '</h3>'; }
    else if (line.startsWith('## ')) { closeList(); html += '<h2>' + inline(line.slice(3)) + '</h2>'; }
    else if (line.startsWith('# ')) { closeList(); html += '<h1>' + inline(line.slice(2)) + '</h1>'; }
    else if (line.startsWith('> ')) { closeList(); html += '<blockquote>' + inline(line.slice(2)) + '</blockquote>'; }
    else if (/^[-*] /.test(line.trim())) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline(line.trim().slice(2)) + '</li>';
    } else { closeList(); html += '<p>' + inline(line) + '</p>'; }
  }
  closeList();
  return html;
}

/* 旅程 Markdown → Day 卡片 + 其餘內容 */
function renderTripMD(md) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = s => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const lines = md.split('\n');
  let html = '', cards = [], card = null, dayN = 0, inExpense = false;

  const flushCards = () => {
    if (!cards.length) return;
    html += '<div class="day-grid">' + cards.map(c =>
      `<div class="day-card"><div class="day-badge">Day ${c.n}</div>
       <div class="day-date">${c.label}</div>
       <div class="day-body">${c.body.join('')}</div></div>`).join('') + '</div>';
    cards = []; card = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# ') || /^(notion|trip|source|date|published|note):/i.test(line)) continue;
    if (line.startsWith('## ')) {
      flushCards();
      const h = line.slice(3).trim();
      inExpense = /花費/.test(h);
      if (h !== '行程') html += '<h2>' + inline(h) + '</h2>';
      continue;
    }
    const dm = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
    if (dm && !inExpense) {
      dayN++;
      card = { n: dayN, label: inline(dm[1]), body: dm[2] ? ['<p>' + inline(dm[2]) + '</p>'] : [] };
      cards.push(card);
      continue;
    }
    const bm = line.match(/^\*\*(.+)\*\*$/);
    if (bm) { flushCards(); html += '<h3 class="seg-head">' + inline(bm[1]) + '</h3>'; continue; }
    if (line.startsWith('- ')) {
      const li = '<p class="day-sub">· ' + inline(line.slice(2)) + '</p>';
      if (card) card.body.push(li); else html += li.replace('day-sub', 'md-p');
      continue;
    }
    const p = '<p>' + inline(line) + '</p>';
    if (card && !inExpense) card.body.push(p); else html += p;
  }
  flushCards();
  return html;
}

/* SVG 圓餅圖（記帳） */
const PIE_COLORS = ['#4a6c8c', '#8fb0c9', '#c9a86a', '#7ca982', '#b98b82', '#9b8fb8', '#d3c0a3', '#88a0a8'];
function pieChartHTML(expenses) {
  const entries = Object.entries(expenses.items).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (!total) return '';
  const cx = 80, cy = 80, r = 62;
  let angle = -Math.PI / 2, paths = '';
  entries.forEach(([name, v], i) => {
    const a2 = angle + (v / total) * Math.PI * 2;
    const large = (a2 - angle) > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    if (entries.length === 1) {
      paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${PIE_COLORS[0]}"/>`;
    } else {
      paths += `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${PIE_COLORS[i % PIE_COLORS.length]}" stroke="#fff" stroke-width="1.5"/>`;
    }
    angle = a2;
  });
  const legend = entries.map(([name, v], i) =>
    `<div class="legend-row"><span class="legend-dot" style="background:${PIE_COLORS[i % PIE_COLORS.length]}"></span>
     ${name}<span class="legend-val">${v.toLocaleString()}（${Math.round(v / total * 100)}%）</span></div>`).join('');
  return `<div class="pie-wrap">
    <svg viewBox="0 0 160 160" width="160" height="160">${paths}
      <circle cx="${cx}" cy="${cy}" r="30" fill="#fff"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="10" fill="#6a737d">總計</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2328">${(total >= 10000 ? (total / 1000).toFixed(0) + 'K' : total.toLocaleString())}</text>
    </svg>
    <div class="pie-legend">
      <div class="legend-title">💰 花費紀錄（${expenses.currency === 'TWD' ? '台幣' : expenses.currency}）</div>
      ${legend}
      ${expenses.note ? `<div class="legend-note">${expenses.note}</div>` : ''}
    </div>
  </div>`;
}

function headerHTML(active) {
  return `
  <header class="site-header">
    <a class="logo" href="index.html">EVA'S TRAVEL MAP ✈️</a>
    <nav>
      <a href="index.html" class="${active === 'map' ? 'active' : ''}">地圖</a>
      <a href="list.html" class="${active === 'list' ? 'active' : ''}">旅程列表</a>
    </nav>
  </header>`;
}
