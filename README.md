# Examensarbete – E-commerce Personalised Product Feed Engine

Detta projekt är ett examensarbete inom fullstackutveckling med fokus på e-handel.

Projektet implementerar en enkel, regelbaserad rekommendationsmotor för mindre e-handelsbutiker.
Systemet samlar in användarinteraktioner (t.ex. produktvisningar) och returnerar personligt
anpassade produktrekommendationer via ett REST-API.

## Teknikstack
- Backend: Node.js, Express, TypeScript
- Databas: PostgreSQL
- Frontend (Admin & Test Storefront): React + Vite
- Pakethantering: pnpm (workspaces)

## Projektstruktur
- backend/ – API, databas, rekommendationslogik
- admin/ – Enkel adminvy för loggar och debugging
- test-storefront/ – Simulerad e-handelsmiljö
- frontend-widget/ – Inbäddningsbar rekommendationskomponent

## Syfte
Syftet med projektet är att visa förståelse för:
- backend-arkitektur och REST-API:er
- databaser och datamodellering
- frontend-integration mot API
- versionshantering och dokumenterad arbetsprocess
