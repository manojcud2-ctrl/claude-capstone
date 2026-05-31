# Agentic SDLC - Visual Workflow Diagram

## 🎬 Complete Workflow Flow

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                         USER COMMAND                              ┃
┃                     "start story WA-46"                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━┯━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                        │
                        ▼
        ┌───────────────────────────────────┐
        │   SDLC ORCHESTRATOR INITIALIZED   │
        │  - Parse Jira ID (WA-46)          │
        │  - Create .artifacts/ directory   │
        │  - Initialize workflow state      │
        │  - Initialize audit log           │
        └───────────────┬───────────────────┘
                        │
        ┌───────────────┴───────────────────┐
        │       Fetch from Jira             │
        │   (via jira-integrator skill)     │
        │   "Get Weather Data by City Name" │
        └───────────────┬───────────────────┘
                        │
        ════════════════════════════════════════════════════════════
                    STAGE 1: REQUIREMENTS
        ════════════════════════════════════════════════════════════
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    🤖 REQUIREMENTS AGENT          │
        │  - Analyze Jira story             │
        │  - Extract business requirements  │
        │  - Extract functional req's       │
        │  - Create acceptance criteria     │
        │  - Document assumptions           │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-requirements.md │
        │                                   │
        │  Contents:                        │
        │  - Business Objectives: 2         │
        │  - Functional Req's: 5            │
        │  - Non-Functional Req's: 3        │
        │  - Acceptance Criteria: 4         │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 1            ┃
        ┃                                   ┃
        ┃  Display artifact summary         ┃
        ┃  Ask: "Approve requirements?"     ┃
        ┃                                   ┃
        ┃  User options:                    ┃
        ┃  → approve (continue)             ┃
        ┃  → reject (stay, fix, retry)      ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 2: ARCHITECTURE
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 ARCHITECTURE AGENT          │
        │  - Analyze existing codebase      │
        │  - Design component architecture  │
        │  - Define interfaces              │
        │  - Identify risks                 │
        │  - Create diagrams                │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-architecture.md │
        │                                   │
        │  Contents:                        │
        │  - Components: 3                  │
        │  - Interfaces: 2                  │
        │  - Dependencies: 4                │
        │  - Risks: 2 (Mitigated)           │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 2            ┃
        ┃  "Approve architecture?"          ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 3: PLANNING
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 PLANNING AGENT              │
        │  - Break into atomic tasks        │
        │  - Estimate effort (T-shirt)      │
        │  - Identify dependencies          │
        │  - Sequence tasks                 │
        │  - Risk assessment                │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-impl-plan.md    │
        │                                   │
        │  Contents:                        │
        │  - Tasks: 8                       │
        │  - Dependencies: 3                │
        │  - Estimated Effort: M            │
        │  - Critical Path: identified      │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 3            ┃
        ┃  "Approve implementation plan?"   ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 4: IMPLEMENTATION
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 IMPLEMENTATION AGENT        │
        │  - Create/update code files       │
        │  - Follow repo conventions        │
        │  - Generate unit tests            │
        │  - Update documentation           │
        │  - Commit changes                 │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    💾 CODE CHANGES APPLIED        │
        │  Branch: feature/WA-46-weather    │
        │                                   │
        │  Modified:                        │
        │  - src/server.js                  │
        │  - test/functional/weather.test.js│
        │                                   │
        │  📄 Summary Created:               │
        │  .artifacts/WA-46-impl-summary.md │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 4            ┃
        ┃  "Approve implementation?"        ┃
        ┃  (Review actual code changes)     ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 5: REVIEW
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 REVIEW AGENT                │
        │  - Review code quality            │
        │  - Check test coverage            │
        │  - Validate architecture          │
        │  - Identify security issues       │
        │  - Check maintainability          │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-review-report.md│
        │                                   │
        │  Contents:                        │
        │  - Issues Found: 2 (Minor)        │
        │  - Test Coverage: 85%             │
        │  - Architecture: ✓ Compliant      │
        │  - Security: No issues            │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 5            ┃
        ┃  "Approve review findings?"       ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 6: VERIFICATION
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 VERIFICATION AGENT          │
        │  - Verify acceptance criteria     │
        │  - Run test suites                │
        │  - Check requirements coverage    │
        │  - Validate review fixes          │
        │  - End-to-end validation          │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-verify-report.md│
        │                                   │
        │  Contents:                        │
        │  - Acceptance Criteria: 4/4 ✓     │
        │  - Tests: All passing (12/12)     │
        │  - Requirements: Fully covered    │
        │  - Review Issues: Resolved        │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃    ⏸️  APPROVAL GATE 6            ┃
        ┃  "Approve verification?"          ┃
        ┗━━━━━━━━┯━━━━━━━━━━━┯━━━━━━━━━━━━┛
                 │           │
          reject │           │ approve
                 │           │
                 ▼           ▼
           [LOOP BACK]  [CONTINUE]
                             │
        ════════════════════════════════════════════════════════════
                    STAGE 7: PR CREATION
        ════════════════════════════════════════════════════════════
                             │
                             ▼
        ┌───────────────────────────────────┐
        │    🤖 PR AGENT                    │
        │  - Generate PR title              │
        │  - Generate PR description        │
        │  - Create changelog               │
        │  - Build reviewer checklist       │
        │  - Summarize testing              │
        │  - Create PR (via GitHub)         │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │    📄 ARTIFACT CREATED             │
        │  .artifacts/WA-46-pr-package.md   │
        │                                   │
        │  🔗 PULL REQUEST CREATED:          │
        │  github.com/user/repo/pull/123    │
        │                                   │
        │  Title: feat: Add weather         │
        │         endpoint (WA-46)          │
        │  Branch: feature/WA-46-weather    │
        │  Base: main                       │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃                                                          ┃
        ┃            🎉 WORKFLOW COMPLETE! 🎉                      ┃
        ┃                                                          ┃
        ┃  ✓ Requirements documented                              ┃
        ┃  ✓ Architecture designed                                ┃
        ┃  ✓ Plan created                                         ┃
        ┃  ✓ Code implemented                                     ┃
        ┃  ✓ Code reviewed                                        ┃
        ┃  ✓ Tests verified                                       ┃
        ┃  ✓ Pull request created                                 ┃
        ┃                                                          ┃
        ┃  All artifacts saved in .artifacts/                     ┃
        ┃  Complete audit trail in .audit/WA-46-audit.log         ┃
        ┃                                                          ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 State Transitions

