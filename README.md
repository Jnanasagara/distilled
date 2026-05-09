# Distilled

A content curation platform that pulls articles and posts from across the web and serves you a clean, personalized feed based on topics you actually care about.

Live at [distilled.blog](https://www.distilled.blog)

---

## What it does

You pick your topics, set how often you want updates (daily, weekly, or monthly), and Distilled fetches fresh content from Reddit, Hacker News, dev.to, and RSS feeds. The feed improves the more you interact with it — likes, saves, and clicks all shape what you see. No ads, no rage bait.

---

## Features

### Feed & Discovery
- Personalized feed across 15+ topic categories (Technology, AI, Web Dev, Finance, Science, Design, Startups, Cybersecurity, Health, Climate, Crypto, Space, Politics, Gaming, Culture, Memes)
- Content from Reddit, Hacker News, dev.to, and RSS feeds (custom RSS URLs supported)
- Toggle trending content on/off
- Block specific sources (Reddit, HN, dev.to, RSS) per account
- AI-generated 2–3 sentence summaries and "why it matters" blurbs for each article (powered by Groq / Llama 3.1)
- Feed explanations — each article tells you why it was recommended

### Interactions & Personalization
- Like, save, dismiss, and click-through tracking
- Engagement signals feed back into the algorithm (saves and likes boost topic weights, dismissals reduce them)
- Source affinity: articles from sources you engage with get a boost
- Topic hot scores: recently engaged topics surface more content
- Weight decay: disengaged topics gradually fade out of your feed

### Collections
- Create named, color-coded collections to organize saved articles
- Save an article to multiple collections
- Export saved articles as JSON

### History & Usage
- Full reading history with timestamps
- Daily usage tracking (time spent per day)

### Digests
- Email digests on your schedule: daily, weekly, or monthly
- HTML-formatted emails with ranked articles, source attribution, and unsubscribe links
- Configurable post count per digest

### Push Notifications
- Web Push (VAPID) notifications when your digest is ready
- Manage subscriptions from preferences

### Authentication
- Google Sign-In (OAuth)
- Email + password with bcrypt hashing
- Email verification on signup
- Password reset via email
- Remember Me (365-day session) or short-lived session
- Role-based access: USER / ADMIN

### Admin Panel
- Analytics dashboard
- User management: ban, delete, export
- Content moderation: hide articles
- Report review and resolution
- Broadcast announcements to all users

### Other
- Light and dark mode
- Onboarding flow for topic selection
- Account deletion (full cascade)
- Report system for flagging bad content

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Cache & Queues | Redis + BullMQ |
| Auth | NextAuth (JWT sessions) |
| Email | Resend |
| AI Summaries | Groq API (Llama 3.1 8B Instant) |
| Notifications | Web Push API (VAPID) |

---

## Background Jobs

A standalone BullMQ worker process (`npm run worker`) runs separately from the web server and handles:

| Job | Schedule |
|---|---|
| Fresh content ingestion | Every 6 hours |
| Trending content ingestion | Every 24 hours |
| Archive content ingestion | Every 3 days |
| Daily digest emails | Every 24 hours |
| Weekly digest emails | Every 7 days |
| Monthly digest emails | Every 30 days |

---

## Local Development

Requires Docker for Postgres and Redis:

```bash
cd docker
docker compose up -d
```

Then in the app directory:

```bash
npm install
npx prisma migrate dev
npm run dev        # web server
npm run worker     # background job worker (separate terminal)
```

---

## Deployment

Deployed on [Railway](https://railway.app) with four separate services: Next.js app, BullMQ worker, PostgreSQL, and Redis.

---

## Open for suggestions

If you have ideas for features, improvements, or anything that would make Distilled better, feel free to open an issue or reach out.
