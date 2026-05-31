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
- `start story PMX-123`
- `start story PROJ-456`
- `start story WX-789`

## Parameters

- **jira-id**: Jira story identifier in format `{PROJECT}-{NUMBER}`
  - Must match pattern: 2-6 uppercase letters, dash, 1-6 digits
  - Examples: `PMX-123`, `WEATHER-42`, `API-1`

## Pre-conditions

- No existing workflow for this story ID (check `.artifacts/workflow-state.json`)
- User has necessary permissions
- Jira story exists (or user can provide manual input)

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

```bash
# Check if workflow already exists
if [ -f ".artifacts/workflow-state.json" ]; then
  EXISTING_ID=$(jq -r '.storyId' .artifacts/workflow-state.json)
  if [ "$EXISTING_ID" == "$STORY_ID" ]; then
    echo "Error: Workflow already exists for $STORY_ID"
    echo "Use 'status' to check progress or 'resume' to continue"
    exit 1
  fi
fi
```

### Step 3: Create Artifacts Directory

```bash
mkdir -p .artifacts
```

### Step 4: Initialize Workflow State

Create `.artifacts/workflow-state.json`:

```json
{
  "version": "1.0",
  "storyId": "{STORY_ID}",
  "storyTitle": "",
  "storyType": "",
  "currentStage": "Requirements",
  "status": "InProgress",
  "approvedStages": [],
  "startedAt": "{ISO_TIMESTAMP}",
  "lastUpdatedAt": "{ISO_TIMESTAMP}",
  "artifacts": {
    "requirements": null,
    "architecture": null,
    "plan": null,
    "implementation": null,
    "review": null,
    "verification": null,
    "pr": null
  },
  "branch": null
}
```

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

```javascript
Agent({
  description: "Requirements stage for {STORY_ID}",
  subagent_type: "general-purpose",
  prompt: `You are the Requirements Agent for the Agentic SDLC workflow.

Story ID: ${STORY_ID}
Story Title: ${STORY_TITLE}
Story Type: ${STORY_TYPE}

Story Description:
${STORY_DESCRIPTION}

Acceptance Criteria:
${STORY_ACCEPTANCE_CRITERIA}

Your task: Extract and document comprehensive requirements.

Follow the instructions in .claude/agents/requirements-agent.md

Output: Create .artifacts/${STORY_ID}-requirements.md with complete requirements specification.`
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
# Check artifact created
if [ ! -f ".artifacts/${STORY_ID}-requirements.md" ]; then
  echo "Error: Requirements artifact not created"
  exit 1
fi

# Check artifact not empty
if [ ! -s ".artifacts/${STORY_ID}-requirements.md" ]; then
  echo "Error: Requirements artifact is empty"
  exit 1
fi

# Check required sections present
REQUIRED_SECTIONS=("Business Requirements" "Functional Requirements" "Acceptance Criteria")
for section in "${REQUIRED_SECTIONS[@]}"; do
  if ! grep -q "## $section" ".artifacts/${STORY_ID}-requirements.md"; then
    echo "Warning: Missing section: $section"
  fi
done
```

### Step 12: Update Workflow State

Update `.artifacts/workflow-state.json`:

```json
{
  ...
  "storyTitle": "{FETCHED_TITLE}",
  "storyType": "{FETCHED_TYPE}",
  "status": "WaitingForApproval",
  "lastUpdatedAt": "{ISO_TIMESTAMP}",
  "artifacts": {
    "requirements": ".artifacts/{STORY_ID}-requirements.md",
    ...
  }
}
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

```
✅ Requirements Stage Complete

Story: {STORY_ID} - {TITLE}

Artifact Generated:
.artifacts/{STORY_ID}-requirements.md

Summary:
- {Count} Business Requirements identified
- {Count} Functional Requirements defined
- {Count} Non-Functional Requirements specified
- {Count} Acceptance Criteria created
- {Count} Open Questions flagged

Key Highlights:
- {Highlight 1}
- {Highlight 2}
- {Highlight 3}

⏸ Workflow Paused - Awaiting Approval

Available Commands:
- "approve" or "approve requirements" - Proceed to Architecture stage
- "reject [reason]" - Request changes to requirements
- "view requirements" - Display full requirements artifact
- "status" - View workflow progress
```

### Step 15: Wait for Approval

Workflow pauses at approval gate. Orchestrator waits for user command:
- `approve` → Proceed to Architecture stage
- `reject` → Stay in Requirements stage, await fixes
- `view requirements` → Display artifact, then wait again
- `status` → Show workflow status, then wait again

## Post-conditions

- ✅ `.artifacts/` directory created
- ✅ `workflow-state.json` initialized
- ✅ `audit-log.md` initialized
- ✅ Requirements artifact generated
- ✅ Workflow state = WaitingForApproval
- ✅ Current stage = Requirements
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
User: "start story PMX-123"

Orchestrator:
[Creates .artifacts/]
[Initializes workflow-state.json]
[Initializes audit-log.md]
[Fetches PMX-123 details from Jira]
[Invokes Requirements Agent]
[Waits for agent completion]
[Validates artifact]
[Updates state]

Output:
✅ Requirements Stage Complete

Story: PMX-123 - Add weather forecast endpoint

Artifact: .artifacts/PMX-123-requirements.md

Summary:
- 3 Business Requirements identified
- 8 Functional Requirements defined
- 5 Non-Functional Requirements specified
- 6 Acceptance Criteria created
- 2 Open Questions flagged

⏸ Workflow Paused - Awaiting Approval

Commands: approve | reject | view requirements | status
```

---

**Command**: start-story v1.0
**Handler**: SDLC Orchestrator
**Stage**: Initialization → Requirements
**Gate**: Approval required after Requirements
