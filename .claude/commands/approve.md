---
name: approve
description: "Approve current workflow stage and advance to next stage"
usage: "approve [stage]"
---

# Approve Command

## Purpose

Approve the current workflow stage, mark it as complete, and automatically advance to the next stage by invoking the next agent in the sequence.

## Usage

```
approve
approve requirements
approve architecture
```

**Examples**:
- `approve` - Approve current stage
- `approve requirements` - Explicitly approve requirements stage
- `approve architecture` - Explicitly approve architecture stage

## Parameters

- **stage** (optional): Specific stage name to approve
  - If provided, validates it matches current stage
  - If omitted, approves whatever current stage is

## Pre-conditions

- Workflow state file exists (`.artifacts/workflow-state.json`)
- Workflow status is `WaitingForApproval`
- Current stage artifact exists and is valid
- User has reviewed the artifact

## Process

### Step 1: Read Workflow State

```bash
cat .artifacts/workflow-state.json
```

Parse:
- `storyId`
- `currentStage`
- `status`
- `approvedStages`
- Current artifact path

### Step 2: Validate Workflow Status

```bash
if [ "$STATUS" != "WaitingForApproval" ]; then
  echo "Error: Workflow is not waiting for approval"
  echo "Current status: $STATUS"
  exit 1
fi
```

### Step 3: Validate Stage (if specified)

```bash
if [ -n "$SPECIFIED_STAGE" ]; then
  if [ "$SPECIFIED_STAGE" != "$CURRENT_STAGE" ]; then
    echo "Error: Cannot approve $SPECIFIED_STAGE"
    echo "Current stage is: $CURRENT_STAGE"
    exit 1
  fi
fi
```

### Step 4: Validate Current Artifact

```bash
ARTIFACT_PATH="${ARTIFACTS[$CURRENT_STAGE]}"

# Check exists
if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "Error: Artifact missing: $ARTIFACT_PATH"
  echo "Cannot approve without valid artifact"
  exit 1
fi

# Check not empty
if [ ! -s "$ARTIFACT_PATH" ]; then
  echo "Error: Artifact is empty: $ARTIFACT_PATH"
  exit 1
fi

# Validate required sections (stage-specific)
validate_artifact_sections "$CURRENT_STAGE" "$ARTIFACT_PATH"
```

### Step 5: Update Workflow State - Add to Approved

```json
{
  ...
  "approvedStages": [...existing, "{CURRENT_STAGE}"],
  "status": "InProgress",
  "lastUpdatedAt": "{ISO_TIMESTAMP}"
}
```

### Step 6: Log Approval

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - {CURRENT_STAGE} Stage

**Action**: Stage Approved
**Status**: Success
**Approved By**: User
**Artifact**: {ARTIFACT_PATH}
**Next Stage**: {NEXT_STAGE}

---
```

### Step 7: Determine Next Stage

Stage progression:
```
Requirements → Architecture
Architecture → Planning
Planning → Implementation
Implementation → Review
Review → Verification
Verification → PR
PR → [WORKFLOW COMPLETE]
```

```bash
case "$CURRENT_STAGE" in
  "Requirements")  NEXT_STAGE="Architecture" ;;
  "Architecture")  NEXT_STAGE="Planning" ;;
  "Planning")      NEXT_STAGE="Implementation" ;;
  "Implementation") NEXT_STAGE="Review" ;;
  "Review")        NEXT_STAGE="Verification" ;;
  "Verification")  NEXT_STAGE="PR" ;;
  "PR")            NEXT_STAGE="COMPLETE" ;;
esac
```

### Step 8A: If Next Stage Exists - Invoke Agent

```bash
if [ "$NEXT_STAGE" != "COMPLETE" ]; then
  # Update state with next stage
  update_workflow_state "currentStage" "$NEXT_STAGE"
  
  # Log agent invocation
  log_audit "Agent Invoked" "InProgress" "$NEXT_STAGE Agent starting"
  
  # Invoke next agent
  invoke_stage_agent "$NEXT_STAGE" "$STORY_ID"
