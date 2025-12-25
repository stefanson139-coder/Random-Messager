# 訊息池（Message Pool）

功能：
1) 任何人提交訊息 → 存入訊息池（Postgres）
2) 從訊息池隨機抽取一則顯示

## 本機啟動（最簡單做法：用 Vercel Postgres）
1. 安裝依賴
   - npm i

2. 取得資料庫環境變數
   - 安裝 Vercel CLI：npm i -g vercel
   - 在專案根目錄登入：vercel login
   - 連結專案：vercel link
   - 拉環境變數：vercel env pull .env

3. 開發啟動
   - npm run dev
   - 開啟 http://localhost:3000

> 注意：你必須先在 Vercel Dashboard 內把 Storage → Postgres 建好並連上專案，才會有 POSTGRES_URL。

## API
- POST /api/messages
  - body: { "content": "..." }

- GET /api/random
  - 回傳 { message: { id, content, createdAt } }

## 部署（Vercel）
1. Push 到 GitHub
2. Vercel Import Repo
3. Vercel Dashboard → Storage → 建立/連接 Postgres
4. 重新 Deploy（若你先 deploy 後才加 DB，一般要再觸發一次部署/或重新部署一次）

