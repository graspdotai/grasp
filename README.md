# Grasp

**Learn anything through conversation.**

Voice-first AI learning platform — personalized curriculum, interactive lessons, slides, voice quizzes, and study notes.

## Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| API      | [grasp-api](https://github.com/graspdotai/grasp-api) (separate repo) |
| Database | Supabase (configured in API repo)         |

## Repo structure

```
grasp/
└── apps/
    └── web/          # Next.js frontend
```

The Express API lives in **[graspdotai/grasp-api](https://github.com/graspdotai/grasp-api)** for independent deployment.

## Prerequisites

- Node.js 20+
- npm 10+
- [grasp-api](https://github.com/graspdotai/grasp-api) running locally for full-stack dev (optional)

## Quick start

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000 (clone and run [grasp-api](https://github.com/graspdotai/grasp-api))

## Environment

Set `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` to your API URL (e.g. `http://localhost:4000` locally).

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

API: [graspdotai/grasp-api](https://github.com/graspdotai/grasp-api)
