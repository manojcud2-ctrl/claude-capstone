---
name: start-story
description: "Initialize Agentic SDLC workflow for a Jira story"
usage: "start story <jira-id>"
---

# Start Story Command

## Purpose

Initialize the Agentic SDLC workflow for a new Jira story, setting up the workflow state, artifacts directory, and beginning the Requirements stage.

## Usage

```
start story <jira-id>
```

**Examples**:
- `start story WA-123`
- `start story WA-456`
- `start story WX-789`

## Parameters

- **jira-id**: Jira story identifier in format `{PROJECT}-{NUMBER}`
  - Must match pattern: 2-6 uppercase letters, dash, 1-6 digits
  - Examples: `WA-123`, `WA-42`, `API-1`

## Pre-conditions

- No existing workflow for this story ID (check via StateManager)
- User has necessary permissions
- Jira story exists (or user can provide manual input)
- StateManager initialized (`.claude/state/` directory)

## Process

### Step 1: Validate Input

```bash
# Check story ID format
if [[ ! $STORY_ID =~ ^[A-Z]{2,6}-[0-9]{1,6}$ ]]; then
  echo "Error: Invalid Jira ID format"
  echo "Expected format: PROJECT-123"
  exit 1
fi
```

### Step 2: Check for Existing Workflow

**Using StateManager API:**
```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

// Check if workflow exists
const existing = await sm.getWorkflow(STORY_ID);
if (existing) {
  console.error(`Error: Workflow already exists for ${STORY_ID}`);
  console.log("Use 'status' to check progress or 'resume' to continue");
  process.exit(1);
}
```

**Using CLI Tool:**
```bash
# Check if workflow exists
if node .claude/skills/workflow-state-manager.js read 2>/dev/null | grep -q "$STORY_ID"; then
  echo "Error: Workflow already exists for $STORY_ID"
  echo "Use 'status' to check progress"
  exit 1
fi
```

### Step 3: Create Workflow Directories

```bash
# StateManager creates these automatically, but can pre-create
mkdir -p docs/workflows/${STORY_ID}
mkdir -p .artifacts  # For audit logs
```

### Step 4: Initialize Workflow State

**Using StateManager API:**
```javascript
// Create workflow with StateManager
const workflow = await sm.createWorkflow(STORY_ID, 'requirements');

// Update with story details
await sm.updateWorkflow(STORY_ID, {
  storyTitle: STORY_TITLE,
  storyType: STORY_TYPE
});

// Set as active workflow
await sm.setActiveStory(STORY_ID);
```

**Using CLI Tool:**
```bash
# Initialize workflow
node .claude/skills/workflow-state-manager.js init "$STORY_ID" "$STORY_TITLE" "$STORY_TYPE"

# Set as active
node .claude/skills/workflow-state-manager.js set-active "$STORY_ID"
```

**Created structure:**
- `.claude/state/workflows/${STORY_ID}.json` - Workflow state
- `.claude/state/index.json` - Active workflows index
- `docs/workflows/${STORY_ID}/` - Artifact directory

### Step 5: Initialize Audit Log

Create `.artifacts/audit-log.md`:

```markdown
# Audit Log - {STORY_ID}

## {ISO_TIMESTAMP} - Workflow Initialization

**Action**: Workflow Started
**Status**: InProgress
**Story ID**: {STORY_ID}
**Initiated By**: User
**Details**: Agentic SDLC workflow initialized for story {STORY_ID}

---
```

### Step 6: Fetch Jira Story (or Accept Manual Input)

**Option A: Jira API Available**

```bash
# Attempt to fetch story via Jira API or gh integration
STORY_DATA=$(fetch_jira_story "$STORY_ID")
```

**Option B: Manual Input**

```
Unable to fetch Jira story automatically.

Please provide story details:

Title: [User enters title]
Type: [Feature/Bug/Enhancement/Task]
Description: [User enters description]
Acceptance Criteria: [User enters criteria]
```

