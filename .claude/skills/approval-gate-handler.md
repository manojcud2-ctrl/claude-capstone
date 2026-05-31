---
name: approval-gate-handler
description: "Manage approval gates - display artifacts, collect decisions, enforce gates, handle approvals and rejections"
---

# Approval Gate Handler Skill

## Purpose

Reusable skill for managing human approval gates in any Agentic SDLC workflow. Handles displaying artifacts, collecting approval decisions, and enforcing approval requirements.

## Usage

Invoke this skill whenever you need to:
- Create an approval gate
- Display artifact summary
- Collect approval/rejection decision
- Enforce approval before proceeding
- Handle rejection feedback

## Operations

### 1. Create Approval Gate

**Usage**: `approval-gate create <stage> <artifact-path>`

**Action**: Creates approval gate with artifact summary

**Example**:
```bash
approval-gate create Requirements .artifacts/WA-123-requirements.md
```

**Output**:
```
╔═══════════════════════════════════════════════════╗
║     APPROVAL GATE - Requirements Stage            ║
╚═══════════════════════════════════════════════════╝

✅ Stage Complete

Story: WA-123 - Add weather endpoint

Artifact Generated:
.artifacts/WA-123-requirements.md

Artifact Summary:
────────────────────────────────────────────────────
Size: 12.5 KB
Sections: 12
Last Modified: 2026-05-31T10:30:00Z

Key Contents:
  • Business Requirements: 5 identified
  • Functional Requirements: 12 defined
  • Non-Functional Requirements: 8 specified
  • Acceptance Criteria: 6 created
  • Open Questions: 2 flagged
  • Assumptions: 4 documented

Quality Score: 95/100
────────────────────────────────────────────────────

⏸ Workflow Paused - Awaiting Human Approval

Review the artifact and decide:

Commands:
  • approve           - Approve Requirements and proceed to Architecture
  • reject [reason]   - Reject and request changes
  • view requirements - Display full artifact contents
  • status           - View overall workflow progress

Tip: Run "view requirements" to see complete artifact before approving
```

### 2. Display Artifact Summary

**Usage**: `approval-gate summary <stage> <artifact-path>`

**Action**: Shows concise artifact summary

**Example**:
```bash
approval-gate summary Architecture .artifacts/WA-123-architecture.md
```

**Output**:
```
Architecture Artifact Summary
────────────────────────────────────────────────────

Technical Solution:
  • Microservices approach with REST API
  • Node.js/Express backend
  • PostgreSQL database

Impacted Modules:
  • 3 modules to modify
  • 2 new modules to create

Interfaces:
  • 4 new API endpoints
  • 2 database tables

Dependencies:
  • 2 new npm packages required

Risks:
  • 3 risks identified (1 high, 2 medium)
  • Mitigation strategies defined

Testing Strategy:
  • Unit tests: 15 planned
  • Integration tests: 8 planned
  • Functional tests: 5 planned

Quality Score: 92/100
```

### 3. Collect Approval Decision

**Usage**: `approval-gate prompt <stage>`

**Action**: Prompts user for approval/rejection decision

**Example**:
```bash
approval-gate prompt Planning
```

**Output**: Uses AskUserQuestion to collect decision:
```
Review Planning Stage Artifact

Options:
  1. ✅ Approve - Planning looks good, proceed to Implementation
  2. ❌ Reject - Planning needs changes
  3. 👁 View First - Display full artifact before deciding

[User selects option]

If Approve:
  → Returns: { decision: "approve" }

If Reject:
  → Prompts: "What needs to be changed?"
  → Returns: { decision: "reject", reason: "<user input>" }

If View First:
  → Displays artifact
  → Re-prompts for decision
```

### 4. Enforce Gate

**Usage**: `approval-gate enforce <stage> <artifact-path>`

**Action**: Validates artifact before allowing approval

