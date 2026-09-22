# Quiz Master - Setup & Admin Guide

## 🚀 How to Start the Server

Follow these simple steps to start the application server and view live previews:

### Option 1: Using Bun (Recommended)
Open your terminal inside this folder and run:
```bash
bun run dev
```

### Option 2: Using Node / NPM
If you prefer standard `npm`:
```bash
npm run dev
```

---

## 🔑 Admin Login Credentials

You can use the following default credentials to log into the Admin Dashboard:

* **Email / ID:** `admin@oxford.edu.np` (or any valid email format e.g., `admin@quiz.com`)
* **Password:** `admin123` (or any password with at least **6 characters**)

> **Note on Authentication:**
> The app is built with dynamic dev-fallback support. If Firebase backend authentication is unconfigured or unavailable, any email with a password of 6+ characters will grant access to the Admin Dashboard!

---

## ⚡ Quick Feature Navigation
- **Homepage:** Features direct public display link and branding for *ICT Club, Oxford Secondary School*.
- **Admin Dashboard Layout:**
  - Sidebar options on the left: **Registration**, **Rounds**, **Rules**, **Settings**, **Leaderboard**.
  - **Registration Tab:** Enter 4 teams for the game. Includes a **Reset Game Data** button to clear teams and reset scores.
  - **General Round:** Displays 50 question numbers grid, countdown timer, Realtime Leaderboard Modal, Rules Modal, and Fullscreen toggle.
