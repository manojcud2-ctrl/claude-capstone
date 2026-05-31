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

- Workflow exists in StateManager (`.claude/state/workflows/{storyId}.json`)
- Current stage status is `draft` (awaiting approval)
- Current stage artifact exists and is valid
- User has reviewed the artifact

## Process

### Step 1: Read Workflow State

**Using StateManager API:**
```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

// Get active workflow
const storyId = await sm.getActiveStory();
if (!storyId) {
  throw new Error('No active workflow. Use: start-story <id>');
}

const workflow = await sm.getWorkflow(storyId);
const currentStage = workflow.currentStage;
const stageStatus = workflow.stages[currentStage].status;
const artifact = workflow.stages[currentStage].artifact;
```

**Using CLI:**
```bash
# Get active workflow
STORY_ID=$(node .claude/skills/workflow-state-manager.js read | jq -r '.jiraStoryId')

# Get current stage
CURRENT_STAGE=$(node .claude/skills/workflow-state-manager.js read currentStage | jq -r '.')

# Get stage status
STAGE_STATUS=$(node .claude/skills/workflow-state-manager.js read stages.${CURRENT_STAGE}.status | jq -r '.')
```

### Step 2: Validate Stage Status

```javascript
// Check stage is ready for approval
if (stageStatus !== 'draft') {
  throw new Error(`Stage ${currentStage} is not ready for approval (status: ${stageStatus})`);
}
```

**CLI:**
```bash
if [ "$STAGE_STATUS" != "draft" ]; then
  echo "Error: Stage $CURRENT_STAGE is not ready (status: $STAGE_STATUS)"
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

```javascript
const artifactPath = workflow.stages[currentStage].artifact;

// Check exists
const fs = require('fs').promises;
try {
  const stats = await fs.stat(artifactPath);
  if (stats.size === 0) {
    throw new Error(`Artifact is empty: ${artifactPath}`);
  }
} catch (error) {
  throw new Error(`Artifact missing or invalid: ${artifactPath}`);
}
```

**CLI:**
```bash
ARTIFACT_PATH=$(node .claude/skills/workflow-state-manager.js read stages.${CURRENT_STAGE}.artifact | jq -r '.')

if [ ! -f "$ARTIFACT_PATH" ] || [ ! -s "$ARTIFACT_PATH" ]; then
  echo "Error: Artifact missing or empty: $ARTIFACT_PATH"
  exit 1
fi
```

### Step 5: Approve Current Stage

**Mark stage as completed:**
```javascript
await sm.updateStage(storyId, currentStage, {
  status: 'completed',
  approvedAt: new Date().toISOString()
});
```

**CLI:**
```bash
node .claude/skills/workflow-state-manager.js update-stage "$STORY_ID" "$CURRENT_STAGE" '{"status":"completed","approvedAt":"'$(date -Iseconds)'"}'
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
requirements → architecture → planning → implementation → 
review → verification → pr → [COMPLETE]
```

```javascript
const STAGE_SEQUENCE = [
  'requirements', 'architecture', 'planning', 'implementation',
  'review', 'verification', 'pr'
];

const currentIndex = STAGE_SEQUENCE.indexOf(currentStage);
const nextStage = STAGE_SEQUENCE[currentIndex + 1] || null;
```

### Step 8A: If Next Stage Exists - Invoke Agent

**Update workflow to next stage:**
```javascript
if (nextStage) {
  // Advance workflow
  await sm.updateWorkflow(storyId, {
    currentStage: nextStage,
    status: 'in_progress'
  });
  
  // Update next stage status
  await sm.updateStage(storyId, nextStage, {
    status: 'in_progress',
    generatedAt: new Date().toISOString()
  });
  
  // Invoke agent
  await invokeStageAgent(nextStage, storyId, workflow);
}
```

**CLI:**
```bash
# Get next stage
NEXT_STAGE=$(get_next_stage "$CURRENT_STAGE")

if [ -n "$NEXT_STAGE" ] && [ "$NEXT_STAGE" != "COMPLETE" ]; then
  # Advance workflow
  node .claude/skills/workflow-state-manager.js update currentStage "$NEXT_STAGE"
  node .claude/skills/workflow-state-manager.js update status in_progress
  
  # Invoke agent
  invoke_agent "$NEXT_STAGE" "$STORY_ID"
fi
```

**Agent Invocation Pattern** (all stages):

```javascript
Agent({
  description: `${stageName} stage for ${storyId}`,
  subagent_type: `${stageName}-agent`,
  prompt: `You are the ${stageName} Agent for Agentic SDLC.

Story ID: ${storyId}
Current Stage: ${stageName}

State Management:
- Use: const sm = require('./.claude/state/StateManager');
- Workflow: .claude/state/workflows/${storyId}.json
- Read previous artifacts from workflow.stages

Previous artifacts available:
${JSON.stringify(getPreviousArtifacts(workflow, stageName), null, 2)}

Your task: Follow .claude/agents/${stageName}-agent.md

Output: docs/workflows/${storyId}/${stageName}.md

After completion, update state:
await sm.updateStage('${storyId}', '${stageName}', {
  status: 'draft',
  artifact: 'docs/workflows/${storyId}/${stageName}.md',
  summary: 'Brief summary',
  generatedAt: new Date().toISOString()
});`
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

### Step 11: Verify Next Stage Completion

**Agent should have updated the stage status to 'draft':**
```javascript
// Refresh workflow state
const updatedWorkflow = await sm.getWorkflow(storyId);
const nextStageData = updatedWorkflow.stages[nextStage];

if (nextStageData.status !== 'draft') {
  console.warn(`Warning: ${nextStage} stage status is ${nextStageData.status}, expected draft`);
}

// Verify artifact exists
if (!nextStageData.artifact) {
  throw new Error(`${nextStage} artifact not set in state`);
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

```javascript
if (!nextStage) {
  // Mark workflow as completed
  await sm.updateWorkflow(storyId, {
    status: 'completed'
  });
  
  // Optionally archive
  // await sm.archiveWorkflow(storyId);
  
  console.log('✨ Workflow Complete!');
}
```

**CLI:**
```bash
if [ "$NEXT_STAGE" == "COMPLETE" ]; then
  # Mark complete
  node .claude/skills/workflow-state-manager.js update status completed
  
  echo "✨ Workflow Complete!"
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
- ✅ Current stage status set to 'completed'
- ✅ Workflow currentStage advanced to next stage
- ✅ Next stage status set to 'in_progress'
- ✅ Next stage agent invoked with StateManager context
- ✅ Agent updates stage to 'draft' with artifact path
- ✅ Workflow status remains 'in_progress' (or 'pending' for approval)
- ✅ User presented with next approval gate

### If Workflow Completed:
- ✅ Workflow status set to 'completed'
- ✅ All 7 stages status = 'completed'
- ✅ All artifacts in docs/workflows/{id}/
- ✅ PR created and documented
- ✅ Ready for archival via sm.archiveWorkflow()

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