**Example**:
```bash
approval-gate enforce Implementation .artifacts/WA-123-implementation-summary.md
```

**Checks**:
- Artifact exists
- Artifact not empty
- Required sections present
- Tests passing (if implementation)
- Quality score meets threshold

**Output if valid**:
```
✅ Approval Gate Requirements Met

Artifact: .artifacts/WA-123-implementation-summary.md
Validation: Passed

Ready for approval.
```

**Output if invalid**:
```
❌ Approval Gate Requirements NOT Met

Artifact: .artifacts/WA-123-implementation-summary.md

Issues:
  ❌ Test Results section missing
  ❌ Coverage below threshold (45% vs 50% required)
  ⚠️ Quality score low (62/100)

Cannot approve until issues resolved.

Actions:
  1. Fix issues in artifact
  2. Re-run validation
  3. Or retry stage: "retry implementation"
```

### 5. Handle Approval

**Usage**: `approval-gate approve <stage> <artifact-path> <next-stage>`

**Action**: Processes approval and prepares for next stage

**Example**:
```bash
approval-gate approve Planning .artifacts/WA-123-implementation-plan.md Implementation
```

**Actions**:
1. Logs approval to audit trail
2. Updates workflow state
3. Displays confirmation
4. Prepares next stage invocation

**Output**:
```
✅ Planning Approved

Approved By: User
Approved At: 2026-05-31T12:20:00Z
Artifact: .artifacts/WA-123-implementation-plan.md

Workflow Updated:
  • Planning added to approved stages
  • Current stage: Implementation
  • Status: InProgress

Next: Implementation Agent will be invoked

Proceeding to Implementation stage...
```

### 6. Handle Rejection

**Usage**: `approval-gate reject <stage> <artifact-path> <reason>`

**Action**: Processes rejection and provides fix guidance

**Example**:
```bash
approval-gate reject Architecture .artifacts/WA-123-architecture.md "Database schema not defined"
```

**Actions**:
1. Logs rejection to audit trail
2. Keeps workflow at current stage
3. Displays fix options
4. Provides guidance

**Output**:
```
❌ Architecture Rejected

Rejected By: User
Rejected At: 2026-05-31T11:15:00Z
Reason: Database schema not defined

Artifact: .artifacts/WA-123-architecture.md

Workflow Status:
  • Current stage: Architecture (unchanged)
  • Status: WaitingForApproval
  • Waiting for corrections

Fix Options:

1️⃣ Edit Manually
   • Open: .artifacts/WA-123-architecture.md
   • Add database schema section
   • Include table definitions and relationships
   • Save and run: approve

2️⃣ Re-run Agent
   • Command: retry architecture
   • Agent will regenerate artifact
   • Review new artifact
   • Approve or reject again

3️⃣ View for Context
   • Command: view architecture
   • See current artifact contents
   • Identify what's missing
   • Make targeted edits

Agent Instructions:
See: .claude/agents/architecture-agent.md
For: Expected artifact format and sections

When Ready:
  • Run: approve
  • Or: retry architecture
```

### 7. Get Gate Status

**Usage**: `approval-gate status`

**Action**: Shows current approval gate status

**Output**:
```
Current Approval Gate Status
────────────────────────────────────────────────────

Workflow: WA-123 - Add weather endpoint

Current Gate:
  Stage: Implementation
  Status: Awaiting Approval
  Artifact: .artifacts/WA-123-implementation-summary.md
  Created: 2026-05-31T15:30:00Z
  Waiting: 15 minutes

Previous Gates:
  ✅ Requirements    - Approved (2026-05-31T10:35:00Z)
  ✅ Architecture    - Approved after 1 rejection (2026-05-31T11:50:00Z)
  ✅ Planning        - Approved (2026-05-31T12:20:00Z)

Next Gate:
  Review (after Implementation approval)
```

### 8. Gate Metrics

**Usage**: `approval-gate metrics`

**Action**: Returns approval gate analytics

