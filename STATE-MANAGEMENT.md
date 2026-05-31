# State Management - File-Per-Workflow Architecture

## 🎯 Overview

The orchestrator uses a **file-per-workflow approach** with an active workflows index for scalability:
- Individual workflow files: `.claude/state/workflows/{storyId}.json`
- Active workflows index: `.claude/state/index.json`
- Archive folder for completed workflows: `.claude/state/archive/`

## 📁 Directory Structure

```
.claude/
└── state/
    ├── index.json              # Active workflows index
    ├── workflows/
    │   ├── WA-46.json         # Individual workflow state
    │   ├── WA-47.json
    │   └── WA-48.json
    └── archive/                # Completed/closed workflows
        ├── WA-45.json
        └── WA-44.json
```

---

## 📄 File Formats

### Index File (`.claude/state/index.json`)

Tracks only active workflows for fast lookups:

```json
{
  "version": 2,
  "activeStoryId": "WA-46",
  "lastUpdated": "2026-05-31T10:00:00.000Z",
  "activeWorkflows": [
    {
      "jiraStoryId": "WA-46",
      "currentStage": "planning",
      "status": "in_progress",
      "lastUpdated": "2026-05-31T10:00:00.000Z"
    },
    {
      "jiraStoryId": "WA-47",
      "currentStage": "requirements",
      "status": "draft",
      "lastUpdated": "2026-05-31T09:00:00.000Z"
    }
  ]
}
```

### Workflow File (`.claude/state/workflows/WA-46.json`)

Complete workflow state stored independently:

```json
{
  "jiraStoryId": "WA-46",
  "currentStage": "planning",
  "status": "in_progress",
  "createdAt": "2026-05-30T18:45:00.000Z",
  "lastUpdated": "2026-05-31T10:00:00.000Z",
  "stages": {
    "requirements": {
      "status": "completed",
      "artifact": "docs/workflows/WA-46/requirements.md",
      "comments": [],
      "generatedAt": "2026-05-30T18:45:00.000Z",
      "approvedAt": "2026-05-30T19:00:00.000Z",
      "summary": "Draft requirements captured for optional city filtering."
    },
    "architecture": {
      "status": "completed",
      "artifact": "docs/workflows/WA-46/architecture.md",
      "comments": [],
      "generatedAt": "2026-05-30T19:15:00.000Z",
      "approvedAt": "2026-05-30T20:00:00.000Z",
      "summary": "Architecture design approved."
    },
    "planning": {
      "status": "in_progress",
      "artifact": "docs/workflows/WA-46/impl-plan.md",
      "comments": [],
      "generatedAt": "2026-05-31T10:00:00.000Z",
      "approvedAt": null,
      "summary": "Implementation plan being reviewed."
    },
    "implementation": {
      "status": "pending",
      "artifact": null,
      "comments": [],
      "generatedAt": null,
      "approvedAt": null,
      "summary": ""
    },
    "review": { "status": "pending", "artifact": null, "comments": [], "generatedAt": null, "approvedAt": null, "summary": "" },
    "verification": { "status": "pending", "artifact": null, "comments": [], "generatedAt": null, "approvedAt": null, "summary": "" },
    "pr": { "status": "pending", "artifact": null, "comments": [], "generatedAt": null, "approvedAt": null, "summary": "" }
  }
}
```

---

## 🔄 How Stage Progression Works

### Stage Sequence (Hardcoded in Orchestrator)
```javascript
const STAGE_SEQUENCE = [
  "Requirements",
  "Architecture", 
  "Planning",
  "Implementation",
  "Review",
  "Verification",
  "PR"
];
```

### Finding Current Stage
```javascript
// 1. Read state file
const state = JSON.parse(
  fs.readFileSync('.artifacts/workflow-state.json')
);

// 2. Get current stage
const currentStage = state.currentStage;  // "Planning"

console.log(`Currently at: ${currentStage}`);
```

