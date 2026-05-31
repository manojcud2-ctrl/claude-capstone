---
name: status
description: "Display current workflow progress and status"
usage: "status"
---

# Status Command

## Purpose

Display comprehensive workflow status including completed stages, current stage, pending stages, artifact locations, and next actions needed.

## Usage

```
status
workflow status
check status
```

**Aliases**: `status`, `workflow status`, `progress`

## Parameters

None - displays status of active workflow

## Pre-conditions

- StateManager initialized with active workflow

If no workflow exists, displays:
```
No active workflow found.

To start a new workflow:
  start story <jira-id>

Example:
  start story WA-123
```

## Process

### Step 1: Check for Active Workflow

**Using StateManager API:**
```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

// Get active workflow ID
const storyId = await sm.getActiveStory();
if (!storyId) {
  console.log('No active workflow found');
  console.log('To start: start story <jira-id>');
  process.exit(0);
}
```

**Using CLI:**
```bash
# Check for active workflow
node .claude/skills/workflow-state-manager.js list | grep -q "Active Workflows" || {
  echo "No active workflow found"
  echo "To start: start story <jira-id>"
  exit 0
}
```

### Step 2: Read Workflow State

**Using StateManager API:**
```javascript
const workflow = await sm.getWorkflow(storyId);
const {
  jiraStoryId,
  storyTitle,
  storyType,
  currentStage,
  status,
  stages,
  createdAt,
  lastUpdated
} = workflow;
```

**Using CLI:**
```bash
# Use the progress command for quick status
node .claude/skills/workflow-state-manager.js progress

# Or read full state
WORKFLOW_JSON=$(node .claude/skills/workflow-state-manager.js read)
```

### Step 3: Calculate Progress

```javascript
const STAGE_NAMES = [
  'requirements', 'architecture', 'planning',
  'implementation', 'review', 'verification', 'pr'
];

const completedCount = STAGE_NAMES.filter(
  name => workflow.stages[name].status === 'completed'
).length;

const progressPercent = Math.round((completedCount / 7) * 100);
```

### Step 4: Determine Current Action

```bash
case "$STATUS" in
  "InProgress")
    ACTION="Agent running: ${CURRENT_STAGE}"
    ;;
  "WaitingForApproval")
    ACTION="Approve or reject ${CURRENT_STAGE}"
    ;;
  "Failed")
    ACTION="Fix error and retry"
    ;;
  "Completed")
    ACTION="Workflow complete - Create PR"
    ;;
esac
```

### Step 5: Display Status

```
╔═══════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                            ║
╚═══════════════════════════════════════════════════════════════╝

Story: {STORY_ID} - {STORY_TITLE}
Type: {STORY_TYPE}
Status: {STATUS}
Progress: [{PROGRESS_PERCENT}%] {COMPLETED}/{TOTAL} stages

Started: {STARTED_AT}
Last Updated: {LAST_UPDATED_AT}
Duration: {DURATION}

─────────────────────────────────────────────────────────────────

📋 STAGE PROGRESS:

✅ Completed Stages ({COUNT}):
  1. Requirements    ✓ Approved  → docs/workflows/{STORY_ID}/requirements.md
  2. Architecture    ✓ Approved  → docs/workflows/{STORY_ID}/architecture.md
  3. Planning        ✓ Approved  → docs/workflows/{STORY_ID}/impl-plan.md

→ Current Stage:
  4. Implementation  ⏳ {STATUS}  → docs/workflows/{STORY_ID}/implementation-report.md

⏱ Pending Stages ({COUNT}):
  5. Review          ⊗ Not Started
  6. Verification    ⊗ Not Started
  7. PR Package      ⊗ Not Started

─────────────────────────────────────────────────────────────────

📁 ARTIFACTS:

Generated:
  • docs/workflows/{STORY_ID}/requirements.md (✓)
  • docs/workflows/{STORY_ID}/architecture.md (✓)
  • docs/workflows/{STORY_ID}/impl-plan.md (✓)
  • docs/workflows/{STORY_ID}/implementation-report.md (⏳)

Pending:
  • docs/workflows/{STORY_ID}/review-report.md
  • docs/workflows/{STORY_ID}/verification-report.md
  • docs/workflows/{STORY_ID}/pr-description.md

State Files:
  • .claude/state/workflows/{STORY_ID}.json (workflow state)
  • .claude/state/index.json (active workflows index)
  • .artifacts/audit-log.md

─────────────────────────────────────────────────────────────────

🎯 NEXT ACTION:

{ACTION}

Commands:
  • approve              - Approve current stage and continue
  • reject [reason]      - Reject and request changes
  • view {stage}         - Display artifact contents
  • retry {stage}        - Re-run current stage agent
  • audit                - View complete audit log

─────────────────────────────────────────────────────────────────

Branch: {BRANCH_NAME if set, else "Not yet created"}

╚═══════════════════════════════════════════════════════════════╝
```

