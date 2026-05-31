---
name: audit-logger
description: "Manage SDLC workflow audit trail - log actions, decisions, and events with timestamps"
---

# Audit Logger Skill

## Purpose

Reusable skill for managing workflow audit trails across any Agentic SDLC workflow. Creates comprehensive, timestamped logs of all workflow actions and decisions.

## Usage

Invoke this skill whenever you need to:
- Log workflow actions
- Record approval/rejection decisions
- Track stage transitions
- Document errors and recoveries
- Query audit history

## Operations

### 1. Initialize Audit Log

**Usage**: `audit-logger init <story-id>`

**Action**: Creates new audit log file with header

**Example**:
```bash
audit-logger init WA-123
```

**Output**: Creates `.artifacts/audit-log.md`:
```markdown
# Audit Log - WA-123

## 2026-05-31T10:00:00Z - Workflow Initialization

**Action**: Workflow Started
**Status**: InProgress
**Story ID**: WA-123
**Initiated By**: User
**Details**: Agentic SDLC workflow initialized

---
```

### 2. Log Action

**Usage**: `audit-logger log <action> <status> [details]`

**Action**: Appends timestamped entry to audit log

**Example**:
```bash
audit-logger log "Agent Invoked" "InProgress" "Starting Requirements Agent for WA-123"
```

**Output**: Appends to log:
```markdown
## 2026-05-31T10:05:00Z - Requirements Stage

**Action**: Agent Invoked
**Status**: InProgress
**Details**: Starting Requirements Agent for WA-123

---
```

### 3. Log Approval

**Usage**: `audit-logger approve <stage> <artifact-path> [next-stage]`

**Action**: Logs stage approval with full context

**Example**:
```bash
audit-logger approve "Requirements" ".artifacts/WA-123-requirements.md" "Architecture"
```

**Output**:
```markdown
## 2026-05-31T10:30:00Z - Requirements Stage

**Action**: Stage Approved
**Status**: Success
**Approved By**: User
**Artifact**: .artifacts/WA-123-requirements.md
**Next Stage**: Architecture
**Duration**: 25 minutes

---
```

### 4. Log Rejection

**Usage**: `audit-logger reject <stage> <reason> <artifact-path>`

**Action**: Logs stage rejection with reason

**Example**:
```bash
audit-logger reject "Architecture" "Database schema not defined" ".artifacts/WA-123-architecture.md"
```

**Output**:
```markdown
## 2026-05-31T11:15:00Z - Architecture Stage

**Action**: Stage Rejected
**Status**: Rejected
**Rejected By**: User
**Reason**: Database schema not defined
**Artifact**: .artifacts/WA-123-architecture.md
**Details**: Stage rejected, awaiting corrections

---
```

### 5. Log Error

**Usage**: `audit-logger error <component> <error-message> [recovery-action]`

**Action**: Logs error with context and recovery info

**Example**:
```bash
audit-logger error "Planning Agent" "Agent failed to generate plan" "Retry agent invocation"
```

**Output**:
```markdown
## 2026-05-31T12:00:00Z - Error

**Component**: Planning Agent
**Error**: Agent failed to generate plan
**Severity**: High
**Recovery Action**: Retry agent invocation
**Status**: Failed

---
```

### 6. Log Agent Activity

**Usage**: `audit-logger agent <stage> <action> [status]`

**Action**: Logs agent invocation, completion, or failure

**Example**:
```bash
audit-logger agent "Implementation" "started"
audit-logger agent "Implementation" "completed" "Success"
audit-logger agent "Review" "failed" "Timeout"
```

**Output**:
```markdown
## 2026-05-31T13:00:00Z - Implementation Stage

**Action**: Agent Started
**Status**: InProgress
**Agent**: Implementation Agent
**Details**: Beginning code implementation

---

## 2026-05-31T15:30:00Z - Implementation Stage

**Action**: Agent Completed
**Status**: Success
**Agent**: Implementation Agent
**Duration**: 2 hours 30 minutes
**Artifact**: .artifacts/WA-123-implementation-summary.md

---
```

### 7. Log Custom Event

**Usage**: `audit-logger event <event-name> <description> [metadata]`

**Action**: Logs custom workflow event

**Example**:
```bash
audit-logger event "Manual Edit" "User edited architecture artifact manually"
```

**Output**:
```markdown
## 2026-05-31T11:45:00Z - Custom Event

**Event**: Manual Edit
**Description**: User edited architecture artifact manually
**Actor**: User

---
```

### 8. Query Audit Log

**Usage**: `audit-logger query <filter>`

**Action**: Searches audit log for matching entries

**Filters**:
- `stage:<stage-name>` - Filter by stage
- `action:<action>` - Filter by action
- `status:<status>` - Filter by status
- `date:<date>` - Filter by date

**Example**:
```bash
audit-logger query stage:Requirements
audit-logger query action:"Stage Rejected"
audit-logger query status:Failed
```

**Output**:
```
Found 3 matching entries:

1. 2026-05-31T10:05:00Z - Requirements Stage
   Action: Agent Invoked
   Status: InProgress

2. 2026-05-31T10:30:00Z - Requirements Stage
   Action: Agent Completed
   Status: Success

3. 2026-05-31T10:35:00Z - Requirements Stage
   Action: Stage Approved
   Status: Success
```

### 9. Get Timeline

