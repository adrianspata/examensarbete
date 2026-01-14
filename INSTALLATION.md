# INSTALLATION & SETUP

This document explains how to install and run the **Personalised Product Feed Engine (PPFE)** locally.

The project is a monorepo with:

- `backend/` – Node/Express + PostgreSQL API
- `admin/` – Admin dashboard (React + Vite)
- `test-storefront/` – Demo storefront (React + Vite)
- `frontend-widget/` – Embeddable recommendations widget

All commands below assume you are in the **project root**.

---

## 1. Quickstart 

If you just want everything running quickly:

1. Make sure you have:
   - Node.js ≥ 18  
   - pnpm  
   - PostgreSQL

2. Clone the repo and go to the project root:

    git clone https://github.com/adrianspata/examensarbete
    cd examensarbete

3. Create backend `.env`:

    cd backend
    cp .env.example .env
    cd ..

   Edit `backend/.env` and set something like:

   - `DATABASE_URL=postgres://<USER>[:PASSWORD]@localhost:5432/ppfe_dev`
   - `PORT=4000`
   - `NODE_ENV=development`

4. Create the database:

    createdb ppfe_dev

   (If `createdb` is not on `PATH`, use your full Postgres path.)

   If createdb or psql is not found, try:
   
   the full Homebrew path /opt/homebrew/opt/postgresql@16/bin/createdb ppfe_dev
   
5. Install dependencies (from project root):

    pnpm install

6. Run migrations and seed:

    pnpm run db:migrate
    pnpm run db:seed

7. Start backend + admin + storefront:

    pnpm run dev:all

8. Open in your browser:

   - Backend API: http://localhost:4000  
   - Admin dashboard: http://localhost:5173  
   - Test storefront: http://localhost:5174  

If those three URLs work, the system is correctly installed.

---

## 2. Details

You need:

- Node.js 18 or higher (`node -v` to check)
- pnpm (`npm install -g pnpm` or `corepack enable && corepack prepare pnpm@latest --activate`)
- PostgreSQL (e.g. `brew install postgresql@16` on macOS, or any other standard install)

Make sure Postgres is running.

---

## 3. Build for production and widget usage

### 3.1 Build the whole project

From the project root:

    pnpm run build

This builds:

- Backend TypeScript → JavaScript.
- Admin app (into `admin/dist`).
- Test storefront (into `test-storefront/dist`).
- Widget bundle (into `frontend-widget/dist`).

### 3.2 Widget bundle

The widget build produces:

- `frontend-widget/dist/ppfe-widget.iife.js`
- `frontend-widget/dist/style.css`

Basic embed example in an HTML page:

    <link rel="stylesheet" href="./dist/style.css" />

    <div id="ppfe-recommendations"></div>

    <script src="./dist/ppfe-widget.iife.js"></script>
    <script>
      window.PPFEWidget.init({
        containerId: "ppfe-recommendations",
        backendUrl: "http://localhost:4000",
        sessionId: "demo-session",
        limit: 4
      });
    </script>

There is also a small local demo file:

- `frontend-widget/demo.html`

To preview the widget demo:

Make sure the backend is running (for example with pnpm run dev:all, so http://localhost:4000 is available).

Build the widget (from the root or frontend-widget):

pnpm run build -w frontend-widget

Open frontend-widget/demo.html in a browser via a static file server, for example:

Right-click on demo.html → “Open with Live Server”

The URL will look something like:
http://127.0.0.1:5500/frontend-widget/demo.html

Or use any other simple static server (e.g. npx serve . from the project root and then browse to /frontend-widget/demo.html).

When the page loads, you should see a “Recommended for you” block rendered by the widget, powered by the same /recommendations endpoint as the test storefront.