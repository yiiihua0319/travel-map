# Eva's Travel Map ✈️

黃伊華（Eva）的旅遊紀錄網站：互動世界地圖 + 旅程列表 + 各國遊記（行程、花費、心得、注意事項）。

🌍 **Live**: https://yiiihua0319.github.io/travel-map/

## 架構

- `index.html` — Leaflet 世界地圖首頁，依城市顯示圖釘
- `list.html` — 旅程列表（依日期 / 依國家排序）
- `country.html?c=XX` — 國家詳細頁（該國旅程、小地圖、照片、遊記）
- `data/trips.json` — 全部旅程索引（日期、國家、城市座標）
- `data/countries.json` — 國家中文名 + 遊記檔案對應 + 照片
- `data/medium/*.md`、`data/notion/*.md` — 遊記內容（Markdown，前端即時渲染）

## 更新內容

1. 新增旅程：編輯 `data/trips.json`
2. 新增遊記：把 Markdown 放進 `data/medium/` 或 `data/notion/`，在 `data/countries.json` 的該國 `content` 陣列加上路徑
3. push 到 main 即自動部署

資料來源：Notion Travel Journal、Medium (@yiiihua_0319)、Instagram 精選動態、Google Maps 已儲存地點。