**Output**:
```
Approval Gate Metrics
────────────────────────────────────────────────────

Total Gates Passed: 3
Total Rejections: 1
Approval Rate: 75%

Average Wait Time: 8 minutes
Longest Wait: 15 minutes (Architecture)
Shortest Wait: 3 minutes (Planning)

Rejections by Stage:
  Architecture: 1 rejection
  Others: 0 rejections

Most Common Rejection Reason:
  "Missing design details" (1 occurrence)
```

## Gate Types

### Standard Gate

Display summary, collect decision, enforce validation.

### Strict Gate

Requires all validation checks to pass before allowing approval.

### Review Gate

Includes review checklist that must be confirmed.

### Verification Gate

Requires test execution and passing results.

## Validation Rules

### Pre-Approval Checks

Before allowing approval:
- ✅ Artifact exists
- ✅ Artifact not empty
- ✅ Required sections present
- ✅ Quality score above threshold
- ✅ No critical validation errors

### Stage-Specific Checks

**Implementation Gate**:
- Tests must be passing
- Coverage above threshold
- No syntax errors

**Verification Gate**:
- All acceptance criteria verified
- Test suite passing
- No critical issues from review

## Implementation

### Gate State

Tracks gate status in workflow state:
```json
{
  "currentGate": {
    "stage": "Implementation",
    "status": "Awaiting",
    "artifactPath": ".artifacts/WA-123-implementation-summary.md",
    "createdAt": "2026-05-31T15:30:00Z",
    "validationPassed": true
  }
}
```

### Decision Collection

Uses AskUserQuestion for interactive decision collection.

### Validation Integration

Uses artifact-validator skill for validation checks.

### Audit Integration

Uses audit-logger skill for logging all gate events.

## Error Handling

### Artifact Not Ready

```
Error: Cannot create approval gate
Reason: Artifact not found
Path: .artifacts/WA-123-requirements.md
Action: Generate artifact first, then create gate
```

### Validation Failed

```
Error: Cannot approve
Reason: Validation checks failed
Issues:
  - Missing required section: Test Results
  - Quality score below threshold
Action: Fix issues before approval
```

### Invalid Decision

```
Error: Invalid approval decision
Decision: "maybe"
Valid: "approve" or "reject"
Action: Provide valid decision
```

## Usage in Orchestrator

```javascript
// Create gate after stage completes
Skill({
  skill: "approval-gate-handler",
  args: "create Requirements .artifacts/WA-123-requirements.md"
});

// Enforce validation before approval
const validation = Skill({
  skill: "approval-gate-handler",
  args: "enforce Requirements .artifacts/WA-123-requirements.md"
});

// Collect decision
const decision = Skill({
  skill: "approval-gate-handler",
  args: "prompt Requirements"
});

// Handle approval
if (decision.includes("approve")) {
  Skill({
    skill: "approval-gate-handler",
    args: "approve Requirements .artifacts/WA-123-requirements.md Architecture"
  });
}

// Handle rejection
if (decision.includes("reject")) {
  Skill({
    skill: "approval-gate-handler",
    args: `reject Requirements .artifacts/WA-123-requirements.md "${reason}"`
  });
}
```

## Benefits

✅ **Consistent Gates** - Standardized approval process  
✅ **Validation Enforced** - Quality checks before approval  
✅ **User-Friendly** - Clear options and guidance  
✅ **Audit Trail** - All decisions logged  
✅ **Flexible** - Support multiple gate types  

## Configuration

### Quality Thresholds

```json
{
  "approval_gates": {
    "quality_score_minimum": 85,
    "coverage_minimum": 50,
    "strict_validation": true
  }
}
```

### Custom Validation

Add stage-specific validation rules.

### Approval Templates

Customize gate display templates.

---

**Skill**: approval-gate-handler v1.0  
**Type**: Reusable utility  
**Compatible**: Any human-in-the-loop workflow
