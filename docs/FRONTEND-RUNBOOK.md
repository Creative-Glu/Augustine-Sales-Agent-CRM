# Frontend Runbook

A simple, plain-English guide for running and looking after the
**Augustine CRM** website (frontend).

> Think of this as the "what do I do?" cheat sheet. No deep tech knowledge needed.

---

## 1. What This Is

The frontend is the **website people see and click on**. It runs on:

- **Next.js** — the framework the site is built with
- **Netlify** — the service that puts the site online

You write code → push it → Netlify automatically makes it live.

---

## 2. What You Need First (One-Time Setup)

1. Install **Node.js version 22 or higher** → https://nodejs.org
2. Get the project code (clone the repo).
3. Get the secret keys file (`.env`) from a team member.

---

## 3. Run the Site on Your Computer

Open a terminal in the project folder and run these one at a time:

```bash
npm install      # downloads everything the site needs (do this once)
npm run dev       # starts the site
```

Then open your browser to: **http://localhost:3000**

To stop it: press `Ctrl + C` in the terminal.

---

## 4. Putting Changes Live (Deploy)

You don't push anything manually. It happens **automatically**:

1. Save your changes and push them to the `master` branch.
2. Netlify notices and builds the new version.
3. A few minutes later, the live site updates by itself.

> Working on a new feature? Open a Pull Request instead — Netlify gives you a
> **preview link** to check it before it goes live.

---

## 5. Common Problems & Quick Fixes

| Problem                              | Try This                                              |
| ------------------------------------ | ----------------------------------------------------- |
| Site won't start                     | Run `npm install` again, then `npm run dev`           |
| "Command not found: npm"             | Node.js isn't installed → install it (Step 2)         |
| Blank page / login broken            | Check the `.env` file — a key may be missing or wrong |
| Changes not showing on live site     | Wait 2–5 min; check the Netlify dashboard for errors  |
| Port 3000 already in use             | Close the other running app, or restart your computer |
| Build fails on Netlify               | Open Netlify → **Deploys** → read the error log       |

---

## 6. Where to Look When Something Breaks

- **Live site issues** → Netlify dashboard → **Deploys** tab (shows build logs)
- **Your computer issues** → the terminal where you ran `npm run dev`
- **Settings / secret keys** → the `.env` file (local) or Netlify
  → *Site settings → Environment variables* (live)

---

## 7. Golden Rules

- ✅ Always run `npm install` after pulling new code.
- ✅ Test on `http://localhost:3000` before pushing.
- ❌ Never share or commit the `.env` file — it holds secret keys.
- ❌ Don't push broken code to `master` — it goes live automatically.

---

## 8. Need Help?

If you're stuck, grab the build log (from Netlify or your terminal) and share it
with the dev team — that's the fastest way to get a fix.
