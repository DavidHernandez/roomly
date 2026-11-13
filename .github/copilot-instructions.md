Follow the project instructions in `AGENTS.md` at the repository root. It is the single source
of truth for conventions, commands and business rules in this repo.

Most important rules: TypeScript strict with no `any`, throw `HttpError` for server errors,
no `console.log` in server code, every bug fix ships with a Vitest test, never edit `.env`.
