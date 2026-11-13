---
name: release-notes
description: Writes customer-facing release notes for Roomly from closed GitHub issues, merged pull requests or a git log. Use when asked for release notes, a changelog, a "what's new" summary or a sprint review summary for users.
---

# Release notes

## Steps

1. Gather the changes. Prefer the GitHub MCP server (closed issues and merged PRs since the last release). If it isn't available, use `git log --oneline` for the range the user gives.
2. Drop internal-only changes: refactors, CI, dependency bumps, test-only changes.
3. Group what's left under these headings, in this order, skipping empty ones: **New**, **Improved**, **Fixed**.
4. Write one line per change, from the user's point of view: what they can now do or what no longer goes wrong.
5. End with a one-sentence summary suitable for a Slack announcement.

## Style

- Plain, friendly, specific. "You can now cancel a booking from the list" not "Implemented DELETE endpoint".
- No issue numbers in the user-facing text; put them in a collapsed "For the team" list at the end.
- Never promise future work.
