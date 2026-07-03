/* 共用工具：載入資料、國旗、日期格式、Markdown 渲染 */

const DATA_BASE = '';

function flagEmoji(code) {
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1A5 + c.charCodeAt(0))).join('');
}

async function loadJSON(path) {
  const r = await fetch(DATA_BASE + path);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  return r.json();
}

async function loadText(path) {
  const r = await fetch(DATA_BASE + path);
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