### Step 7: Log Story Fetch

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - Story Fetch

**Action**: Story Information Retrieved
**Status**: Success
**Source**: {Jira API | Manual Input}
**Details**: Story details obtained for {STORY_ID}

---
```

### Step 8: Invoke Requirements Agent

**Update state before invocation:**
```javascript
await sm.updateStage(STORY_ID, 'requirements', {
  status: 'in_progress',
  generatedAt: new Date().toISOString()
});
```

**Invoke agent:**
```javascript
Agent({
  description: `Requirements stage for ${STORY_ID}`,
  subagent_type: "requirements-agent",
  prompt: `You are the Requirements Agent for the Agentic SDLC workflow.

Story ID: ${STORY_ID}
Story Title: ${STORY_TITLE}
Story Type: ${STORY_TYPE}

Story Description:
${STORY_DESCRIPTION}

Acceptance Criteria:
${STORY_ACCEPTANCE_CRITERIA}

State Management:
- Use StateManager: const sm = require('./.claude/state/StateManager');
- Workflow state: .claude/state/workflows/${STORY_ID}.json
- Update stage status as you progress

Your task: Extract and document comprehensive requirements.

Follow the instructions in .claude/agents/requirements-agent.md

Output: Create docs/workflows/${STORY_ID}/requirements.md

After completion, update state:
await sm.updateStage('${STORY_ID}', 'requirements', {
  status: 'draft',
  artifact: 'docs/workflows/${STORY_ID}/requirements.md',
  summary: 'Brief summary of requirements',
  generatedAt: new Date().toISOString()
});`
})
```

### Step 9: Log Agent Invocation

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - Requirements Stage

**Action**: Requirements Agent Invoked
**Status**: InProgress
**Details**: Starting requirements analysis for {STORY_ID}

---
```

### Step 10: Wait for Agent Completion

Monitor agent execution until complete or failed.

### Step 11: Validate Requirements Artifact

```bash
# Get artifact path from state
ARTIFACT_PATH=$(node .claude/skills/workflow-state-manager.js read stages.requirements.artifact | jq -r '.')

# Check artifact created
if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "Error: Requirements artifact not created at $ARTIFACT_PATH"
  exit 1
fi

# Check artifact not empty
if [ ! -s "$ARTIFACT_PATH" ]; then
  echo "Error: Requirements artifact is empty"
  exit 1
fi

# Check required sections present
REQUIRED_SECTIONS=("Business Requirements" "Functional Requirements" "Acceptance Criteria")
for section in "${REQUIRED_SECTIONS[@]}"; do
  if ! grep -q "## $section" "$ARTIFACT_PATH"; then
    echo "Warning: Missing section: $section"
  fi
done
```

### Step 12: Update Workflow State

**The agent should have already updated the state to 'draft'. Verify and set to waiting:**

```javascript
// Verify stage status
const workflow = await sm.getWorkflow(STORY_ID);
if (workflow.stages.requirements.status !== 'draft') {
  throw new Error('Requirements stage not marked as draft');
}

// Set workflow to waiting for approval
await sm.updateWorkflow(STORY_ID, {
  status: 'pending'  // or 'waiting_for_approval' depending on convention
});
```

**Using CLI:**
```bash
# Verify stage complete
STATUS=$(node .claude/skills/workflow-state-manager.js read stages.requirements.status | jq -r '.')
if [ "$STATUS" != "draft" ]; then
  echo "Error: Requirements not complete (status: $STATUS)"
  exit 1
fi
```

### Step 13: Log Agent Completion

Append to `.artifacts/audit-log.md`:

```markdown
## {ISO_TIMESTAMP} - Requirements Stage

**Action**: Requirements Agent Completed
**Status**: Success
**Artifact**: .artifacts/{STORY_ID}-requirements.md
**Details**: Requirements specification generated successfully

---
```

