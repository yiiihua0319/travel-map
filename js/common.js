/* 共用工具：載入資料、國旗、日期格式、Markdown 渲染、中英切換 */

const DATA_BASE = '';
// 每次改資料就 bump 這個版本號，讓瀏覽器/CDN 一定抓到最新的 JSON/MD（避免部署後看到舊快取）
const SITE_VER = '20260720a';

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

/* ── 中英切換 ───────────────────────────────────────────────
   語言存在 localStorage；切換時整頁重載，各頁渲染時直接讀當下語言。
   UI 字串寫在下面的 UI 表；資料型翻譯（國家/城市/旅程名/花費分類）放 data/i18n.json。 */
const LANG = localStorage.getItem('tm_lang') === 'en' ? 'en' : 'zh';
const isEN = () => LANG === 'en';
function toggleLang() {
  localStorage.setItem('tm_lang', isEN() ? 'zh' : 'en');
  location.reload();
}

const UI = {
  navMap:        ['地圖', 'Map'],
  navList:       ['旅程列表', 'Trips'],
  navStats:      ['統計 🔓', 'Stats 🔓'],
  langBtn:       ['EN', '中文'],
  loading:       ['載入中…', 'Loading…'],
  backToList:    ['← 回旅程列表', '← Back to trips'],
  pieTotal:      ['總計', 'Total'],
  pieTitle:      ['💰 花費紀錄', '💰 Expenses'],
  twd:           ['台幣', 'TWD'],
  cnOnly:        ['', '📝 Itineraries and travel stories are written in Chinese only.'],

  // 首頁
  mapTitle:      ["Eva's Travel Map ✈️", "Eva's Travel Map ✈️"],
  mapDesc:       ['Eva 的旅遊地圖：38 國 50 趟旅程的行程、花費、口袋名單與遊記',
                  "Eva's travel map: itineraries, expenses, saved places and stories from 50 trips across 38 countries"],
  wcTitle:       ['歡迎來到', 'Welcome to'],
  wcLead:        ['這裡收藏了我 <b>38 個國家、50 趟旅程</b>的回憶——行程、花費、口袋名單、遊記，全部整理在這張地圖上。',
                  'This is where I keep the memories of <b>50 trips across 38 countries</b> — itineraries, expenses, saved places and stories, all pinned to one map.'],
  wcTip1:        ['<b>點國旗圖釘</b><span>看那一趟的完整紀錄</span>', '<b>Tap a flag pin</b><span>for the full record of that trip</span>'],
  wcTip2:        ['<b>口袋名單</b><span>我存過的美食、景點、購物清單</span>', '<b>Saved places</b><span>the food, sights and shops I bookmarked</span>'],
  wcTip3:        ['<b>遊記</b><span>各國的故事慢慢讀</span>', '<b>Stories</b><span>take your time with the write-ups</span>'],
  wcAsk:         ['有建議或想看的內容嗎？來 IG 跟我說 💬', 'Any suggestions or things you want to see? Tell me on Instagram 💬'],
  wcGo:          ['開始探索 🧭', 'Start exploring 🧭'],
  wcClose:       ['關閉', 'Close'],
  aboutChip:     ['📖 關於這裡', '📖 About'],
  statCountries: ['🌍 國家', '🌍 Countries'],
  statTrips:     ['✈️ 旅程', '✈️ Trips'],
  statDays:      ['📅 天', '📅 Days'],
  replayFoot:    ['▶ 足跡回放', '▶ Replay footsteps'],
  replayFly:     ['🛫 飛行回放', '🛫 Flight replay'],
  replayStop:    ['⏹ 停止回放', '⏹ Stop replay'],
  mapHint:       ['👆 點圖釘看旅程，點國家進遊記', '👆 Tap a pin for trips, tap a country for the story'],
  flyLink:       ['🧭 行程軌跡', '🧭 Route'],

  // 列表頁
  listTitle:     ['旅程列表', 'All trips'],
  searchPh:      ['🔍 搜尋國家、城市、旅程或年份…', '🔍 Search country, city, trip or year…'],
  sortDate:      ['依日期', 'By date'],
  sortCountry:   ['依國家', 'By country'],
  noResult:      ['找不到符合的旅程 🧐 換個關鍵字試試？', 'No trips matched 🧐 Try another keyword?'],
  tipsHead:      ['🧳 旅行小知識', '🧳 Travel tips'],
  tipEsn:        ['💳 ESN Card 辦卡教學', '💳 How to get an ESN Card'],
  tipEurail:     ['🚄 Eurail Pass 歐洲火車通票', '🚄 Eurail Pass explained'],
  tipsSub:       ['省錢技巧與實用心得', 'Money-saving tricks and things I learned'],
  tipLoadFail:   ['文章載入失敗 🥲', "Couldn't load this article 🥲"],

  // 國家頁
  noCountry:     ['找不到這個國家 🥲', 'No such country 🥲'],
  igHighlights:  ['📸 IG 限時動態精選：', '📸 IG Story Highlights:'],
  partItinerary: ['🗓️ 行程', '🗓️ Itinerary'],
  partExpense:   ['💰 費用', '💰 Expenses'],
  partStory:     ['✍️ 心得', '✍️ Notes'],
  tripEmpty:     ['這趟的紀錄整理中 ✈️', "Still writing up this trip ✈️"],
  posterBtn:     ['🖼️ 海報', '🖼️ Poster'],
  posterTip:     ['產生這趟的分享海報', 'Generate a shareable poster for this trip'],
  posterDl:      ['⬇️ 下載海報', '⬇️ Download'],
  secPlaces:     ['🗺️ 造訪地點', '🗺️ Places visited'],
  secPhotos:     ['📷 照片', '📷 Photos'],
  secPocket:     ['📍 我的口袋名單', '📍 My saved places'],
  secStories:    ['✍️ 其他遊記', '✍️ More stories'],
  catAll:        ['全部', 'All'],
  catFood:       ['美食', 'Food'],
  catSight:      ['景點', 'Sights'],
  catShop:       ['購物', 'Shopping'],
  catStay:       ['住宿', 'Stay'],
  catOther:      ['其他', 'Other'],
  checkTip:      ['去過了打勾', 'Mark as visited'],

  // 私人基地
  privTitle:     ['私人基地｜Eva\'s Travel Map', "Private Base｜Eva's Travel Map"],
  baseWelcome:   ['歡迎回來，', 'Welcome back, '],
  baseName:      ['Eva 的私人基地', "Eva's private base"],
  baseOnlyYou:   ['這裡只有你看得到 🤫', 'Only you can see this 🤫'],
  greetNight:    ['夜貓子還不睡 🌙', 'Still up, night owl 🌙'],
  greetMorning:  ['早安 ☀️', 'Good morning ☀️'],
  greetNoon:     ['午安 🌤️', 'Good afternoon 🌤️'],
  greetEvening:  ['晚安 🌙', 'Good evening 🌙'],
  menuCheckin:   ['打卡進度', 'Check-in progress'],
  menuCheckinS:  ['吃過踩過的口袋名單', 'Saved places you have been to'],
  menuStats:     ['旅遊統計', 'Travel stats'],
  menuStatsS:    ['花費・天數・時間軸', 'Spending · days · timeline'],
  menuMap:       ['回地圖', 'Back to map'],
  menuMapS:      ['公開版首頁', 'The public home page'],
  ckTitle:       ['✅ 打卡進度', '✅ Check-in progress'],
  ckEmpty:       ['還沒開始打卡～去任何國家頁的「📍 我的口袋名單」，點地點前面的 ⬜ 就能記錄吃過踩過的地方！',
                  'No check-ins yet — open any country page, find "📍 My saved places" and tap the ⬜ next to a place to mark it visited.'],
  privOn:        ['🔓 私人模式已在此瀏覽器啟用（每台裝置各開一次這頁）',
                  '🔓 Private mode is enabled in this browser (open this page once on each device)'],
  privOff:       ['關閉私人模式', 'Turn off private mode'],
  privOffMsg:    ['已關閉私人模式（打卡紀錄仍保留，再開這頁即可恢復）',
                  'Private mode is off. Your check-ins are kept — reopen this page to restore it.'],
  statsTitle:    ['📊 旅遊統計', '📊 Travel stats'],
  statsSub:      ['數字裡的旅行足跡', 'The journey in numbers'],
  statCountriesL:['🌍 個國家', '🌍 countries'],
  statTripsL:    ['✈️ 趟旅程', '✈️ trips'],
  statDaysL:     ['📅 天在路上', '📅 days on the road'],
  statSpendL:    ['💰 記錄到的花費', '💰 recorded spending'],
  hiloTitle:     ['🏆 最貴 vs 最省', '🏆 Priciest vs cheapest'],
  hiloHigh:      ['💸 最貴的一趟', '💸 Priciest trip'],
  hiloLow:       ['🪙 最省的一趟', '🪙 Cheapest trip'],
  topTitle:      ['💰 花費排行 Top 10', '💰 Top 10 by spending'],
  yearTitle:     ['📅 每年旅行天數', '📅 Days travelled per year'],
  whereTitle:    ['🧾 錢都花去哪', '🧾 Where the money went'],
  unlockTitle:   ['🗓️ 解鎖國家時間軸', '🗓️ Countries unlocked over time'],
};
function T(key) { const v = UI[key]; return v ? v[isEN() ? 1 : 0] : key; }