```
Workflow Status Flow:

┌─────────────┐
│ Initialized │ ──────┐
└─────────────┘       │
                      ▼
             ┌────────────────┐
             │  InProgress    │ ◄──────┐
             │ (Agent Running)│        │
             └────────┬───────┘        │
                      │                │
                      ▼                │
          ┌────────────────────┐       │
          │ WaitingForApproval │       │
          │  (User Decision)   │       │
          └──────┬─────────┬───┘       │
                 │         │           │
           reject│         │approve    │
                 │         │           │
                 ▼         ▼           │
            [Edit]    [Advance]       │
            [Retry]    [Stage]        │
                 │         │           │
                 └─────────┴───────────┘
                           │
                           │ (All stages approved)
                           ▼
                   ┌──────────────┐
                   │  Completed   │
                   └──────────────┘
```

---

## 🗂️ Artifact Generation Flow

```
Story (WA-46) from Jira
         │
         ▼
    Requirements Agent ──► requirements.md
         │
         ├─────────────────┐
         ▼                 ▼
    Architecture      requirements.md
       Agent       ──► architecture.md
         │
         ├─────────────────┬──────────────┐
         ▼                 ▼              ▼
    Planning         requirements.md  architecture.md
      Agent       ──► impl-plan.md
         │
         ├─────────────────┬──────────────┬──────────────┐
         ▼                 ▼              ▼              ▼
  Implementation    requirements.md  architecture.md  plan.md
      Agent       ──► [CODE CHANGES] + impl-summary.md
         │
         ├─────────────────┬──────────────┬──────────────┬────────┐
         ▼                 ▼              ▼              ▼        ▼
     Review           Code Changes    requirements.md  arch.md  plan.md
      Agent       ──► review-report.md
         │
         ├─────────────────┬──────────────┬──────────────┐
         ▼                 ▼              ▼              ▼
  Verification      review-report.md  Code Changes  requirements.md
      Agent       ──► verification-report.md
         │
         ├─────────────────┬──────────────┬──────────────┬────────┐
         ▼                 ▼              ▼              ▼        ▼
    PR Agent         All Artifacts   Code Changes   Test Results
                 ──► pr-package.md + CREATE GITHUB PR
```

---

## 🎛️ Orchestrator Control Flow

```
                    ┌────────────────────┐
                    │  User Command      │
                    │  (start/approve/   │
                    │   reject/status)   │
                    └──────────┬─────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │ SDLC Orchestrator  │
                    └──────────┬─────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │  Workflow    │   │    Agent     │   │   Approval   │
    │   State      │   │ Coordinator  │   │    Gate      │
    │  Manager     │   │              │   │   Handler    │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
           │                  │                  │
           │                  │                  │
           ▼                  ▼                  ▼
    Read/Write          Invoke Agent       Ask User
    state.json          Monitor Status     Collect Decision
           │                  │                  │
           │                  │                  │
           └──────────────────┴──────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   Audit Logger     │
                    │ (Log all actions)  │
                    └────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   JIRA   │────────▶│ Workflow │────────▶│  GitHub  │
│  (Input) │         │ Pipeline │         │ (Output) │
└──────────┘         └─────┬────┘         └──────────┘
                           │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ .artifacts/  │   │  Repository  │   │   .audit/    │
│ (Documents)  │   │    (Code)    │   │   (Logs)     │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🔍 Approval Gate Details

```
Each Approval Gate:

┌─────────────────────────────────────────┐
│         APPROVAL GATE HANDLER           │
├─────────────────────────────────────────┤
│                                         │
│  1. Display Artifact Summary            │
│     - Show key metrics                  │
│     - Highlight important sections      │
│                                         │
│  2. Validate Artifact                   │
│     - File exists?                      │
│     - Required sections present?        │
│     - Meets quality threshold?          │
│                                         │
│  3. Prompt User Decision                │
│     ┌─────────────────────────────┐    │
│     │  Options:                   │    │
│     │  → Approve (continue)       │    │
│     │  → Reject (stay, provide    │    │
│     │           feedback)         │    │
│     └─────────────────────────────┘    │
│                                         │
│  4. Log Decision                        │
│     - Record choice                     │
│     - Timestamp                         │
│     - User feedback (if rejected)       │
│                                         │
│  5. Update State                        │
│     - Advance workflow (if approved)    │
│     - Keep at current stage (rejected)  │
│                                         │
└─────────────────────────────────────────┘
```

---

**For more details, see:**
- [FRAMEWORK-SUMMARY.md](./FRAMEWORK-SUMMARY.md) - Complete framework overview
- [QUICK-START.md](./QUICK-START.md) - Get started in 5 minutes
