---
inclusion: auto
name: specification-quidelines
description: Use when creating specification. Behavioral guidelines to reduce common LLM mistakes and shortcomings which happen during spec-phase of SDD.
---

# Specification Guidelines

## 1. Business requirements first

- The specify phase answers a fundamental question: WHAT should the software do. 
- Specification does NOT prescribe implementation details
- Do NOT add technical and design decisions into the specification
- Explain what change will the user be able to observe once this is done

## 2. Simplicity first

- Do NOT overspecify
- For new features follow rules:
  -  IF extension of existing specs THEN update existing spec
  -  IF disjoned, independent THEN create new spec
- Do NOT repeat what is already obvious from existing state(e.g. part of the existing architecture, common design in the project, known behaviour, common knowledge, etc)
- If relying on existing functionality, reference the spec
- Write human readable spec with ASD-STE100 Simplified Technical English 
- As part of the Introduction, provide additional sub-paragfaph: Business flow. It describes the main business flow(use diagram if necesary). 
- If more spec details are needed, add section "For Agent Use" for agents with additional information
Template:
```
### Requirement X: <Requirement>

**User Story:** Human readable description of the story with expectations

#### Acceptance Criteria
#### For Agent Use 
```

## 3. Surface when unsure

- WHEN input is ambiguous, DO ask the user a question. Record the question and the answer
- Before asking for clarification, DO validate whether the options provided are applicable and feasible first

## 4. Validate before done

- Just before calling the specification done, start a subagent and validate the spec document against the user input. Look critical at assumptions and "filling the gaps" form initial user input


## 9. Misc

- Give a sequencial number to the each new spec