### Step 6: Display Stage-Specific Details

#### If Status = WaitingForApproval

```
⏸ APPROVAL REQUIRED

Stage: {CURRENT_STAGE}
Artifact: {ARTIFACT_PATH}

Review the artifact and decide:
  • "approve" - Proceed to next stage
  • "reject [reason]" - Request changes

Tip: Run "view {stage}" to see artifact contents
```

#### If Status = InProgress

```
⏳ AGENT RUNNING

Stage: {CURRENT_STAGE}
Activity: Generating {artifact type}

Please wait for agent completion...

Tip: Monitor progress in real-time
```

#### If Status = Failed

```
❌ WORKFLOW FAILED

Stage: {CURRENT_STAGE}
Error: {ERROR_MESSAGE if available}

Recovery Options:
  1. "retry {stage}" - Re-run failed agent
  2. Edit artifact manually and "approve"
  3. Check .artifacts/audit-log.md for details

Tip: Review error logs before retrying
```

#### If Status = Completed

```
🎉 WORKFLOW COMPLETED

All 7 stages completed successfully!

PR Package: docs/workflows/{STORY_ID}/pr-description.md

Next Steps:
  1. Review PR package
  2. Create pull request
  3. Share with reviewers

Tip: Use PR package contents for PR description
```

## Status Variations

### Minimal Status (Quick Check)

```
status --brief
```

Output:
```
Story: WA-123 | Stage: Implementation | Status: WaitingForApproval
Progress: 3/7 stages (43%)
Next: Approve or reject implementation
```

### Detailed Status with Artifacts

```
status --detailed
```

Includes:
- File sizes
- Last modified times
- Line counts
- Validation status

### Timeline Status

```
status --timeline
```

Shows:
- Duration per stage
- Total elapsed time
- Approval wait times
- Agent execution times

## Stage Status Indicators

```
✅ = Completed and Approved
→ = Current Stage
⏳ = In Progress
⏸ = Waiting for Approval
❌ = Failed
⊗ = Not Started
⚠️ = Warning/Issue
```

## Workflow States Explained

### InProgress

Agent is currently running for current stage. Wait for completion.

### WaitingForApproval

Artifact generated, awaiting human review and approval decision.

### Failed

Agent or validation failed. Review error, fix issue, retry.

### Completed

All 7 stages approved. PR package ready.

## Additional Information

### Duration Calculation

```
Started: 2026-05-31 10:00:00
Last Updated: 2026-05-31 14:30:00
Duration: 4 hours 30 minutes
```

### Stage Timing

If audit log exists, can show:
```
Stage Durations:
  Requirements: 15 min
  Architecture: 22 min
  Planning: 18 min
  Implementation: 2 hours 30 min (current)
```

### Approval Wait Times

```
Approval Gates:
  Requirements: Approved after 5 min
  Architecture: Approved after 12 min
  Planning: Approved after 3 min
  Implementation: Waiting... (30 min so far)
```

## Error Handling

### No Workflow Found

