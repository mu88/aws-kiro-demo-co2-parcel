---
inclusion: always
---
Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Avoid scope creep.**
- Mock external systems based on contract. 
- Don'd implement external dependencies because not available yet.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.
- Don't exchange existing logic with new one, unless explizitely asked. Add instead.
- If existing logic can be reused, reuse it - do not create duplicates.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Programming languages

**General**
- create .gitignore with defaults
- create README.md. explain how to start application
- create start scripts
- add verification gate into each implementation task. should include static code analysis and tests IF existing 

**Java-/TypeScript**

**Python**
- Always use virtual environments(.venv)
- Setup pylint an radon for static code analysis
- After finishing writing code, use pylint <changed_files> and radon cc <changed_files> for static code analysis. Incorporate findings. 

**Web Applications**
- Use Cloudscape UI components
- use JS/TS for UI

## 6. Verifiability

**Claiming task finished**

- If tests exist, run them. 
- If tests fail, make it visible and verbose.
- If tests fail, validate the test against the requirements first. Then if test is correct, fix the code.
- NEVER change test just to satisfy the existing code.

## 7. Research

## 8. Efficiency in work

Paralelization:
- If unrelated tasks can be paralelized, spin multiple subagents

## 9. Other
When building skills, use https://agentskills.io/specification.md as specificaton

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

