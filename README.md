# Examensarbete – E-commerce Personalised Product Feed Engine

Detta projekt är ett examensarbete för utbildningen Fullstackutveckling med fokus på E-handel.

Projektet implementerar en regelbaserad rekommendationsmotor för mindre e-handelsbutiker.
Systemet samlar in användarinteraktioner (t.ex. produktvisningar) och returnerar personligt
anpassade produktrekommendationer via ett REST-API.

## Syfte

- Visa förståelse för backend-arkitektur (Node.js, Express, TypeScript).
- Visa förståelse för databaser (PostgreSQL) och datamodellering.
- Bygga en minimal frontend-integration (widget + test-storefront).
- Ge en enkel adminvy för inspektion av events och rekommendationer.
- Arbeta strukturerat med Git, tydlig commit-historik och dokumenterad arbetsprocess.

## Arkitektur

- **Backend** (backend/):  
  Node.js + Express + TypeScript.  
  Exponerar:
  - endpoint för insamling av events
  - endpoint för hämtning av rekommendationer
  - intern, regelbaserad rekommendationsmotor

- **Frontend-widget** (frontend-widget/):  
  Minimal JS/TS-komponent som kan bäddas in i en valfri e-handelsfrontend.
  Hämtar rekommendationer via API och renderar dem.

- **Admin** (admin/):  
  React + Vite.  
  Visar eventloggar och rekommendationsoutput för debugging.

- **Test-storefront** (test-storefront/):  
  React + Vite.  
  Simulerar en enkel e-handelsmiljö:
  - visar produkter
  - skickar events till backend
  - visar rekommenderade produkter.

## Teknikstack

- Node.js + Express + TypeScript
- PostgreSQL (eller annan liten SQL-databas lokalt)
- React + Vite (admin och test-storefront)
- pnpm workspaces (backend, admin, test-storefront, frontend-widget)

## Icke-mål (medvetet uteslutet)

- Ingen betalningslösning
- Ingen varukorg
- Ingen avancerad användarhantering
- Ingen ML-baserad rekommendationsmotor
- Ingen deploymentpipeline

## Kör projektet lokalt (översikt)

Detaljerad installation och kommandon dokumenteras i INSTALLATION.md, men i korthet:

1. Installera dependencies med pnpm install.
2. Sätt upp databas (PostgreSQL) och miljövariabler.
3. Kör migrering och seed-skript.
4. Starta backend, admin och test-storefront.
5. Öppna admin och test-storefront i webbläsaren, generera events och inspektera rekommendationerna.
