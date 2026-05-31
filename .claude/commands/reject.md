---
name: reject
description: "Reject current workflow stage and request changes"
usage: "reject [reason]"
---

# Reject Command

## Purpose

Reject the current workflow stage, keep the workflow at the current stage, log the rejection reason, and wait for the user to make corrections before re-attempting approval.

## Usage

```
reject
reject - requirements are incomplete
reject requirements - missing performance criteria
```

**Examples**:
- `reject` - Reject current stage (will prompt for reason)
- `reject - requirements incomplete` - Reject with inline reason
- `reject architecture - missing database design` - Reject specific stage with reason

## Parameters

- **reason** (optional): Explanation for rejection
  - If provided, logged immediately
  - If omitted, user will be prompted for reason
  - Should describe what's wrong or what needs to change

## Pre-conditions

- Workflow exists in StateManager (`.claude/state/workflows/{storyId}.json`)
- Current stage status is `draft` (awaiting approval)
- User has reviewed current artifact and identified issues

## Process

### Step 1: Read Workflow State

**Using StateManager API:**
```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

// Get active workflow
const storyId = await sm.getActiveStory();
const workflow = await sm.getWorkflow(storyId);
const currentStage = workflow.currentStage;
const stageStatus = workflow.stages[currentStage].status;
const artifact = workflow.stages[currentStage].artifact;
```

**Using CLI:**
```bash
STORY_ID=$(node .claude/skills/workflow-state-manager.js read | jq -r '.jiraStoryId')
CURRENT_STAGE=$(node .claude/skills/workflow-state-manager.js read currentStage | jq -r '.')
STAGE_STATUS=$(node .claude/skills/workflow-state-manager.js read stages.${CURRENT_STAGE}.status | jq -r '.')
ARTIFACT=$(node .claude/skills/workflow-state-manager.js read stages.${CURRENT_STAGE}.artifact | jq -r '.')
```

### Step 2: Validate Stage Status

```javascript
if (stageStatus !== 'draft') {
  throw new Error(`Cannot reject ${currentStage}. Status is ${stageStatus}, expected draft`);
}
```

**CLI:**
```bash
if [ "$STAGE_STATUS" != "draft" ]; then
  echo "Error: Cannot reject. Stage status is $STAGE_STATUS (expected draft)"
  exit 1
fi
```

### Step 3: Collect Rejection Reason

```bash
if [ -z "$REASON" ]; then
  echo "Why are you rejecting ${CURRENT_STAGE}?"
  read -p "Reason: " REASON
fi

if [ -z "$REASON" ]; then
  REASON="No reason provided"
fi
```

### Step 4: Add Rejection Comment to Stage

**Using StateManager API:**
```javascript
// Add rejection comment to stage
const existingComments = workflow.stages[currentStage].comments || [];
await sm.updateStage(storyId, currentStage, {
  comments: [...existingComments, {
    type: 'rejection',
    reason: REASON,
    timestamp: new Date().toISOString()
  }]
});

// Note: stage status stays 'draft'
// Note: currentStage stays the same
// Note: stage is NOT marked as 'completed'
```

**Using CLI:**
```bash
# Add comment via custom script or note in audit log
# State manager CLI doesn't directly support comment arrays yet
echo "Rejection: $REASON ($(date -Iseconds))" >> ".artifacts/audit-log.md"
```

### Step 5: Log Rejection

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - {CURRENT_STAGE} Stage

**Action**: Stage Rejected
**Status**: Rejected
**Rejected By**: User
**Reason**: {REASON}
**Artifact**: {ARTIFACT_PATH}
**Details**: Stage rejected, awaiting corrections

---
```

### Step 6: Display Rejection Confirmation and Guidance

```
❌ {CURRENT_STAGE} Rejected

Reason: {REASON}

Artifact: docs/workflows/{STORY_ID}/{current-stage}.md

Status: Workflow remains at {CURRENT_STAGE} stage

Options to Fix:

1️⃣ Edit Manually:
   - Open: docs/workflows/{STORY_ID}/{current-stage}.md
   - Make required changes
   - Save the file
   - Run: approve

2️⃣ Re-run Agent:
   - Run: retry {current-stage}
   - Agent will regenerate artifact
   - Review new artifact
   - Run: approve or reject

3️⃣ View for Reference:
   - Run: view {current-stage}
   - See artifact contents
   - Identify specific issues

4️⃣ Check Guidance:
   - See: .claude/agents/{current-stage}-agent.md
   - Review agent's responsibilities
   - Understand expected output format

Current Status:
- Stage: {CURRENT_STAGE}
- Status: WaitingForApproval (after fixes)
- Approved Stages: {LIST_OF_APPROVED}

