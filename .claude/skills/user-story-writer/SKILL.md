---
name: user-story-writer
description: Rewrites a rough idea, vague issue or feature request into a well-formed Roomly user story with acceptance criteria. Use when someone asks to write, refine, improve or split a user story, ticket or issue, or to add acceptance criteria.
---

# User story writer

Turn rough input into a story the team can estimate and build.

## Steps

1. Read the input. If it is a GitHub issue, read the title, body and comments.
2. Identify who the user is, what they want and why. Roomly users are office employees booking meeting rooms.
3. Write the story using the template in [template.md](template.md). Follow it exactly.
4. Run the quality check below and fix anything that fails.
5. List what you assumed under "Open questions" instead of inventing facts. A short honest list beats a confident guess.

## Quality check (INVEST)

- **Independent:** can ship without another unfinished story. If not, say which.
- **Valuable:** the "so that" names a user benefit, not a technical task.
- **Small:** fits in one sprint. If not, propose a split into 2-3 stories.
- **Testable:** every acceptance criterion is a Given/When/Then a tester could check.

## Rules

- Plain language. No implementation details (no "add an endpoint") unless the input demands it.
- 3 to 6 acceptance criteria. Include at least one edge case or error case.
- If the input is too vague to write any honest story, say so and ask the 2-3 questions that would unblock it.
