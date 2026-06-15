# Deployment & Run Guide

**Augustine Sales Agent CRM** — Next.js 16 app, deployed on Netlify.

---

## Prerequisites

| Tool    | Version       |
| ------- | ------------- |
| Node.js | **22 or above** |
| npm     | Comes with Node |

---

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then fill in the values in .env

# 3. Start the dev server
npm run dev
```

App runs at **http://localhost:3000**.

### Useful Scripts

| Command          | What it does                       |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start local dev server             |
| `npm run build`  | Production build                   |
| `npm run start`  | Run the production build locally   |
| `npm run lint`   | Lint the code                      |
| `npm run test`   | Run tests                          |

---

## Deployment (Netlify)

Deployment is **fully automated via CI/CD** — no manual steps needed.

| Branch     | Result                          |
| ---------- | ------------------------------- |
| `master`   | Auto-deploys to **production**   |
| Other PRs  | Generates a **deploy preview**   |

**Flow:** Push / merge to `master` → Netlify builds (`npm run build`) → live.

### Build Config

Defined in [netlify.toml](../netlify.toml):

- **Build command:** `npm run build`
- **Node version:** `22`
- **Plugin:** `@netlify/plugin-nextjs` (SSR + static assets)
- Security headers applied to all routes.

### Environment Variables

Set all variables from [.env.example](../.env.example) in the
**Netlify dashboard** → *Site settings → Environment variables*.

> ⚠️ Never commit the `.env` file. Keep secrets in Netlify only.

---

## Quick Reference

```bash
# Local
npm install && npm run dev

# Deploy
git push origin master   # CI/CD handles the rest
```