/* 資料型翻譯：國家 / 城市 / 旅程名 / 花費分類與備註（中文模式直接回原值） */
let DIC = { countries: {}, cities: {}, trips: {}, expenseCats: {}, expenseNotes: {} };
const I18N_READY = isEN()
  ? loadJSON('data/i18n.json').then(d => { DIC = d; }).catch(() => {})
  : Promise.resolve();

const cName = (cc, countries) => isEN() ? (DIC.countries[cc] || countries?.[cc]?.name || cc)
                                        : (countries?.[cc]?.name || cc);
const cityName = n => isEN() ? (DIC.cities[n] || n) : n;
const tripTitle = tr => isEN() ? (DIC.trips[tr.id] || tr.title) : tr.title;
const catName = k => isEN() ? (DIC.expenseCats[k] || k) : k;
const noteText = n => isEN() ? (DIC.expenseNotes[n] || n) : n;
const nDays = n => isEN() ? `${n} days` : `${n} 天`;
const nTrips = n => isEN() ? `${n} ${n === 1 ? 'trip' : 'trips'}` : `${n} 趟旅程`;
const nPlaces = n => isEN() ? `${n} ${n === 1 ? 'place' : 'places'}` : `${n} 個地點`;

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
     ${catName(name)}<span class="legend-val">${v.toLocaleString()}${isEN() ? ` (${Math.round(v / total * 100)}%)` : `（${Math.round(v / total * 100)}%）`}</span></div>`).join('');
  return `<div class="pie-wrap">
    <svg viewBox="0 0 160 160" width="160" height="160">${paths}
      <circle cx="${cx}" cy="${cy}" r="30" fill="#fff"/>
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="10" fill="#6a737d">${T('pieTotal')}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="12" font-weight="600" fill="#1f2328">${(total >= 10000 ? (total / 1000).toFixed(0) + 'K' : total.toLocaleString())}</text>
    </svg>
    <div class="pie-legend">
      <div class="legend-title">${T('pieTitle')}${isEN()
        ? ` (${expenses.currency === 'TWD' ? T('twd') : expenses.currency})`
        : `（${expenses.currency === 'TWD' ? T('twd') : expenses.currency}）`}</div>
      ${legend}
      ${expenses.note ? `<div class="legend-note">${noteText(expenses.note)}</div>` : ''}
    </div>
  </div>`;
}

/* ── 私人模式：造訪私密統計頁後在該瀏覽器啟用，解鎖統計連結與口袋名單打卡 ── */
const PRIV_PAGE = 'stats-5c5ad412de.html';
function isPriv() { return localStorage.getItem('tm_priv') === '1'; }
function getVisited() { try { return new Set(JSON.parse(localStorage.getItem('tm_visited') || '[]')); } catch { return new Set(); } }
function saveVisited(set) { localStorage.setItem('tm_visited', JSON.stringify([...set])); }

function headerHTML(active) {
  document.documentElement.lang = isEN() ? 'en' : 'zh-Hant';
  return `
  <header class="site-header">
    <a class="logo" href="index.html">EVA'S TRAVEL MAP ✈️</a>
    <nav>
      <a href="index.html" class="${active === 'map' ? 'active' : ''}">${T('navMap')}</a>
      <a href="list.html" class="${active === 'list' ? 'active' : ''}">${T('navList')}</a>
      ${isPriv() ? `<a href="${PRIV_PAGE}" class="${active === 'stats' ? 'active' : ''}">${T('navStats')}</a>` : ''}
      <button class="lang-btn" onclick="toggleLang()" title="${isEN() ? 'Switch to Chinese' : '切換英文介面'}">🌐 ${T('langBtn')}</button>
    </nav>
  </header>`;
}
