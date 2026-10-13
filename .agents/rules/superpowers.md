# Superpowers Methodology Rules

When working on software engineering tasks (building features, fixing bugs, refactoring, or reviewing code), follow the Superpowers disciplined development process:

## 1. Skill Invocation & Process Order
- **Creative / New Feature Work**: Invoke the `brainstorming` skill first to clarify intent, constraints, and requirements before proposing designs or writing code.
- **Architectural Planning**: Invoke `writing-plans` to produce structured, bite-sized implementation plans.
- **Execution**: Invoke `executing-plans` or `subagent-driven-development` when working through task lists.
- **Implementation & TDD**: Adhere to `test-driven-development` (write failing test first, verify failure, write minimal code to pass).
- **Bug Fixes**: Invoke `systematic-debugging` (trace root cause before changing code; no guess-and-check fixes).
- **Quality Gates**: Invoke `verification-before-completion` before declaring any task finished.

## 2. Synergies with Ponytail and Impeccable
- **Ponytail Simplicity**: Within the TDD and implementation steps, apply Ponytail principles: write the minimal necessary code, prefer standard library/existing components, avoid unrequested abstractions.
- **Impeccable Frontend**: For any UI/UX or frontend code, apply Impeccable standards to avoid generic AI slop.
