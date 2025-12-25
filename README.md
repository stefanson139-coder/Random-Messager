# Message Pool

Features:
1) Anyone can submit a message → stored in Postgres
2) Anyone can draw a random message
3) If your submitted message gets drawn by someone else, your browser will show a top-right toast that disappears after 5 seconds (polled every 2 seconds).

## Local dev
1. Install
   - npm i

2. Set DB env
   - Put a Postgres connection string into `.env.local` as `POSTGRES_URL=...`
   - If using Vercel + Neon, you can use: `vercel env pull .env.local`

3. Run
   - npm run dev
   - Open http://localhost:3000

## APIs
- POST /api/messages
  - body: { "content": "..." }

- GET /api/random
  - returns { message: { id, content, createdAt } }

- GET /api/notifications
  - returns unread notifications for your browser session and marks them as read
