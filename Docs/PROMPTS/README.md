# Implementation Prompts

This folder contains ready-to-use prompts for implementing each phase of the VBS App production roadmap.

## How to Use

1. Open the prompt file for the phase you want to implement
2. Copy everything below the "---" line
3. Paste into a new AI conversation
4. The AI will follow the structured plan

## Available Prompts

| File | Phase | Status |
|------|-------|--------|
| `PHASE_1_AUTH.md` | Authentication (Google, Microsoft, Credentials, Invitations) | ✅ Ready |
| `PHASE_2_STUDENTS.md` | Student Management (CRUD, CSV Import) | ⬜ Not Created |
| `PHASE_3_INFRA.md` | Production Infrastructure (Redis, Logging) | ⬜ Not Created |
| `PHASE_4_DEVOPS.md` | CI/CD & Update Scripts | ⬜ Not Created |

## Prompt Structure

Each prompt includes:
- **Required Reading** - Files to read before starting
- **Scope** - Exact tasks to implement
- **Acceptance Criteria** - Checkboxes to verify completion
- **DO NOT** - Boundaries to prevent scope creep
- **Code Patterns** - References to implementation guide
- **Completion** - What to report when done

## Creating New Prompts

When creating prompts for future phases, follow this template:

```markdown
# Phase X: [Name] - Implementation Prompt

> **Copy everything below this line and paste as a new conversation**

---

## Task: Implement Phase X - [Name] for VBS App

[Context and overview]

### 📚 Required Reading First
[List of files to read]

### 🎯 Scope - ONLY These Tasks
[Detailed task list with files and acceptance criteria]

### 🚫 DO NOT
[Boundaries]

### ✅ Implementation Rules
[Patterns to follow]

### 🏁 Completion
[What to report when done]

---

## Start Now
[First action to take]
```