### Step 14: Display Requirements Summary

**Read summary from state:**
```javascript
const workflow = await sm.getWorkflow(STORY_ID);
const reqStage = workflow.stages.requirements;
```

**Display:**
```
✅ Requirements Stage Complete

Story: {STORY_ID} - {TITLE}

Artifact Generated:
docs/workflows/{STORY_ID}/requirements.md

Summary:
{reqStage.summary}

Generated: {reqStage.generatedAt}

⏸ Workflow Paused - Awaiting Approval

Available Commands:
- "approve" or "approve requirements" - Proceed to Architecture stage
- "reject [reason]" - Request changes to requirements
- "view requirements" - Display full requirements artifact
- "status" - View workflow progress

Check state:
  node .claude/skills/workflow-state-manager.js progress {STORY_ID}
```

### Step 15: Wait for Approval

Workflow pauses at approval gate. Orchestrator waits for user command:
- `approve` → Proceed to Architecture stage
- `reject` → Stay in Requirements stage, await fixes
- `view requirements` → Display artifact, then wait again
- `status` → Show workflow status, then wait again

## Post-conditions

- ✅ `.claude/state/workflows/${STORY_ID}.json` created (workflow state)
- ✅ `.claude/state/index.json` updated (active workflow)
- ✅ `docs/workflows/${STORY_ID}/` directory created
- ✅ `docs/workflows/${STORY_ID}/requirements.md` generated
- ✅ `.artifacts/audit-log.md` initialized
- ✅ Workflow status = pending (awaiting approval)
- ✅ Current stage = requirements, status = draft
- ✅ User informed and awaiting approval decision

## Error Handling

### Error: Invalid Jira ID Format

**Message**: "Invalid Jira ID format. Expected format: PROJECT-123"

**Resolution**: Prompt user to provide correct format

### Error: Workflow Already Exists

**Message**: "Workflow already exists for {STORY_ID}. Use 'status' or 'resume'"

**Resolution**: User should check existing workflow status

### Error: Cannot Fetch Jira Story

**Message**: "Unable to fetch Jira story. Please provide details manually."

**Resolution**: Collect story information from user input

### Error: Requirements Agent Failed

**Message**: "Requirements Agent failed: {error details}"

**Resolution**: Offer to retry or allow manual artifact creation

### Error: Invalid Requirements Artifact

**Message**: "Requirements artifact validation failed: {specific issues}"

**Resolution**: Retry agent or allow manual editing

## Success Criteria

- Story ID validated
- Workflow state initialized
- Audit log started
- Requirements artifact created and valid
- User presented with approval gate
- System waiting for user decision

## Example Execution

```
User: "start story WA-123"

Orchestrator:
[Initializes StateManager]
[Creates workflow via sm.createWorkflow('WA-123')]
[Sets as active via sm.setActiveStory('WA-123')]
[Creates docs/workflows/WA-123/ directory]
[Initializes audit-log.md]
[Fetches WA-123 details from Jira]
[Updates stage status to in_progress]
[Invokes Requirements Agent with StateManager context]
[Agent creates docs/workflows/WA-123/requirements.md]
[Agent updates stage to draft with summary]
[Validates artifact]
[Sets workflow to pending approval]

Output:
✅ Requirements Stage Complete

Story: WA-123 - Add weather forecast endpoint

Artifact: docs/workflows/WA-123/requirements.md

Summary:
Extracted 3 business requirements, 8 functional requirements, 6 acceptance criteria

Generated: 2026-05-31T15:30:00.000Z

⏸ Workflow Paused - Awaiting Approval

Commands: approve | reject | view requirements | status

Check progress:
  node .claude/skills/workflow-state-manager.js progress WA-123
```

---

**Command**: start-story v1.0
**Handler**: SDLC Orchestrator
**Stage**: Initialization → Requirements
**Gate**: Approval required after Requirements