### Finding Next Stage
```javascript
// 1. Read state file
const state = JSON.parse(
  fs.readFileSync('.artifacts/workflow-state.json')
);

// 2. Get current stage index
const currentIndex = STAGE_SEQUENCE.indexOf(state.currentStage);
// Planning is index 2

// 3. Get next stage
const nextStage = STAGE_SEQUENCE[currentIndex + 1];
// Implementation (index 3)

console.log(`Next stage: ${nextStage}`);
```

---

## 📊 State Transitions

### When Workflow Starts
```bash
> start story WA-46
```

**Orchestrator does:**
```javascript
// 1. Create initial state
{
  "storyId": "WA-46",
  "currentStage": "Requirements",  ← First stage
  "status": "InProgress",          ← Agent running
  "approvedStages": []             ← None approved yet
}

// 2. Invoke Requirements Agent
// 3. When agent completes, update status
{
  "currentStage": "Requirements",
  "status": "WaitingForApproval"  ← Paused for human
}
```

### When User Approves
```bash
> approve
```

**Orchestrator does:**
```javascript
// 1. Read current state
const state = readState();  // currentStage: "Requirements"

// 2. Add to approved list
state.approvedStages.push("Requirements");

// 3. Find next stage
const currentIndex = STAGE_SEQUENCE.indexOf("Requirements");  // 0
const nextStage = STAGE_SEQUENCE[currentIndex + 1];          // "Architecture"

// 4. Update state
state.currentStage = nextStage;      // "Architecture"
state.status = "InProgress";         // Agent will run

// 5. Save state
saveState(state);

// 6. Invoke Architecture Agent
invokeAgent("architecture-agent");

// 7. When agent completes, update status again
state.status = "WaitingForApproval";  // Pause for human
saveState(state);
```

**State file now:**
```json
{
  "currentStage": "Architecture",        ← Advanced!
  "status": "WaitingForApproval",
  "approvedStages": ["Requirements"]     ← Requirements approved
}
```

### When User Rejects
```bash
> reject
```

**Orchestrator does:**
```javascript
// 1. Read current state
const state = readState();  // currentStage: "Architecture"

// 2. DO NOT advance - stay at current stage
// currentStage remains "Architecture"

// 3. Update status
state.status = "WaitingForApproval";  // Still waiting

// 4. Log rejection reason to audit trail

// 5. Wait for user to fix and re-approve
```

**State file stays the same:**
```json
{
  "currentStage": "Architecture",        ← Did NOT advance
  "status": "WaitingForApproval",
  "approvedStages": ["Requirements"]     ← Did NOT add Architecture
}
```

---

## 🛠️ Workflow State Manager Skill

The orchestrator uses the **workflow-state-manager** skill for all state operations:

### Initialize State
```bash
workflow-state init WA-46 "Get Weather Data by City Name" Feature
```

Creates state file with initial values.

### Read Current Stage
```bash
workflow-state read currentStage
# Output: Requirements
```

### Update Status
```bash
workflow-state update status WaitingForApproval
```

### Add to Approved Stages
```bash
workflow-state append approvedStages Requirements
```

### Advance to Next Stage
```bash
workflow-state update currentStage Architecture
```

### Check Progress
```bash
workflow-state progress
```

Output:
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

---

## 🔍 Complete Flow Example

### Terminal Session with State Changes