fi
```

**Agent Invocation by Stage**:

```javascript
// Requirements → Architecture
Agent({
  description: "Architecture stage for {STORY_ID}",
  prompt: "You are the Architecture Agent. Read .artifacts/{STORY_ID}-requirements.md and follow .claude/agents/architecture-agent.md to create .artifacts/{STORY_ID}-architecture.md"
})

// Architecture → Planning
Agent({
  description: "Planning stage for {STORY_ID}",
  prompt: "You are the Planning Agent. Read .artifacts/{STORY_ID}-architecture.md and follow .claude/agents/planning-agent.md to create .artifacts/{STORY_ID}-implementation-plan.md"
})

// Planning → Implementation
Agent({
  description: "Implementation stage for {STORY_ID}",
  prompt: "You are the Implementation Agent. Read .artifacts/{STORY_ID}-implementation-plan.md and follow .claude/agents/implementation-agent.md to implement code and create .artifacts/{STORY_ID}-implementation-summary.md"
})

// Implementation → Review
Agent({
  description: "Review stage for {STORY_ID}",
  prompt: "You are the Review Agent. Read .artifacts/{STORY_ID}-implementation-summary.md and review the implementation following .claude/agents/review-agent.md to create .artifacts/{STORY_ID}-review-report.md"
})

// Review → Verification
Agent({
  description: "Verification stage for {STORY_ID}",
  prompt: "You are the Verification Agent. Read .artifacts/{STORY_ID}-review-report.md and verify all criteria following .claude/agents/verification-agent.md to create .artifacts/{STORY_ID}-verification-report.md"
})

// Verification → PR
Agent({
  description: "PR stage for {STORY_ID}",
  prompt: "You are the PR Agent. Read .artifacts/{STORY_ID}-verification-report.md and all prior artifacts following .claude/agents/pr-agent.md to create .artifacts/{STORY_ID}-pr-package.md"
})
```

### Step 9: Wait for Agent Completion

Monitor agent until completion or failure.

### Step 10: Validate Next Artifact

```bash
# Check artifact created
validate_artifact_exists "$NEXT_STAGE" "$STORY_ID"

# Check artifact complete
validate_artifact_complete "$NEXT_STAGE" "$STORY_ID"
```

### Step 11: Update Workflow State with Artifact

```json
{
  ...
  "status": "WaitingForApproval",
  "lastUpdatedAt": "{ISO_TIMESTAMP}",
  "artifacts": {
    ...
    "{next_stage_key}": ".artifacts/{STORY_ID}-{next-stage}.md"
  }
}
```

### Step 12: Log Agent Completion

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - {NEXT_STAGE} Stage

**Action**: Agent Completed
**Status**: Success
**Artifact**: .artifacts/{STORY_ID}-{next-stage}.md
**Details**: {NEXT_STAGE} stage completed successfully

---
```

### Step 13: Display Next Stage Summary

```
✅ {NEXT_STAGE} Stage Complete

Artifact Generated:
.artifacts/{STORY_ID}-{next-stage}.md

Summary:
{Stage-specific summary points}

Key Highlights:
- {Highlight 1}
- {Highlight 2}
- {Highlight 3}

⏸ Workflow Paused - Awaiting Approval

Available Commands:
- "approve" - Proceed to {STAGE_AFTER_NEXT} stage
- "reject [reason]" - Request changes
- "view {next-stage}" - Display full artifact
- "status" - View workflow progress
```

### Step 8B: If Workflow Complete

```bash
if [ "$NEXT_STAGE" == "COMPLETE" ]; then
  # Update final state
  update_workflow_state "status" "Completed"
  update_workflow_state "lastUpdatedAt" "$(date -Iseconds)"
  
  # Log completion
  log_audit "Workflow Completed" "Success" "All stages approved and completed"
  
  # Display completion message
  display_workflow_complete
fi
```

**Completion Message**:

