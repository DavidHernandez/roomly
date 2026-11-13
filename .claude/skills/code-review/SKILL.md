---
name: code-review
description: Reviews Roomly code changes or files against the team conventions in AGENTS.md and common bug patterns. Use when asked to review code, a diff, a pull request or a file, or to check code before committing.
---

# Code review

## Steps

1. Read `AGENTS.md` for the current conventions and business rules.
2. Read the code under review. For a PR, read the diff and the files around it.
3. Check every item in the checklist below.
4. Report findings using the output format. Don't rewrite the code unless asked.

## Checklist

- **Correctness:** does the logic match the business rules in AGENTS.md? Pay special attention to boundary conditions (`<` vs `<=`), time range overlaps and off-by-one errors.
- **Conventions:** no `any`, camelCase, `===`, `HttpError` for errors, `logger` instead of `console.log`, business rules in services.
- **UI state:** when the UI shows a filtered or sorted list, are actions using ids rather than positions?
- **Tests:** is there a test for each behaviour change? Do the tests cover the edge cases, or only the happy path?
- **Copy:** are user-facing messages specific and actionable?

## Output format

Group findings by severity, most severe first:

- 🔴 **Must fix**: bugs, broken business rules, security.
- 🟡 **Should fix**: convention violations, missing tests.
- 🟢 **Nice to have**: readability.

For each finding: file and line, what's wrong, why it matters, suggested fix in one or two lines.
End with a one-line verdict: approve, approve with changes, or request changes.
