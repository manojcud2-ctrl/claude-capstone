# Agentic SDLC Workflow - User Guide

## How to Use the Workflow System

This guide explains how to trigger, interact with, pause, resume, and manage the Agentic SDLC workflow.

---

## 📋 Table of Contents

1. [Starting a Workflow](#starting-a-workflow)
2. [Interacting at Approval Gates](#interacting-at-approval-gates)
3. [Checking Status](#checking-status)
4. [Pausing & Resuming](#pausing--resuming)
5. [Handling Rejections](#handling-rejections)
6. [Complete Workflow Example](#complete-workflow-example)
7. [Troubleshooting](#troubleshooting)

---

## Starting a Workflow

### Method 1: Using the start-story Command

```bash
# Basic usage
start story WA-123

# The system will:
# 1. Create workflow state (.claude/state/workflows/WA-123.json)
# 2. Set WA-123 as the active workflow
# 3. Create artifact directory (docs/workflows/WA-123/)
# 4. Fetch Jira story details (or prompt for manual input)
# 5. Invoke Requirements Agent
# 6. Pause at approval gate
```

**Output:**
```
✅ Requirements Stage Complete

Story: WA-123 - Add weather forecast endpoint

Artifact Generated:
docs/workflows/WA-123/requirements.md

Summary:
Extracted 3 business requirements, 8 functional requirements, 6 acceptance criteria

Generated: 2026-05-31T15:30:00.000Z

⏸ Workflow Paused - Awaiting Approval

Available Commands:
- approve              - Proceed to Architecture stage
- reject [reason]      - Request changes to requirements
- view requirements    - Display full requirements artifact
- status              - View workflow progress
```

### Method 2: Using CLI Tool Directly

```bash
# Initialize workflow
node .claude/skills/workflow-state-manager.js init WA-123 "Add weather feature" Feature

# Set as active
node .claude/skills/workflow-state-manager.js set-active WA-123

# Then manually invoke the orchestrator or agents
```

---

## Interacting at Approval Gates

The workflow pauses at each stage for human approval. You have 4 options:

### Option 1: Approve ✅

**Command:**
```bash
approve
# Or be explicit
approve requirements
```

**What happens:**
1. Current stage marked as 'completed'
2. Workflow advances to next stage
3. Next agent is invoked automatically
4. Pauses again at next approval gate

**Output:**
```
✅ Requirements Approved

Advancing to Architecture stage...

[Architecture Agent Running...]

✅ Architecture Stage Complete

Artifact: docs/workflows/WA-123/architecture.md

Summary:
Designed 5 components, 3 interfaces, identified 2 risks

⏸ Workflow Paused - Awaiting Approval

Commands: approve | reject | status
```

### Option 2: Reject ❌

**Command:**
```bash
reject
# Or with reason
reject - missing performance requirements
```

**What happens:**
1. Rejection comment added to stage
2. Stage status stays 'draft'
3. Workflow stays at current stage
4. User must fix issues and re-approve

**Output:**
```
❌ Requirements Rejected

Reason: missing performance requirements

Workflow remains at Requirements stage.

What to do next:

1. Edit artifact:
   docs/workflows/WA-123/requirements.md

2. Re-run requirements agent (optional):
   [Agent invocation command]

3. When ready, approve again:
   approve

Current status unchanged - still awaiting approval.
```

### Option 3: View Artifact 📄

```bash
view requirements
# Or
cat docs/workflows/WA-123/requirements.md
```

### Option 4: Check Status 📊

```bash
status
```

---

## Checking Status

### Quick Status Check

**Command:**
```bash
status
```

**Output:**
```
📊 Workflow Status: WA-123 - Add weather forecast endpoint

Progress: 3/7 stages (43%)

Completed Stages:
  ✅ 1. Requirements     → docs/workflows/WA-123/requirements.md
  ✅ 2. Architecture     → docs/workflows/WA-123/architecture.md
  ✅ 3. Planning         → docs/workflows/WA-123/impl-plan.md

Current Stage:
  → 4. Implementation (draft - awaiting approval)
     Artifact: docs/workflows/WA-123/implementation-report.md

Pending Stages:
  ⏱ 5. Review
  ⏱ 6. Verification
  ⏱ 7. PR

Next Action: approve | reject | view implementation

Started: 2026-05-31T10:00:00Z
Last Updated: 2026-05-31T14:30:00Z
```

### Detailed Progress Check

**Command:**
```bash
node .claude/skills/workflow-state-manager.js progress WA-123
```

**Output:**
```
Progress: 3/7 stages (43%)

Completed:
  ✅ requirements
  ✅ architecture
  ✅ planning

Current:
  → implementation

Pending:
  ⏱ review
  ⏱ verification
  ⏱ pr
```

### Full State Inspection

**Command:**
```bash
node .claude/skills/workflow-state-manager.js read
```

**Output:**
```json
{
  "jiraStoryId": "WA-123",
  "currentStage": "implementation",
  "status": "pending",
  "stages": {
    "requirements": {
      "status": "completed",
      "artifact": "docs/workflows/WA-123/requirements.md",
      "approvedAt": "2026-05-31T10:30:00Z"
    },
    ...
  }
}
```

---

## Pausing & Resuming

### Natural Pauses (Built-in)

**The workflow automatically pauses after each stage:**

```
Requirements Agent → ⏸ Pause (approval gate)
     ↓ approve
Architecture Agent → ⏸ Pause (approval gate)
     ↓ approve
Planning Agent → ⏸ Pause (approval gate)
     ↓ approve
... continues through all 7 stages
```

**Each pause:**
- Saves current state
- Displays artifact summary
- Waits for user command
- Can resume at any time (state is persisted)

### Manual Pause (Exit Session)

You can exit Claude Code at any approval gate:

1. The workflow state is saved in `.claude/state/workflows/WA-123.json`
2. Simply exit Claude Code (Ctrl+C or close)
3. The workflow remains paused at the current stage

### Resume from Pause

**To resume a paused workflow:**

```bash
# 1. Restart Claude Code
claude code

# 2. Check what workflows exist
node .claude/skills/workflow-state-manager.js list

# Output:
📋 Active Workflows:
  → WA-123 - implementation (pending)
    WA-124 - requirements (pending)

# 3. Set active workflow (if not already)
node .claude/skills/workflow-state-manager.js set-active WA-123

# 4. Check status
status

# 5. Continue with approve/reject
approve
```

**The workflow picks up exactly where it left off!**

---

## Handling Rejections

### When You Reject a Stage

**Scenario:** Requirements are incomplete

```bash
# At approval gate
reject - missing non-functional requirements
```

**What happens:**
```
❌ Requirements Rejected

Reason: missing non-functional requirements

The workflow is still at Requirements stage.
Artifact: docs/workflows/WA-123/requirements.md

Fix Options:

Option 1: Edit Manually
  1. Open: docs/workflows/WA-123/requirements.md
  2. Add missing requirements
  3. Save
  4. approve

Option 2: Re-run Agent
  1. [Invoke requirements agent again]
  2. Review new artifact
  3. approve

Option 3: Partial Fix
  1. Edit artifact manually
  2. Re-run agent for specific sections
  3. approve
```

### Fixing and Re-approving

**After fixing the artifact:**

```bash
# 1. Verify your changes
cat docs/workflows/WA-123/requirements.md

# 2. Check it looks good
status

# 3. Approve to continue
approve
```

**The workflow advances to the next stage.**

---

## Complete Workflow Example

### End-to-End Workflow Session

```bash
# ============================================
# Step 1: Start Workflow
# ============================================
$ start story WA-123

Initializing workflow for WA-123...
Fetching Jira story...
Invoking Requirements Agent...

✅ Requirements Stage Complete
Artifact: docs/workflows/WA-123/requirements.md
⏸ Paused - awaiting approval


# ============================================
# Step 2: Review Requirements
# ============================================
$ cat docs/workflows/WA-123/requirements.md

[... review content ...]

# Looks good!


# ============================================
# Step 3: Approve Requirements
# ============================================
$ approve

✅ Requirements Approved
Advancing to Architecture...
Invoking Architecture Agent...

✅ Architecture Stage Complete
Artifact: docs/workflows/WA-123/architecture.md
⏸ Paused - awaiting approval


# ============================================
# Step 4: Reject Architecture (Issue Found)
# ============================================
$ reject - missing database schema design

❌ Architecture Rejected
Reason: missing database schema design
Workflow remains at Architecture stage.


# ============================================
# Step 5: Fix Architecture
# ============================================
$ vim docs/workflows/WA-123/architecture.md

[... add database schema section ...]

$ approve

✅ Architecture Approved
Advancing to Planning...


# ============================================
# Step 6: Continue Through Stages
# ============================================
$ approve  # Planning
$ approve  # Implementation
$ approve  # Review
$ approve  # Verification
$ approve  # PR


# ============================================
# Step 7: Workflow Complete
# ============================================
🎉 Workflow Complete!

Story: WA-123 - Add weather forecast endpoint

All Stages Completed:
  ✅ Requirements
  ✅ Architecture
  ✅ Planning
  ✅ Implementation
  ✅ Review
  ✅ Verification
  ✅ PR

PR Created: https://github.com/user/repo/pull/123

All artifacts: docs/workflows/WA-123/

Archive workflow:
  node .claude/skills/workflow-state-manager.js archive WA-123
```

---

## Advanced Operations

### Multiple Workflows

**Work on multiple stories in parallel:**

```bash
# Start workflow 1
start story WA-123
approve
# ... paused at architecture

# Start workflow 2 (opens new session or switches)
start story WA-124
approve
# ... paused at architecture

# Switch between workflows
node .claude/skills/workflow-state-manager.js set-active WA-123
approve

node .claude/skills/workflow-state-manager.js set-active WA-124
approve

# List all active workflows
node .claude/skills/workflow-state-manager.js list
```

### View All Stages at Once

```bash
# Get complete workflow state
node .claude/skills/workflow-state-manager.js read | jq .

# View specific stage
node .claude/skills/workflow-state-manager.js read stages.requirements | jq .

# Check artifact path
node .claude/skills/workflow-state-manager.js read stages.requirements.artifact
```

### Archive Completed Workflows

```bash
# After workflow is complete
node .claude/skills/workflow-state-manager.js archive WA-123

# Moves to: .claude/state/archive/WA-123.json
# Removes from active workflows index
```

---

## Troubleshooting

### Workflow Stuck?

**Check current state:**
```bash
status
node .claude/skills/workflow-state-manager.js read
```

**Verify artifact exists:**
```bash
# Get artifact path from state
ARTIFACT=$(node .claude/skills/workflow-state-manager.js read stages.requirements.artifact | jq -r '.')
ls -la "$ARTIFACT"
```

### Lost Active Workflow?

**Set it again:**
```bash
node .claude/skills/workflow-state-manager.js list
node .claude/skills/workflow-state-manager.js set-active WA-123
```

### Agent Didn't Update State?

**Manually update stage:**
```bash
node .claude/skills/workflow-state-manager.js update-stage WA-123 requirements '{"status":"draft","artifact":"docs/workflows/WA-123/requirements.md","summary":"Requirements complete"}'
```

### Workflow State Corrupted?

**View backup:**
```bash
ls -la .claude/state/workflows/WA-123.json.backup
```

**Re-initialize if needed:**
```bash
# Backup current state
cp .claude/state/workflows/WA-123.json .claude/state/workflows/WA-123.json.broken

# Re-initialize
node .claude/skills/workflow-state-manager.js init WA-123 "Story Title" Feature
```

---

## Quick Reference

### Essential Commands

| Action | Command |
|--------|---------|
| **Start workflow** | `start story <jira-id>` |
| **Approve stage** | `approve` |
| **Reject stage** | `reject [reason]` |
| **Check status** | `status` |
| **View progress** | `node .claude/skills/workflow-state-manager.js progress` |
| **List workflows** | `node .claude/skills/workflow-state-manager.js list` |
| **Set active** | `node .claude/skills/workflow-state-manager.js set-active <id>` |
| **Archive** | `node .claude/skills/workflow-state-manager.js archive <id>` |

### Workflow States

| Stage Status | Meaning | Next Action |
|--------------|---------|-------------|
| `pending` | Not started | Wait for previous stage |
| `in_progress` | Agent running | Wait for completion |
| `draft` | Complete, awaiting approval | approve or reject |
| `completed` | Approved | Automatic (advances) |
| `failed` | Error occurred | Fix and retry |

### File Locations

| Type | Path |
|------|------|
| **Workflow state** | `.claude/state/workflows/{id}.json` |
| **Active index** | `.claude/state/index.json` |
| **Archive** | `.claude/state/archive/{id}.json` |
| **Artifacts** | `docs/workflows/{id}/*.md` |
| **Audit log** | `.artifacts/audit-log.md` |

---

## Summary

**The workflow is designed to be intuitive:**

1. ✅ **Start** with `start story <id>`
2. ⏸ **Pause** automatically at each approval gate
3. ✅ **Approve** to advance: `approve`
4. ❌ **Reject** to stay: `reject - reason`
5. 📊 **Status** anytime: `status`
6. 🔄 **Resume** from anywhere (state is persisted)
7. 🎉 **Complete** after all 7 stages approved

**State is always saved** - you can exit and resume at any time!

For more details, see:
- `COMMANDS-UPDATED.md` - Command documentation
- `AGENTS-UPDATED.md` - Agent behavior
- `INTEGRATION-COMPLETE.md` - Technical details