```
🎉 Workflow Complete!

Story: {STORY_ID} - {TITLE}

All Stages Completed:
✅ Requirements
✅ Architecture
✅ Planning
✅ Implementation
✅ Review
✅ Verification
✅ PR Package

PR Package Ready:
.artifacts/{STORY_ID}-pr-package.md

Next Steps:
1. Review PR package
2. Create pull request using PR description
3. Share with reviewers

Artifacts Location: .artifacts/

Workflow Duration: {DURATION}
```

## Post-conditions

### If Next Stage Invoked:
- ✅ Current stage added to approvedStages
- ✅ Workflow state updated to InProgress then WaitingForApproval
- ✅ Next stage agent invoked
- ✅ Next artifact generated
- ✅ Audit log updated
- ✅ User presented with next approval gate

### If Workflow Completed:
- ✅ Workflow status set to Completed
- ✅ All 7 stages approved
- ✅ All artifacts generated
- ✅ PR package ready
- ✅ Audit trail complete

## Error Handling

### Error: Workflow Not Waiting for Approval

**Message**: "Cannot approve. Workflow status: {status}"

**Resolution**: Check status with `status` command

### Error: Stage Mismatch

**Message**: "Cannot approve {specified}. Current stage is {current}"

**Resolution**: Use `approve` without stage name, or specify correct stage

### Error: Artifact Missing

**Message**: "Cannot approve. Artifact missing: {path}"

**Resolution**: Re-run current stage agent or create artifact manually

### Error: Artifact Invalid

**Message**: "Cannot approve. Artifact validation failed: {details}"

**Resolution**: Fix artifact or re-run agent

### Error: Next Agent Failed

**Message**: "{Next Stage} Agent failed: {error}"

**Resolution**: Retry agent or proceed manually

## Stage-Specific Validation

### Requirements

Check for:
- `## Business Requirements`
- `## Functional Requirements`
- `## Acceptance Criteria`

### Architecture

Check for:
- `## Technical Solution`
- `## Impacted Modules`
- `## Interfaces`

### Planning

Check for:
- `## Task Breakdown`
- `## Execution Sequence`
- `## Testing Plan`

### Implementation

Check for:
- `## Tasks Completed`
- `## Files Changed`
- `## Tests Added`

### Review

Check for:
- `## Review Summary`
- `## Issues Summary`
- `## Approval Decision`

### Verification

Check for:
- `## Verification Summary`
- `## Test Execution Results`
- `## Final Verification Decision`

### PR

Check for:
- `## PR Title`
- `## PR Description`
- `## Changelog`
- `## Release Notes`

## Example Execution

### Approve Requirements → Architecture

```
User: "approve"

Orchestrator:
[Reads workflow-state.json - currentStage: Requirements]
[Validates .artifacts/WA-123-requirements.md exists]
[Updates approvedStages: ["Requirements"]]
[Logs approval]
[Determines next stage: Architecture]
[Updates currentStage: Architecture]
[Invokes Architecture Agent]
[Waits for completion]
[Validates .artifacts/WA-123-architecture.md]
[Updates artifacts map]
[Logs completion]

Output:
✅ Architecture Stage Complete

Artifact: .artifacts/WA-123-architecture.md

Summary:
- Technical solution designed
- 5 modules will be modified
- 2 new modules will be created
- 3 external dependencies identified
- Testing strategy defined

⏸ Workflow Paused - Awaiting Approval

Commands: approve | reject | status
```

### Approve PR → Complete

```
User: "approve"

Orchestrator:
[Reads workflow-state.json - currentStage: PR]
[Validates .artifacts/WA-123-pr-package.md exists]
[Updates approvedStages: [..., "PR"]]
[Logs approval]
[Determines next stage: COMPLETE]
[Updates status: Completed]
[Logs completion]

Output:
🎉 Workflow Complete!

Story: WA-123 - Add weather forecast endpoint

All 7 stages completed and approved.

PR Package: .artifacts/WA-123-pr-package.md

Create your pull request using the PR package!
```

---

**Command**: approve v1.0
**Handler**: SDLC Orchestrator
**Action**: Advance workflow to next stage
**Gate**: Creates new approval gate at next stage
