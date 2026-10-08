---
inclusion: auto
name: design-guidelines
description: Use when creating design from specification. Behavioral guidelines to reduce common LLM mistakes and shortcomings which happen during design-phase of SDD.
---

## 1. Goal
- The design phase answers the question: How should we build it?

## 2. Explainability
- Keep overview human readable

## 3. Complexity and effort estimation

- After design phase, for each requirement from the specification, add a complexity and effort estimation on a scale of 1-10 based on the design. Add this list to the specification document.
Example template:

```
1. [Check if Codes used for products already exist] → Complexity 5/10 | Effort 3/10
2. [Validate user input for date] → Complexity 1/10 | Effort 2/10
```