**Usage**: `audit-logger timeline`

**Action**: Displays chronological workflow timeline

**Output**:
```
Workflow Timeline - WA-123

├─ 10:00 Workflow Started
│
├─ 10:05 Requirements Agent Started
├─ 10:30 Requirements Agent Completed (25 min)
├─ 10:35 Requirements Approved ✓
│
├─ 10:40 Architecture Agent Started
├─ 11:10 Architecture Agent Completed (30 min)
├─ 11:15 Architecture Rejected ✗
│
├─ 11:45 User Manual Edit
├─ 11:50 Architecture Approved ✓
│
├─ 11:55 Planning Agent Started
├─ 12:15 Planning Agent Completed (20 min)
└─ 12:20 Planning Approved ✓

Current: Planning Stage
Duration: 2 hours 20 minutes
```

### 10. Get Statistics

**Usage**: `audit-logger stats`

**Action**: Returns workflow statistics from audit log

**Output**:
```
Workflow Statistics - WA-123

Total Events: 24
Duration: 6 hours 15 minutes

Stages:
  Completed: 7
  In Progress: 0
  Failed: 0

Actions:
  Agent Invocations: 7
  Approvals: 7
  Rejections: 2
  Manual Edits: 3
  Errors: 1

Average Stage Duration: 53 minutes

Approval Rate: 77.8% (7 approved, 2 rejected)

Longest Stage: Implementation (2h 30m)
Shortest Stage: PR (15m)
```

## Log Entry Format

### Standard Entry

```markdown
## {ISO Timestamp} - {Stage/Context}

**Action**: {Action Name}
**Status**: {Status}
**Details**: {Additional context}

---
```

### Approval Entry

```markdown
## {ISO Timestamp} - {Stage} Stage

**Action**: Stage Approved
**Status**: Success
**Approved By**: {User/System}
**Artifact**: {Artifact Path}
**Next Stage**: {Next Stage Name}
**Duration**: {Stage Duration}

---
```

### Rejection Entry

```markdown
## {ISO Timestamp} - {Stage} Stage

**Action**: Stage Rejected
**Status**: Rejected
**Rejected By**: {User}
**Reason**: {Rejection Reason}
**Artifact**: {Artifact Path}
**Details**: Stage rejected, awaiting corrections

---
```

### Error Entry

```markdown
## {ISO Timestamp} - Error

**Component**: {Component Name}
**Error**: {Error Message}
**Severity**: {High|Medium|Low}
**Recovery Action**: {Action Taken}
**Status**: Failed

---
```

## Implementation

### Log File Location

Default: `.artifacts/audit-log.md`

Can be overridden with `AUDIT_LOG_PATH` environment variable.

### Timestamps

All timestamps in ISO 8601 format (UTC):
```
2026-05-31T10:30:00Z
```

### Auto-Duration

Automatically calculates duration for:
- Stage completion (from start to end)
- Agent execution (from invoke to complete)
- Approval wait time (from artifact ready to approval)

### Structured Format

Markdown format for human readability, parseable for analytics.

## Error Handling

### File Not Found

```
Error: Audit log not found
Location: .artifacts/audit-log.md
Action: Initialize with 'audit-logger init <story-id>'
```

### Write Permission

```
Error: Cannot write to audit log
Location: .artifacts/audit-log.md
Permissions: Read-only
Action: Check file permissions
```

### Corrupted Log

```
Warning: Audit log may be corrupted
Issue: Unexpected format at line 45
Action: Manual review recommended
```

## Usage in Orchestrator

```javascript
// Initialize at workflow start
Skill({
  skill: "audit-logger",
  args: "init WA-123"
});

// Log agent invocation
Skill({
  skill: "audit-logger",
  args: "agent Requirements started"
});

// Log agent completion
Skill({
  skill: "audit-logger",
  args: "agent Requirements completed Success"
});

// Log approval
Skill({
  skill: "audit-logger",
  args: "approve Requirements .artifacts/WA-123-requirements.md Architecture"
});

// Log rejection
Skill({
  skill: "audit-logger",
  args: "reject Architecture 'Missing database design' .artifacts/WA-123-architecture.md"
});

// Log error
Skill({
  skill: "audit-logger",
  args: "error 'Planning Agent' 'Timeout after 5 minutes' 'Retry with longer timeout'"
});

// Get timeline
Skill({
  skill: "audit-logger",
  args: "timeline"
});

// Get statistics
Skill({
  skill: "audit-logger",
  args: "stats"
});
```

## Benefits

✅ **Complete History** - Full record of all workflow actions  
✅ **Compliance** - Audit trail for regulatory requirements  
✅ **Debugging** - Trace issues and decisions  
✅ **Analytics** - Extract workflow metrics  
✅ **Transparency** - Clear accountability  

## Analytics Integration

### Export to JSON

```bash
audit-logger export json > workflow-metrics.json
```

### Export to CSV

```bash
audit-logger export csv > workflow-timeline.csv
```

### Generate Report

```bash
audit-logger report > workflow-report.md
```

## Extension Points

### Custom Log Formatters

Define custom formats for specific events.

### Integrations

Send logs to external systems (Slack, email, monitoring tools).

### Log Rotation

Archive old logs after workflow completion.

---

**Skill**: audit-logger v1.0  
**Type**: Reusable utility  
**Compatible**: Any Agentic SDLC workflow