```bash
# ─────────────────────────────────────────────────
# USER ACTION
# ─────────────────────────────────────────────────
> start story WA-46

# ─────────────────────────────────────────────────
# STATE CHANGE 1: Initialize
# ─────────────────────────────────────────────────
{
  "storyId": "WA-46",
  "currentStage": "Requirements",     ← START HERE
  "status": "InProgress",
  "approvedStages": []
}

# ─────────────────────────────────────────────────
# Requirements Agent runs...
# ─────────────────────────────────────────────────

# ─────────────────────────────────────────────────
# STATE CHANGE 2: Agent Complete
# ─────────────────────────────────────────────────
{
  "currentStage": "Requirements",     ← STILL HERE
  "status": "WaitingForApproval",     ← PAUSED
  "approvedStages": [],
  "artifacts": {
    "requirements": ".artifacts/WA-46-requirements.md"
  }
}

⏸  Waiting for approval...

# ─────────────────────────────────────────────────
# USER ACTION
# ─────────────────────────────────────────────────
> approve

# ─────────────────────────────────────────────────
# STATE CHANGE 3: Approved & Advanced
# ─────────────────────────────────────────────────
{
  "currentStage": "Architecture",     ← ADVANCED!
  "status": "InProgress",             ← RUNNING
  "approvedStages": ["Requirements"], ← ADDED
  "artifacts": {
    "requirements": ".artifacts/WA-46-requirements.md"
  }
}

# ─────────────────────────────────────────────────
# Architecture Agent runs...
# ─────────────────────────────────────────────────

# ─────────────────────────────────────────────────
# STATE CHANGE 4: Agent Complete
# ─────────────────────────────────────────────────
{
  "currentStage": "Architecture",     ← STILL HERE
  "status": "WaitingForApproval",     ← PAUSED
  "approvedStages": ["Requirements"],
  "artifacts": {
    "requirements": ".artifacts/WA-46-requirements.md",
    "architecture": ".artifacts/WA-46-architecture.md"
  }
}

⏸  Waiting for approval...

# ─────────────────────────────────────────────────
# USER ACTION
# ─────────────────────────────────────────────────
> reject

# ─────────────────────────────────────────────────
# STATE CHANGE 5: Rejected (NO ADVANCEMENT)
# ─────────────────────────────────────────────────
{
  "currentStage": "Architecture",     ← STAYED HERE
  "status": "WaitingForApproval",     ← STILL PAUSED
  "approvedStages": ["Requirements"], ← DID NOT ADD
  "artifacts": {
    "requirements": ".artifacts/WA-46-requirements.md",
    "architecture": ".artifacts/WA-46-architecture.md"
  }
}

# User fixes issues...

# ─────────────────────────────────────────────────
# USER ACTION
# ─────────────────────────────────────────────────
> approve

# ─────────────────────────────────────────────────
# STATE CHANGE 6: Approved & Advanced
# ─────────────────────────────────────────────────
{
  "currentStage": "Planning",                    ← ADVANCED!
  "status": "InProgress",
  "approvedStages": [                            ← ADDED
    "Requirements",
    "Architecture"
  ],
  "artifacts": {
    "requirements": ".artifacts/WA-46-requirements.md",
    "architecture": ".artifacts/WA-46-architecture.md"
  }
}

# ... continues through all 7 stages
```

---

## 🧮 Stage Determination Logic

### Pseudocode in Orchestrator

```javascript
class SDLCOrchestrator {
  
  constructor() {
    this.stages = [
      "Requirements",
      "Architecture",
      "Planning",
      "Implementation",
      "Review",
      "Verification",
      "PR"
    ];
  }
  
  // Get current stage
  getCurrentStage() {
    const state = this.readState();
    return state.currentStage;
  }
  
  // Get next stage
  getNextStage() {
    const current = this.getCurrentStage();
    const currentIndex = this.stages.indexOf(current);
    
    if (currentIndex === -1) {
      throw new Error(`Invalid stage: ${current}`);
    }
    
    if (currentIndex === this.stages.length - 1) {
      return null;  // No next stage (workflow complete)
    }
    
    return this.stages[currentIndex + 1];
  }
  
  // Check if stage is approved
  isStageApproved(stageName) {
    const state = this.readState();
    return state.approvedStages.includes(stageName);
  }
  
  // Advance to next stage
  advanceToNextStage() {
    const nextStage = this.getNextStage();
    
    if (!nextStage) {
      this.updateState({ status: "Completed" });
      return null;
    }
    
    // Add current stage to approved list
    const current = this.getCurrentStage();
    this.appendToApprovedStages(current);
    
    // Update current stage
    this.updateState({ 
      currentStage: nextStage,
      status: "InProgress"
    });
    
    return nextStage;
  }
  
  // Handle approval
  onApprove() {
    const nextStage = this.advanceToNextStage();
    
    if (nextStage) {
      this.invokeAgent(nextStage);
    } else {
      console.log("Workflow complete!");
    }
  }
  
  // Handle rejection
  onReject() {
    // Stay at current stage, do not advance
    this.updateState({ status: "WaitingForApproval" });
    this.logRejection();
  }
  
  // Read state file
  readState() {
    return JSON.parse(
      fs.readFileSync('.artifacts/workflow-state.json', 'utf8')
    );
  }
  
  // Update state file
  updateState(updates) {
    const state = this.readState();
    Object.assign(state, updates);
    state.lastUpdatedAt = new Date().toISOString();
    
    fs.writeFileSync(
      '.artifacts/workflow-state.json',
      JSON.stringify(state, null, 2)
    );
  }
  
  // Append to approved stages
  appendToApprovedStages(stageName) {
    const state = this.readState();
    if (!state.approvedStages.includes(stageName)) {
      state.approvedStages.push(stageName);
      this.updateState({ approvedStages: state.approvedStages });
    }
  }
}
```

