---
name: "ticket-resolution"
description: "End-to-end automated multi-agent workflow for resolving Linear tickets via Implementation, Pattern Application, Review, PR Generation, and Quality Gating."
version: "1.0.0"
---

# Autonomous Ticket Resolution Pipeline

This workflow defines the orchestrated, 6-phase pipeline for resolving software engineering tickets autonomously. It delegates tasks to specialized sub-agents and utilizes the Model Context Protocol (MCP) to interface with external tools.

## Global Variables
- `TICKET_ID`: The Linear issue identifier passed upon invocation.
- `ITERATION_COUNT`: Tracks the number of self-healing loops to prevent infinite token burn. Initialized to 0.
- `MAX_ITERATIONS`: Circuit breaker threshold, set to 3.

---

## Phase 1: Automated Ticket Ingestion
**Agent:** Orchestrator
**Objective:** Ingest ticket data and synthesize the immutable Specification Artifact.
1. Use Linear MCP server (`get_issue`) with `TICKET_ID`.
2. Extract title, description, and acceptance criteria.
3. Synthesize the **Specification Artifact** outlining core objectives, constraints, and binary acceptance criteria.
4. Load the Specification Artifact into the active workflow context.

---

## Phase 2: Precision Implementation Agent
**Agent:** Implementation Agent
**Context:** Specification Artifact, Error Critique (if in retry loop)
**Objective:** Execute ticket logic with minimum necessary changes.
1. Perform exploratory code search via workspace tools to locate target modules.
2. Read specific snippets to establish local context.
3. Output modifications strictly using **Search-Replace** blocks (unified diff format).
4. Do not output full file replacements.

---

## Phase 3: Architectural Pattern Enforcement Agent
**Agent:** Pattern Agent
**Context:** Codebase diffs from Phase 2
**Objective:** Enforce architectural standards without altering business logic.
1. Evaluate newly applied code diffs.
2. Dynamically load relevant skills from `.agents/skills/*.md` based on matched patterns (e.g., repository-pattern, clean-ddd-hexagonal).
3. Apply structural refactoring (extraction, encapsulation, decoupling).

---

## Phase 4: Adversarial Review Agent
**Agent:** Review Agent (Isolated Context)
**Context:** Specification Artifact (Phase 1), Final Unified Diff (Phases 2 & 3)
**Objective:** Audit the implementation for regressions, scope creep, and security.
1. Assert **Requirement Traceability**: Map changes to the acceptance criteria.
2. Assert **Pattern Compliance**: Verify adherence to applied `.agents/skills/`.
3. Assert **Static Security and Optimization**: Check for hardcoded credentials or inefficient loops.
4. // if [Review Fails]
   - Generate micro-correction critique.
   - // route to Phase 2 (Micro-correction mode)

---

## Phase 5: Automated Pull Request Generation
**Agent:** PR Agent
**Context:** Approved Unified Diff
**Objective:** Stage, commit, and submit PR via GitHub MCP.
1. Create a new git worktree and branch named `feature/{TICKET_ID}`.
2. Stage approved diffs.
3. Generate a conventional commit referencing the `{TICKET_ID}`.
4. Invoke `create_pull_request` via GitHub MCP with a comprehensive PR description, linking the Linear ticket and tagging as "Agent-Assisted".

---

## Phase 6: The Quality Gate and Autonomous Feedback Loop
**Agent:** Quality Gate Agent
**Objective:** Execute deterministic CI/CD metrics.
1. Execute unit & integration tests (`npm run test` or equivalent).
2. Execute coverage reporting.
3. Execute static code analysis (linters).
4. Evaluate results against thresholds (100% pass rate, >80% coverage, 0 critical lints).

// if [Quality Gate == REJECTED]
   1. Increment `ITERATION_COUNT`.
   // if [ITERATION_COUNT > MAX_ITERATIONS]
      - Add "Human Intervention Required" label to PR via GitHub MCP.
      - Terminate workflow (Circuit Breaker triggered).
   // else
      - Extract failure logs and stack traces.
      - Synthesize critique document.
      - Post critique as PR comment via GitHub MCP.
      - // route to Phase 2 (Self-Healing Retry Loop)

// if [Quality Gate == APPROVED]
   1. Prepare notification payload.
   2. Invoke `send_email` via SMTP MCP to notify the pipeline owner that the PR is ready for review.
   3. Terminate workflow successfully.