```
No active workflow found.

To start a new workflow:
  start story <jira-id>

Example:
  start story WA-123
```

### Corrupt State File

```
Error: Workflow state file is corrupted

File: .artifacts/workflow-state.json

Recovery Options:
  1. Restore from backup (if available)
  2. Manually fix JSON syntax
  3. Start new workflow

Tip: Check .artifacts/audit-log.md for last known good state
```

### Missing Artifacts

```
⚠️ Warning: Some artifacts are missing

Expected: .artifacts/WA-123-requirements.md
Status: Missing

This may indicate a workflow issue.

Options:
  • Retry the stage: retry requirements
  • Manually create artifact
  • Check audit log for errors
```

## Example Executions

### Active Workflow - Waiting for Approval

```
User: "status"

Output:
╔═══════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                            ║
╚═══════════════════════════════════════════════════════════════╝

Story: WA-123 - Add weather forecast endpoint
Type: Feature
Status: WaitingForApproval
Progress: [43%] 3/7 stages

Started: 2026-05-31 10:00:00
Last Updated: 2026-05-31 12:30:00
Duration: 2 hours 30 minutes

─────────────────────────────────────────────────────────────────

📋 STAGE PROGRESS:

✅ Completed Stages (3):
  1. Requirements    ✓ Approved
  2. Architecture    ✓ Approved
  3. Planning        ✓ Approved

→ Current Stage:
  4. Implementation  ⏸ WaitingForApproval

⏱ Pending Stages (3):
  5. Review          ⊗ Not Started
  6. Verification    ⊗ Not Started
  7. PR Package      ⊗ Not Started

─────────────────────────────────────────────────────────────────

🎯 NEXT ACTION:

Approve or reject Implementation

Commands:
  • approve              - Proceed to Review stage
  • reject [reason]      - Request changes
  • view implementation  - Display artifact
```

### Completed Workflow

```
User: "status"

Output:
╔═══════════════════════════════════════════════════════════════╗
║                    WORKFLOW STATUS                            ║
╚═══════════════════════════════════════════════════════════════╝

Story: WA-123 - Add weather forecast endpoint
Type: Feature
Status: ✅ Completed
Progress: [100%] 7/7 stages

Started: 2026-05-31 10:00:00
Completed: 2026-05-31 16:00:00
Duration: 6 hours

─────────────────────────────────────────────────────────────────

📋 ALL STAGES COMPLETED:

✅ 1. Requirements     ✓ Approved
✅ 2. Architecture     ✓ Approved
✅ 3. Planning         ✓ Approved
✅ 4. Implementation   ✓ Approved
✅ 5. Review           ✓ Approved
✅ 6. Verification     ✓ Approved
✅ 7. PR Package       ✓ Approved

─────────────────────────────────────────────────────────────────

🎉 WORKFLOW COMPLETE!

PR Package: .artifacts/WA-123-pr-package.md

Next Steps:
  1. Review PR package
  2. Create pull request using PR description
  3. Share with reviewers for approval

All artifacts available in: .artifacts/
```

### No Active Workflow

```
User: "status"

Output:
No active workflow found.

To start a new workflow:
  start story <jira-id>

Example:
  start story WA-123
```

## Integration with Other Commands

- `status` → see current stage → `approve` or `reject`
- `status` → see artifact path → `view {stage}`
- `status` → see failure → `retry {stage}`
- `status` → verify completion → create PR

## Use Cases

### Quick Progress Check

```
User: "How far are we?"
Assistant: [runs status command]
```

### After Long Break

```
User: "What stage were we at?"
Assistant: [runs status command]
```

### Before Approving

```
User: "Let me check the status before approving"
Assistant: [runs status command]
```

### After Error

```
User: "What went wrong?"
Assistant: [runs status command with error details]
```

---

**Command**: status v1.0
**Handler**: SDLC Orchestrator
**Output**: Comprehensive workflow progress display
**Frequency**: Can be run anytime without side effects