Next Steps:
1. Make corrections (option 1 or 2 above)
2. Run "approve" when ready
3. Or run "status" to see progress
```

### Step 7: Wait for User Action

Workflow pauses. User can:
- Edit artifact manually, then `approve`
- Run `retry {stage}` to re-run agent
- Run `view {stage}` to see artifact
- Run `status` to check workflow state
- Run `reject` again with updated reason

## Post-conditions

- ✅ Rejection logged to audit trail
- ✅ Workflow remains at current stage
- ✅ Status still WaitingForApproval
- ✅ Current stage NOT added to approvedStages
- ✅ User informed of rejection
- ✅ Guidance provided for fixing
- ✅ Workflow awaiting user corrections

## Rejection Patterns

### Rejection During Early Stages (Requirements, Architecture, Planning)

**Common reasons**:
- Missing information
- Incomplete sections
- Unclear requirements
- Wrong assumptions
- Missing edge cases

**Fix approach**: Edit or re-run agent with better input

### Rejection During Implementation

**Common reasons**:
- Tests failing
- Code doesn't match plan
- Missing functionality
- Poor code quality

**Fix approach**: Manual code fixes, then re-run implementation summary

### Rejection During Review

**Common reasons**:
- Critical issues found
- Standards not followed
- Security concerns

**Fix approach**: Fix code issues, re-run review

### Rejection During Verification

**Common reasons**:
- Tests failing
- Acceptance criteria not met
- Requirements not covered

**Fix approach**: Fix implementation, re-run tests, re-verify

### Rejection of PR Package

**Common reasons**:
- Incorrect PR description
- Missing changelog entries
- Incomplete release notes

**Fix approach**: Edit PR package or re-run PR agent

## Error Handling

### Error: Workflow Not Waiting

**Message**: "Cannot reject. Workflow status: {status}"

**Resolution**: Only reject when at approval gate

### Error: No Active Workflow

**Message**: "No active workflow found"

**Resolution**: Start workflow with `start story {id}`

### Error: Invalid Stage

**Message**: "Cannot reject {specified}. Current stage is {current}"

**Resolution**: Reject without specifying stage name

## Multiple Rejections

The workflow supports multiple rejection cycles:

```
Requirements Generated
→ User: reject - missing NFRs
→ [User edits artifact]
→ User: approve
→ Architecture Generated
→ User: reject - database design unclear
→ [User runs: retry architecture]
→ Architecture Regenerated
→ User: reject - still missing schema
→ [User edits artifact manually]
→ User: approve
→ Planning Generated
→ User: approve
→ ...
```

Each rejection is logged to audit trail, creating a complete history of feedback and iterations.

## Best Practices

### Writing Good Rejection Reasons

**Good**:
- `reject - missing performance requirements in NFRs section`
- `reject - database schema not defined in architecture`
- `reject - tests failing for edge case handling`
- `reject - PR description doesn't explain breaking changes`

**Bad**:
- `reject - not good enough`
- `reject - fix it`
- `reject - wrong`

**Why**: Specific reasons help with fixing and create clear audit trail

### When to Reject vs Edit

**Reject and Re-run Agent**:
- Missing entire sections
- Fundamentally wrong approach
- Need fresh analysis

**Reject and Edit Manually**:
- Small corrections
- Adding missing details
- Fixing typos or formatting

### Tracking Rejections

All rejections logged in audit trail:
- See rejection history
- Track improvement areas
- Identify problematic stages
- Measure quality trends

## Example Execution

### Reject Requirements

```
User: "reject - missing API rate limiting requirements"

Orchestrator:
[Reads workflow state via StateManager - currentStage: requirements]
[Logs rejection with reason]
[Keeps stage at Requirements]

Output:
❌ Requirements Rejected

Reason: missing API rate limiting requirements

Artifact: docs/workflows/WA-123/requirements.md

Options to Fix:
1. Edit docs/workflows/WA-123/requirements.md manually
2. Run: retry requirements
3. Run: view requirements

Current Status: Awaiting corrections at Requirements stage

Run "approve" when ready to proceed.
```

### Reject with Prompt

```
User: "reject"

Orchestrator: "Why are you rejecting Architecture?"

User: "Database schema is not defined"

Orchestrator:
[Logs rejection with reason]
[Keeps stage at Architecture]

Output:
❌ Architecture Rejected

Reason: Database schema is not defined

[... rest of rejection guidance ...]
```

### After Fix and Re-approval

```
User: [edits docs/workflows/WA-123/architecture.md]
User: "approve"

Orchestrator:
[Reads workflow state via StateManager - currentStage: architecture]
[Validates artifact]
[Proceeds to Planning]

Output:
✅ Planning Stage Complete
[... continues workflow ...]
```

## Audit Trail Example

```markdown
## 2026-05-31T10:30:00Z - Architecture Stage

**Action**: Stage Rejected
**Status**: Rejected
**Rejected By**: User
**Reason**: Database schema is not defined
**Artifact**: docs/workflows/WA-123/architecture.md
**Details**: Stage rejected, awaiting corrections

---

## 2026-05-31T10:45:00Z - Architecture Stage

**Action**: Manual Edit
**Status**: InProgress
**Details**: User editing architecture artifact manually

---

## 2026-05-31T11:00:00Z - Architecture Stage

**Action**: Stage Approved
**Status**: Success
**Approved By**: User
**Artifact**: docs/workflows/WA-123/architecture.md
**Next Stage**: Planning

---
```

---

**Command**: reject v1.0
**Handler**: SDLC Orchestrator
**Action**: Keep at current stage, request changes
**Effect**: Workflow pauses at same stage until fixed
