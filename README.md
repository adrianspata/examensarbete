**Personalised Product Feed Engine (PPFE)**

This repository contains a small, end-to-end prototype of a personalised product feed engine for e-commerce.

The aim is to show, in a realistic but compact way, how an online retailer could:

expose a product catalogue via an API

collect user interaction events (views, clicks, add_to_cart)

generate simple but explainable product recommendations

inspect and debug the engine via an admin dashboard

The focus is on clarity and transparency. The recommendation logic is deliberately rule-based so it can be read, understood, and discussed.

The system is split into four parts that talk to each other over HTTP:

**1. Backend API (Node.js / Express / PostgreSQL)**

Exposes a REST API:

GET /products – product catalogue

POST /events – collect user interactions (view / click / add_to_cart)

GET /recommendations – recommended products for a given session

GET /admin/products, GET /admin/events, GET /admin/recommendations/preview – admin/debug endpoints

GET /health – simple health check used by the admin UI

Stores state in PostgreSQL:

products – demo fashion products (id, sku, name, category, price, image_url, …)

events – interaction log (session_id, product_id, event_type, created_at, …)

Recommendation logic lives in
backend/src/services/recommendationEngine.ts
and combines:

recent category interactions for a session

simple “trending” signals based on event counts
into a ranked product list, plus debug metadata.

**2. Admin panel (React)**

Standalone React app under admin/, talking to the backend over HTTP.

Main views:

Products – catalogue from /admin/products

Events – recent events joined with product info from /admin/events

Recommendations – preview UI using /admin/recommendations/preview, showing both recommended items and debug info (strategy, sessionId, currentProductId, categories used, limit)

Intended as a small “control room” for understanding and explaining engine behaviour, not a production CMS.

**3. Test storefront (React)**

Demo storefront under test-storefront/ that simulates a small fashion shop.

Behaviour:

loads products from GET /products

logs user interactions to POST /events

fetches recommendations from GET /recommendations

displays a “Recommended for you” section

Purpose: provide a clickable surface that generates real events, which can then be inspected via the admin dashboard.

**4. Frontend widget (vanilla TypeScript)**

Lives in frontend-widget/.

Compiles to a small IIFE bundle:

frontend-widget/dist/ppfe-widget.iife.js

frontend-widget/dist/style.css

Can be embedded in any HTML page via <script> and initialised with:

backendUrl

sessionId

limit

Shows how the engine can be consumed by an external storefront or CMS that only needs to include a JS file.

What this prototype demonstrates

A clean separation between:

data & storage (PostgreSQL)

event collection (POST /events)

recommendation logic (rule-based engine)

inspection tools (admin dashboard)

A realistic API surface that a storefront or widget can integrate with.

An explainable recommendation pipeline that can be discussed in terms of:

signals used (event types, categories, recency)

fallback strategies (trending when data is sparse)

limitations and future improvement paths.

This is intentionally not a production system: there is no authentication, multi-tenant setup or ML-based ranking. Those omissions are deliberate to keep the system small, readable, and suitable for a thesis project.

**Installation & running the project**

For step-by-step instructions on how to:

set up the environment

configure PostgreSQL

run migrations and seed demo data

start backend, admin, and test storefront

build and preview the widget

…see INSTALLATION.md in the repository root.
