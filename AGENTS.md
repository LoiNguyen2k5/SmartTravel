# Workspace Agent Guidance

## Core Development Philosophy

- **Superpowers Discipline**: Always follow the structured engineering lifecycle (Brainstorming → Writing Plans → TDD → Systematic Debugging → Verification before completion).
- **Ponytail Simplicity (YAGNI)**: Act as a lazy senior dev. The best code is the code never written. Solve the whole problem with the least new code, reuse existing libraries/patterns, avoid unrequested abstractions/wrappers.
- **Impeccable Frontend**: Follow `.agents/rules/frontend-craft.md` for UI/UX craft, typography, spacing, and micro-interactions.

## QA & Testing Resources (Codex Testing Kit)

- Use repository skills from `.agents/skills` when the request matches their `description` or when invoked with `$skill-name` or `/skill-name`.
- Read only the relevant rule files before implementing or reviewing automation code:
  - `.agents/rules/automation_rules.md` for shared automation and test-data conventions.
  - `.agents/rules/api_rules.md` for API automation and OWASP security rules.
  - `.agents/rules/locator_strategy.md` for locator selection.
  - `.agents/rules/playwright_rules.md` for Playwright work.
  - `.agents/rules/selenium_rules.md` for Selenium work.
  - `.agents/rules/appium_rules.md` for Appium work.
  - `.agents/rules/delivery_checklist.md` before completing automation work.
- Key QA workflows: `$generate-api-tests-from-swagger`, `$generate-manual-testcases-rbt`, `$generate-automation-framework`, `$generate-locator`, `$analyze-flaky-tests`, `$generate-test-data`.

## Working Expectations

- Communicate and report results in concise, clear Vietnamese.
- Preserve the current local code state. Do not run state-changing Git commands such as `git pull`, `git checkout`, `git merge`, `git rebase`, or `git reset` unless the user explicitly requests them. Read-only Git inspection is allowed.
- Prefer stable semantic locators and smart waits; do not introduce fixed sleeps unless the user explicitly requires them.
- Keep test data unique, traceable, deterministic when seeded, and free of real personal information.
- Validate generated code with the narrowest relevant test, lint, or compile command available in the target project.
- End replies with: what was skipped or not checked, and any risks the user must know (Ponytail rule).

