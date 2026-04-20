# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1.0] - 2026-04-20

### Added
- MVP dashboard: live energy mix donut chart, stacked area timeline, generation breakdown, import/export card, pumped storage card, cross-border neighbors card
- Real-time data from Transelectrica SEN API, polled every 30s
- Session history (120 snapshots) persisted via sessionStorage
- Netlify serverless CORS proxy (`netlify/functions/sen-filter.js`) with CDN edge caching
- Vite dev proxy for local development
- Zod schema validation for API response parsing
- TanStack Query v5 with non-retryable error handling for parse failures
- 7 Vitest unit tests for `parseResponse` covering happy path, invalid JSON, missing fields, edge cases
- `netlify.toml` redirect routing `/api/*` to the serverless function
