# Grasp

**Learn anything through conversation.**

Voice-first AI learning platform — personalized curriculum, interactive lessons, slides, voice quizzes, and study notes.

## Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| API      | Express (Node.js)                         |
| Database | Supabase                                  |
| Voice    | AethexAI (configure when integrating)     |
| AI       | LLM provider of your choice (e.g. OpenAI) |

## Repo structure

```
grasp/
├── apps/
│   ├── web/          # Next.js frontend (create-next-app)
│   └── api/          # Express API (express-generator)
├── supabase/         # Supabase local config & migrations
├── .env.example      # Environment variable reference
└── package.json      # npm workspaces
```

## Prerequisites

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

## Quick start

```bash
# Install all workspace dependencies
npm install

# Copy env templates
cp .env.example apps/web/.env.local
# Add API keys to apps/web/.env.local and configure API env as needed

# Run frontend + API together
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000 — run with `PORT=4000 npm run dev:api` (Express defaults to 3000; use a different port so it does not clash with Next.js)

## Individual apps

```bash
npm run dev:web    # Next.js only
npm run dev:api    # Express only
```

### Supabase (optional)

```bash
npx supabase start    # local Postgres + Studio
npx supabase status   # URLs and keys
```

## GitHub

```bash
git remote add origin https://github.com/graspdotai/grasp.git
git push -u origin main
```

## Hackathon MVP phases

1. User enters a topic  
2. Curriculum is generated  
3. Voice tutor teaches  
4. Slides generated live  
5. Voice quiz  
6. Export study notes  

---

Built for [graspdotai/grasp](https://github.com/graspdotai/grasp).
