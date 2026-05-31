---
name: workflow-state-manager
description: "Manage SDLC workflow state - read, update, validate, and initialize workflow state files"
---

# Workflow State Manager Skill

## Purpose

Reusable skill for managing workflow state operations across any Agentic SDLC workflow. Handles state file initialization, reading, updating, and validation.

## Usage

Invoke this skill whenever you need to:
- Initialize a new workflow state
- Read current workflow state
- Update workflow state fields
- Validate workflow state
- Check workflow status

## Operations

### 1. Initialize State

**Usage**: `workflow-state init <story-id> <story-title> [story-type]`

**Action**: Creates new workflow-state.json with initial values

**Example**:
```bash
workflow-state init WA-123 "Add weather endpoint" Feature
```

**Output**:
```json
{
  "version": "1.0",
  "storyId": "WA-123",
  "storyTitle": "Add weather endpoint",
  "storyType": "Feature",
  "currentStage": "Requirements",
  "status": "InProgress",
  "approvedStages": [],
  "startedAt": "2026-05-31T10:00:00Z",
  "lastUpdatedAt": "2026-05-31T10:00:00Z",
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

### 2. Read State

**Usage**: `workflow-state read [field]`

**Action**: Reads entire state or specific field

**Examples**:
```bash
workflow-state read                    # Returns entire state
workflow-state read currentStage       # Returns "Requirements"
workflow-state read status             # Returns "WaitingForApproval"
workflow-state read approvedStages     # Returns array
```

### 3. Update State

**Usage**: `workflow-state update <field> <value>`

**Action**: Updates specific field in state file

**Examples**:
```bash
workflow-state update status WaitingForApproval
workflow-state update currentStage Architecture
workflow-state update "artifacts.requirements" ".artifacts/WA-123-requirements.md"
workflow-state update branch "feature/WA-123-weather"
```

### 4. Append to Array

**Usage**: `workflow-state append <array-field> <value>`

**Action**: Adds value to array field (e.g., approvedStages)

**Example**:
```bash
workflow-state append approvedStages Requirements
workflow-state append approvedStages Architecture
```

### 5. Validate State

**Usage**: `workflow-state validate`

**Action**: Validates state file structure and values

**Checks**:
- File exists
- Valid JSON
- Required fields present
- Valid status values
- Valid stage names
- Timestamps valid

**Output**:
```
✅ Workflow state valid

Story: WA-123
Stage: Architecture
Status: WaitingForApproval
Approved: Requirements
```

**Or if invalid**:
```
❌ Workflow state invalid

Errors:
- Invalid status: "InvalidStatus" (must be InProgress|WaitingForApproval|Completed|Failed)
- Missing field: currentStage
```

### 6. Get Progress

**Usage**: `workflow-state progress`

**Action**: Calculates and returns workflow progress

**Output**:
```
Progress: 3/7 stages (43%)

Completed:
✅ Requirements
✅ Architecture
✅ Planning

Current:
→ Implementation

Pending:
⏱ Review
⏱ Verification
⏱ PR
```

### 7. Check Status

**Usage**: `workflow-state status`

**Action**: Returns current workflow status with context

**Output**:
```
Status: WaitingForApproval
Stage: Implementation
Action Required: Approve or reject Implementation
Last Updated: 2026-05-31T12:30:00Z
```

## Implementation

### State File Location

Default: `.artifacts/workflow-state.json`

Can be overridden with `WORKFLOW_STATE_PATH` environment variable.

### State Schema

```typescript
interface WorkflowState {
  version: string;
  storyId: string;
  storyTitle: string;
  storyType: "Feature" | "Bug" | "Enhancement" | "Task";
  currentStage: Stage;
  status: Status;
  approvedStages: Stage[];
  startedAt: string; // ISO timestamp
  lastUpdatedAt: string; // ISO timestamp
  artifacts: {
    requirements: string | null;
    architecture: string | null;
    plan: string | null;
    implementation: string | null;
    review: string | null;
    verification: string | null;
    pr: string | null;
  };
  branch: string | null;
}

type Stage = "Requirements" | "Architecture" | "Planning" | 
             "Implementation" | "Review" | "Verification" | "PR";

type Status = "InProgress" | "WaitingForApproval" | "Completed" | "Failed";
```

### Auto-Update Timestamp

Every update operation automatically updates `lastUpdatedAt` field.

### Atomic Operations

All write operations are atomic to prevent state corruption.

### Backup on Update

Before each update, creates backup: `.artifacts/workflow-state.json.backup`

## Error Handling

### File Not Found

```
Error: Workflow state not found
Location: .artifacts/workflow-state.json
Action: Initialize workflow with 'workflow-state init <story-id>'
```

### Invalid JSON

```
Error: Workflow state corrupted (invalid JSON)
Action: Restore from backup or reinitialize
Backup: .artifacts/workflow-state.json.backup
```

### Invalid Field

```
Error: Unknown field 'invalidField'
Valid fields: storyId, currentStage, status, approvedStages, artifacts, branch
```

### Invalid Value

```
Error: Invalid status 'BadStatus'
Valid values: InProgress, WaitingForApproval, Completed, Failed
```

## Usage in Orchestrator

```javascript
// Initialize workflow
Skill({ 
  skill: "workflow-state-manager",
  args: "init WA-123 'Add weather endpoint' Feature"
});

// Read current stage
const stage = Skill({
  skill: "workflow-state-manager",
  args: "read currentStage"
});

// Update status
Skill({
  skill: "workflow-state-manager",
  args: "update status WaitingForApproval"
});

// Add to approved stages
Skill({
  skill: "workflow-state-manager",
  args: "append approvedStages Requirements"
});

// Advance to next stage
Skill({
  skill: "workflow-state-manager",
  args: "update currentStage Architecture"
});

// Check progress
Skill({
  skill: "workflow-state-manager",
  args: "progress"
});
```

## Benefits

✅ **Reusable** - Use in any workflow  
✅ **Consistent** - Standardized state management  
✅ **Safe** - Validation and backups  
✅ **Simple** - Easy command interface  
✅ **Reliable** - Atomic operations  

## Extension Points

### Custom Stages

Add new stages by updating the Stage type and artifact map.

### Custom Fields

Add workflow-specific fields to state schema.

### Custom Validation

Add project-specific validation rules.

---

**Skill**: workflow-state-manager v1.0  
**Type**: Reusable utility  
**Compatible**: Any Agentic SDLC workflow