---

## 📊 Status Values

The `status` field tracks the current workflow state:

| Status | Meaning | When Set |
|--------|---------|----------|
| `InProgress` | Agent currently running | When agent invoked |
| `WaitingForApproval` | Paused for human decision | When agent completes |
| `Completed` | All stages approved, PR created | When PR stage approved |
| `Failed` | Error occurred, workflow stopped | On unrecoverable error |

---

## 🎯 Key Takeaways

### 1. State is Persisted
✅ State file survives session restarts  
✅ Can resume workflow from any point  
✅ Multiple users can see same state

### 2. Stage Sequence is Fixed
✅ Order is predefined: Requirements → ... → PR  
✅ Cannot skip stages  
✅ Must approve each stage sequentially

### 3. Current Stage is Tracked
✅ `currentStage` field in state file  
✅ Updated on approval  
✅ Does NOT update on rejection

### 4. Approved Stages are Logged
✅ `approvedStages` array tracks completed stages  
✅ Grows as workflow progresses  
✅ Used to calculate progress percentage

### 5. Next Stage is Calculated
✅ Based on current stage index  
✅ Look up next index in sequence array  
✅ Return null if current stage is last (PR)

---

## 🔧 Behind the Scenes

### When User Types "approve"

```
User: approve
    ↓
Orchestrator reads: .artifacts/workflow-state.json
    ↓
Extracts: currentStage = "Requirements"
    ↓
Finds index: STAGE_SEQUENCE.indexOf("Requirements") = 0
    ↓
Calculates next: STAGE_SEQUENCE[0 + 1] = "Architecture"
    ↓
Updates state:
  - approvedStages.push("Requirements")
  - currentStage = "Architecture"
  - status = "InProgress"
    ↓
Saves: .artifacts/workflow-state.json
    ↓
Invokes: Architecture Agent
    ↓
When agent completes:
  - status = "WaitingForApproval"
    ↓
Pauses and waits for next approval
```

---

## 📁 File Locations

```
Project Root/
│
├── .artifacts/
│   ├── workflow-state.json          ← MAIN STATE FILE
│   ├── workflow-state.json.backup   ← Auto-backup
│   ├── WA-46-requirements.md        ← Stage artifacts
│   ├── WA-46-architecture.md
│   └── ...
│
├── .audit/
│   └── WA-46-audit.log              ← All actions logged
│
└── .claude/
    ├── agents/
    │   └── sdlc-orchestrator.md     ← Orchestrator logic
    └── skills/
        └── workflow-state-manager.md ← State management
```

---

## 🎓 Summary

**The orchestrator knows the current and next stage by:**

1. **Reading** `.artifacts/workflow-state.json`
2. **Extracting** `currentStage` field (e.g., "Planning")
3. **Looking up** index in predefined sequence array
4. **Calculating** next stage = `STAGE_SEQUENCE[currentIndex + 1]`
5. **Updating** state when approved (advance) or rejected (stay)

**Simple formula:**
```
Current Stage = state.currentStage
Next Stage = STAGE_SEQUENCE[STAGE_SEQUENCE.indexOf(currentStage) + 1]
```

The state file is the **single source of truth** for workflow progress! 🎯
