---
name: ticket
description: Create layout for new ticket
---

# Ticket creation

## Core Principles

1. Must create ticket in `./docs/<version>/<ticket>.md`
2. Version based on `package.json` in root
3. Must only create the ticket, don't handle/implement it.
4. Based on the title, only add `Currently` (this important rule)
5. After creating, open with the `code` command

## Ticket layout

1. **Title** — A concise summary (one line, in imperative form)
2. **Currently** — Context, reasoning, goals, mockups/reference materials.
3. **Acceptance Criteria** — List of completion conditions (checklist or Given-When-Then)
4. **Solutions** — Technical evaluation, risks, implementation approach and technical/architectural design (or UI/UX if applicable)

## Example

File: `./docs/v1.0.0/improve-choice.md`

```markdown
# Title

## Currently

## Acceptance Criteria

- [ ]
- [ ]
- [ ]

## Solutions

- [ ]
- [ ]
- [ ]
```
