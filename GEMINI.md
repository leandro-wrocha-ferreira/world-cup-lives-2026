# Gemini AI Agent Rules

## Tooling & Execution
1. **Framework Installation & Dependencies**: Always use the wrapper `debianjail [npm/npx command]` (e.g., `debianjail npm install`, `debianjail npx ...`).
2. **Docker**: Always use the command `docker compose [commands docker]` instead of `docker-compose`.
3. **Execution Permission**: Before installing dependencies or executing any command, **always request permission** from the user. Never auto-run terminal commands that install or execute scripts without explicit user consent.
