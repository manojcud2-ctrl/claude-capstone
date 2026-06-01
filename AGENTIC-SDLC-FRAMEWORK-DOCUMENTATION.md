# Agentic SDLC Framework - Complete Documentation

> **A comprehensive human-in-the-loop Software Development Life Cycle orchestration framework using specialized AI agents**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Core Components](#core-components)
4. [Workflow Stages](#workflow-stages)
5. [State Management](#state-management)
6. [Approval Gates](#approval-gates)
7. [Integration Points](#integration-points)
8. [Usage Guide](#usage-guide)
9. [Technical Implementation](#technical-implementation)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### What It Is

The **Agentic SDLC Framework** is a master orchestrator pattern that automates the complete software delivery lifecycle by coordinating **7 specialized AI agents** that work sequentially to transform a Jira story into production-ready code with comprehensive documentation, testing, and pull request generation.

### Key Value Propositions

✅ **End-to-End Automation** - From Jira story to GitHub PR in one workflow  
✅ **Quality Assurance** - Human approval gates after every stage prevent cascading errors  
✅ **Complete Documentation** - Every stage produces structured artifacts  
✅ **Audit Compliance** - Full traceability of every action and decision  
✅ **Consistency** - Reusable skills ensure best practices across all projects  
✅ **Flexibility** - Extensible architecture allows customization  
✅ **Integration Ready** - Built-in Jira and GitHub integrations  

### Target Users

- **Engineering Teams** - Automate repetitive SDLC tasks while maintaining control
- **Tech Leads** - Enforce quality gates and standards compliance
- **Product Teams** - Track progress from story to deployment
- **Compliance Teams** - Maintain complete audit trails

---

## Architecture Overview

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      JIRA (INPUT)                              │
│                    Story: WA-46                                │
│            "Get Weather Data by City Name"                     │
└──────────────────────┬─────────────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                 SDLC ORCHESTRATOR                              │
│           (Master Controller & Coordinator)                    │
│                                                                │
│  Responsibilities:                                             │
│  • Initialize workflow state                                   │
│  • Invoke agents sequentially                                 │
│  • Enforce approval gates                                     │
│  • Maintain state persistence                                 │
│  • Log all actions (audit trail)                              │
└────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┘
     │      │      │      │      │      │      │
     ▼      ▼      ▼      ▼      ▼      ▼      ▼
  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
  │Req │ │Arch│ │Plan│ │Impl│ │Rev │ │Ver │ │PR  │
  │    │ │    │ │    │ │    │ │    │ │    │ │    │
  └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
    │      │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼
  [🚪]   [🚪]   [🚪]   [🚪]   [🚪]   [🚪]   [🎯]
  Gate   Gate   Gate   Gate   Gate   Gate    PR
    1      2      3      4      5      6   Created
    │      │      │      │      │      │      │
    └──────┴──────┴──────┴──────┴──────┴──────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────────────┐
│                   GITHUB (OUTPUT)                              │
│              Pull Request #123 Created                         │
│         Branch: feature/WA-46-weather-endpoint                 │
└────────────────────────────────────────────────────────────────┘
```

### Component Layers

**Layer 1: Orchestration**
- SDLC Orchestrator (master controller)
- State Manager (workflow persistence)
- Audit Logger (compliance tracking)

**Layer 2: Specialized Agents**
- Requirements Agent
- Architecture Agent
- Planning Agent
- Implementation Agent
- Review Agent
- Verification Agent
- PR Agent

**Layer 3: Reusable Skills**
- Jira Integrator
- GitHub Integrator
- Code Generator
- Test Generator
- Artifact Validator
- Approval Gate Handler
- Agent Coordinator

**Layer 4: Integrations**
- Jira API (via MCP or REST)
- GitHub API (via MCP or gh CLI)
- Git (local repository operations)
- File System (artifact storage)

---

## Core Components

### 1. SDLC Orchestrator

**Location**: `.claude/agents/sdlc-orchestrator.md`

**Purpose**: Master controller that coordinates the entire workflow

**Core Responsibilities**:

1. **Workflow Initialization**
   - Parse Jira story ID
   - Create directory structure
   - Initialize state file
   - Set up audit logging

2. **State Management**
   - Track current stage
   - Maintain approved stages list
   - Persist workflow status
   - Provide state queries

3. **Agent Coordination**
   - Invoke agents sequentially
   - Pass artifacts between stages
   - Handle agent failures
   - Monitor execution

4. **Approval Gate Enforcement**
   - Pause after each stage
   - Validate artifacts
   - Collect human decisions
   - Update state on approval/rejection

5. **Audit Trail Maintenance**
   - Log all actions with timestamps
   - Record approval decisions
   - Track agent invocations
   - Maintain compliance documentation

**Key Characteristics**:
- **Stateful**: Maintains workflow state across sessions
- **Sequential**: Executes stages in fixed order
- **Blocking**: Waits for approval before proceeding
- **Resilient**: Handles failures and retries

### 2. Specialized Agents

Each agent is a focused expert that handles one specific stage:

#### Requirements Agent

**File**: `.claude/agents/requirements-agent.md`

**Input**: Jira Story ID (e.g., "WA-46")

**Process**:
1. Fetch story from Jira via `jira-integrator` skill
2. Parse story description (often in ADF format)
3. Extract business objectives
4. Identify functional requirements
5. Define non-functional requirements (performance, security)
6. Create acceptance criteria (Given-When-Then format)
7. Document assumptions and constraints
8. List open questions

**Output**: `docs/workflows/{storyId}/requirements.md`

**Approval Gate**: User reviews requirements for completeness and accuracy

---

#### Architecture Agent

**File**: `.claude/agents/architecture-agent.md`

**Input**: Requirements artifact

**Process**:
1. Read requirements document
2. Analyze existing codebase structure
3. Design component architecture
4. Define interfaces and APIs
5. Specify data models and schemas
6. Identify dependencies
7. Assess technical risks
8. Create testing strategy
9. Generate architecture diagrams (ASCII)

**Output**: `docs/workflows/{storyId}/architecture.md`

**Approval Gate**: User reviews architecture design and technical decisions

---

#### Planning Agent

**File**: `.claude/agents/planning-agent.md`

**Input**: Requirements + Architecture artifacts

**Process**:
1. Read requirements and architecture
2. Break down work into atomic tasks
3. Estimate effort (T-shirt sizes: XS, S, M, L, XL)
4. Identify task dependencies
5. Sequence tasks optimally
6. Map tasks to files impacted
7. Define acceptance criteria per task
8. Calculate critical path

**Output**: `docs/workflows/{storyId}/impl-plan.md`

**Approval Gate**: User reviews implementation plan and task breakdown

---

#### Implementation Agent

**File**: `.claude/agents/implementation-agent.md`

**Input**: Requirements + Architecture + Plan artifacts

**Process**:
1. Read all upstream artifacts
2. Execute tasks in sequence
3. Create/modify code files
4. Follow repository conventions (detected from CLAUDE.md)
5. Generate unit tests per file
6. Run tests to verify correctness
7. Create Git commits per logical change
8. Document implementation decisions

**Output**: 
- Code changes in repository
- `docs/workflows/{storyId}/impl-summary.md`

**Approval Gate**: User reviews actual code changes and tests

---

#### Review Agent

**File**: `.claude/agents/review-agent.md`

**Input**: Implementation Summary + Code Changes

**Process**:
1. Review code quality
   - Readability
   - Maintainability
   - DRY principle adherence
2. Check architecture compliance
3. Validate test coverage
4. Identify security issues (OWASP Top 10)
5. Check performance concerns
6. Review error handling
7. Assess documentation quality
8. Generate improvement recommendations

**Output**: `docs/workflows/{storyId}/review-report.md`

**Approval Gate**: User reviews findings and confirms fixes applied

---

#### Verification Agent

**File**: `.claude/agents/verification-agent.md`

**Input**: Review Report + Implementation

**Process**:
1. Map acceptance criteria to tests
2. Run full test suite
   - Unit tests
   - Integration tests
   - Functional tests
3. Verify test coverage meets threshold
4. Check review findings addressed
5. Validate requirements fully covered
6. Test edge cases
7. Verify error handling

**Output**: `docs/workflows/{storyId}/verification-report.md`

**Approval Gate**: User confirms all criteria met and tests pass

---

#### PR Agent

**File**: `.claude/agents/pr-agent.md`

**Input**: All previous artifacts

**Process**:
1. Generate PR title (conventional commit format)
2. Create comprehensive PR description
   - Summary of changes
   - Related Jira story link
   - Implementation notes
3. Generate changelog
4. Build reviewer checklist
5. Summarize testing evidence
6. Create release notes section
7. Invoke GitHub integrator to create PR

**Output**: 
- `docs/workflows/{storyId}/pr-package.md`
- Pull Request created on GitHub

**Final State**: Workflow marked as Completed

---

### 3. Reusable Skills

Skills are modular components that provide common functionality:

#### Jira Integrator
**Purpose**: Interact with Jira API

**Operations**:
- `get-issue` - Fetch story details
- `get-issue-expanded` - Fetch with changelog and operations
- `add-comment` - Add comment to story
- `transition-issue` - Move story through workflow
- `search-jql` - Query Jira using JQL

#### GitHub Integrator
**Purpose**: Interact with GitHub

**Operations**:
- `create-pr` - Create pull request
- `get-pr` - Fetch PR details
- `add-reviewers` - Assign reviewers
- `check-ci` - Check CI/CD status
- `list-prs` - List pull requests

#### Code Generator
**Purpose**: Generate production code

**Operations**:
- `function` - Generate functions
- `class` - Generate classes
- `endpoint` - Generate API endpoints
- `crud` - Generate CRUD operations
- `security-scan` - Scan for vulnerabilities

#### Test Generator
**Purpose**: Generate test suites

**Operations**:
- `unit` - Generate unit tests
- `integration` - Generate integration tests
- `functional` - Generate functional tests
- `run` - Execute test suite
- `coverage` - Check coverage metrics

#### Workflow State Manager
**Purpose**: Manage workflow state

**Operations**:
- `init` - Initialize workflow
- `read` - Read state fields
- `update` - Update state
- `append` - Add to arrays
- `progress` - Calculate progress

#### Artifact Validator
**Purpose**: Validate stage outputs

**Operations**:
- `exists` - Check file exists
- `complete` - Verify not empty
- `sections` - Check required sections
- `stage` - Full stage validation

#### Approval Gate Handler
**Purpose**: Manage approval gates

**Operations**:
- `create` - Create approval gate
- `prompt` - Collect decision
- `approve` - Handle approval
- `reject` - Handle rejection

#### Audit Logger
**Purpose**: Maintain audit trail

**Operations**:
- `init` - Initialize log
- `log` - Log action
- `approve` - Log approval
- `reject` - Log rejection
- `timeline` - Show timeline

---

## Workflow Stages

### Complete Workflow Sequence

```
START
  │
  ├─► Requirements Agent
  │        │
  │        ├─► Extract business requirements
  │        ├─► Define functional requirements
  │        ├─► Create acceptance criteria
  │        └─► Output: requirements.md
  │                 │
  │                 ▼
  │             [APPROVAL GATE 1]
  │                 │
  │                 ├─► Approve ──────► Continue
  │                 └─► Reject ───────► Loop back
  │
  ├─► Architecture Agent
  │        │
  │        ├─► Design component architecture
  │        ├─► Define interfaces
  │        ├─► Identify risks
  │        └─► Output: architecture.md
  │                 │
  │                 ▼
  │             [APPROVAL GATE 2]
  │
  ├─► Planning Agent
  │        │
  │        ├─► Break into tasks
  │        ├─► Estimate effort
  │        ├─► Sequence tasks
  │        └─► Output: impl-plan.md
  │                 │
  │                 ▼
  │             [APPROVAL GATE 3]
  │
  ├─► Implementation Agent
  │        │
  │        ├─► Write production code
  │        ├─► Generate tests
  │        ├─► Run test suite
  │        └─► Output: impl-summary.md + code
  │                 │
  │                 ▼
  │             [APPROVAL GATE 4]
  │
  ├─► Review Agent
  │        │
  │        ├─► Review code quality
  │        ├─► Check test coverage
  │        ├─► Identify issues
  │        └─► Output: review-report.md
  │                 │
  │                 ▼
  │             [APPROVAL GATE 5]
  │
  ├─► Verification Agent
  │        │
  │        ├─► Verify acceptance criteria
  │        ├─► Run full test suite
  │        ├─► Validate requirements
  │        └─► Output: verification-report.md
  │                 │
  │                 ▼
  │             [APPROVAL GATE 6]
  │
  └─► PR Agent
           │
           ├─► Generate PR description
           ├─► Create changelog
           ├─► Create GitHub PR
           └─► Output: pr-package.md + GitHub PR
                    │
                    ▼
              [WORKFLOW COMPLETE]
```

---

## State Management

### File-Per-Workflow Architecture

The framework uses an **index + individual workflow files** approach:

```
.claude/state/
├── index.json                    # Active workflows index
├── StateManager.js               # State management logic
├── workflows/
│   ├── WA-46.json               # Individual workflow state
│   ├── WA-47.json
│   └── WA-48.json
└── archive/
    └── WA-45.json               # Completed workflows
```

### Index File Format

**File**: `.claude/state/index.json`

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
    }
  ]
}
```

### Workflow State Format

**File**: `.claude/state/workflows/WA-46.json`

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
      "summary": "Requirements documented and approved"
    },
    "architecture": {
      "status": "completed",
      "artifact": "docs/workflows/WA-46/architecture.md",
      "comments": [],
      "generatedAt": "2026-05-30T19:15:00.000Z",
      "approvedAt": "2026-05-30T20:00:00.000Z",
      "summary": "Architecture design approved"
    },
    "planning": {
      "status": "in_progress",
      "artifact": "docs/workflows/WA-46/impl-plan.md",
      "comments": [],
      "generatedAt": "2026-05-31T10:00:00.000Z",
      "approvedAt": null,
      "summary": "Implementation plan under review"
    }
  }
}
```

### State Transitions

**Status Values**:

| Status | Description | When Set |
|--------|-------------|----------|
| `draft` | Initial state, not yet started | On initialization |
| `in_progress` | Agent currently executing | When agent invoked |
| `waiting_for_approval` | Paused for human review | When agent completes |
| `approved` | Stage approved, ready to advance | On approval |
| `rejected` | Stage rejected, needs fixes | On rejection |
| `completed` | All stages done, PR created | Workflow finished |
| `failed` | Unrecoverable error | On critical failure |

### Stage Progression Logic

```javascript
// Hardcoded stage sequence
const STAGE_SEQUENCE = [
  "requirements",
  "architecture",
  "planning",
  "implementation",
  "review",
  "verification",
  "pr"
];

// Current stage from state
const currentStage = state.currentStage;  // "planning"

// Find next stage
const currentIndex = STAGE_SEQUENCE.indexOf(currentStage);  // 2
const nextStage = STAGE_SEQUENCE[currentIndex + 1];         // "implementation"

// On approval: advance to next stage
state.currentStage = nextStage;
state.stages[currentStage].status = "completed";
state.stages[currentStage].approvedAt = new Date().toISOString();

// On rejection: stay at current stage
// (no changes to currentStage)
```

### State Persistence

**When State is Updated**:
- Workflow initialization
- Agent invocation
- Agent completion
- Approval granted
- Rejection recorded
- Artifact generated
- Status change

**Backup Strategy**:
- Automatic backup before each update
- Backup file: `{storyId}.json.backup`
- Retained for recovery

---

## Approval Gates

### Purpose of Approval Gates

1. **Quality Control** - Human review catches issues AI might miss
2. **Context Validation** - Ensure output matches business intent
3. **Risk Mitigation** - Prevent cascade of errors to later stages
4. **Team Alignment** - Build shared understanding of approach
5. **Compliance** - Document decision points for audit

### Approval Gate Flow

```
┌──────────────────────────────────────────────┐
│  1. Agent Completes Stage                    │
│     ✓ Artifact generated                     │
│     ✓ State updated                          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  2. Orchestrator Validates Artifact          │
│     ✓ File exists                            │
│     ✓ Not empty                              │
│     ✓ Required sections present              │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  3. Display Summary to User                  │
│     • Artifact path                          │
│     • Key metrics                            │
│     • Important findings                     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  4. Prompt for Decision                      │
│     ┌──────────────────────────────────┐    │
│     │ Options:                         │    │
│     │ → Approve (continue to next)     │    │
│     │ → Reject (stay, provide feedback)│    │
│     └──────────────────────────────────┘    │
└──────────────────┬───────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    [APPROVE]           [REJECT]
         │                   │
         ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│ 5a. On Approve   │  │ 5b. On Reject    │
│ • Add to         │  │ • Log reason     │
│   approved list  │  │ • Keep at        │
│ • Advance stage  │  │   current stage  │
│ • Log approval   │  │ • Wait for fixes │
│ • Invoke next    │  │                  │
│   agent          │  │                  │
└──────────────────┘  └────────┬─────────┘
         │                     │
         │              [User fixes
         │               artifact]
         │                     │
         │                     ▼
         │              [Request
         │               re-approval]
         │                     │
         └─────────────────────┘
```

### Approval Gate Data Collection

Each approval gate collects:

**Approval Record**:
```json
{
  "stage": "requirements",
  "decision": "approved",
  "timestamp": "2026-05-31T10:15:00.000Z",
  "reviewer": "user@example.com",
  "artifact": "docs/workflows/WA-46/requirements.md",
  "nextStage": "architecture",
  "comments": "Looks good, moving forward"
}
```

**Rejection Record**:
```json
{
  "stage": "architecture",
  "decision": "rejected",
  "timestamp": "2026-05-31T11:20:00.000Z",
  "reviewer": "user@example.com",
  "artifact": "docs/workflows/WA-46/architecture.md",
  "reason": "Missing database schema design",
  "requiredChanges": [
    "Add database table definitions",
    "Document migration strategy"
  ]
}
```

---

## Integration Points

### Jira Integration

**Method 1: MCP Server (Preferred)**
- Requires Jira MCP server configured
- Automatic authentication
- Real-time API access

**Method 2: REST API Direct**
- Uses environment variables:
  - `JIRA_BASE_URL`
  - `JIRA_USER_EMAIL`
  - `JIRA_API_TOKEN`

**Method 3: Manual Input**
- User pastes story details
- Workflow proceeds without Jira connection

**Jira Operations**:
- Fetch story details
- Parse ADF description format
- Update story status
- Add comments
- Link to commits/PRs

### GitHub Integration

**Method 1: MCP Server (Preferred)**
- Requires GitHub MCP server configured
- Uses `GITHUB_PERSONAL_ACCESS_TOKEN`
- Native GitHub API access

**Method 2: gh CLI**
- Uses installed `gh` command
- Requires `gh auth login`
- Fallback if MCP unavailable

**Method 3: Manual**
- Framework generates PR content
- User creates PR manually

**GitHub Operations**:
- Create pull requests
- Add reviewers
- Set labels
- Check CI status
- Link to Jira story

### Git Integration

**Local Git Operations**:
- Branch creation: `feature/{storyId}-{slug}`
- Conventional commits: `feat:`, `fix:`, `refactor:`, etc.
- Commit message format includes co-author

**Git Workflow**:
```bash
# Create feature branch
git checkout -b feature/WA-46-weather-endpoint

# Implementation agent makes changes...

# Commit per logical change
git add src/server.js
git commit -m "feat: Add /api/weather/:city endpoint

- Add case-insensitive city search
- Return formatted weather data with units
- Return 404 for non-existent cities

Co-Authored-By: Claude <noreply@anthropic.com>"

# PR agent pushes branch
git push origin feature/WA-46-weather-endpoint
```

### File System Integration

**Directory Structure Created**:
```
docs/workflows/{storyId}/
├── requirements.md
├── architecture.md
├── impl-plan.md
├── impl-summary.md
├── review-report.md
├── verification-report.md
├── pr-package.md
└── audit-log.md

.claude/state/workflows/
└── {storyId}.json
```

---

## Usage Guide

### Prerequisites

1. **Claude Code CLI** installed and configured
2. **Git repository** initialized
3. **Node.js** (if using StateManager.js)
4. **(Optional) Jira account** with API access
5. **(Optional) GitHub account** with API access

### Initial Setup

#### 1. Clone Framework

```bash
# Framework is already in this repository
cd .claude/
ls -la agents/  # Verify agents present
ls -la skills/  # Verify skills present
```

#### 2. Configure Integrations

**For Jira**:
```bash
# Set environment variables
export JIRA_BASE_URL="https://your-domain.atlassian.net"
export JIRA_USER_EMAIL="your-email@domain.com"
export JIRA_API_TOKEN="your-api-token"
```

**For GitHub**:
```bash
# Set GitHub token
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"

# Or configure gh CLI
gh auth login
```

#### 3. Verify Setup

```bash
# Check state manager
node .claude/state/StateManager.js --help

# Verify workflow directory
ls -la docs/workflows/
```

### Starting a Workflow

**Command Pattern**:
```
start story {STORY-ID}
```

**Example**:
```
User: start story WA-46
```

**What Happens**:
1. Orchestrator initializes
2. Fetches Jira story WA-46
3. Creates workflow directories
4. Initializes state file
5. Invokes Requirements Agent
6. Requirements Agent completes
7. **Pauses at Approval Gate 1**

**Output**:
```
✓ Workflow initialized for WA-46
✓ Jira story fetched: "Get Weather Data by City Name"
✓ Requirements Agent invoked...

━━━ Requirements Analysis ━━━
• Business objectives: 2
• Functional requirements: 5
• Non-functional requirements: 3
• Acceptance criteria: 4

📄 Artifact: docs/workflows/WA-46/requirements.md

⏸️  Approval Gate: Requirements
    Ready to proceed to Architecture stage?

Commands:
• approve - Continue to next stage
• reject - Request changes
• view requirements - View artifact
• status - Check workflow status
```

### Approving a Stage

**Command Pattern**:
```
approve [stage-name]
```

**Examples**:
```
User: approve
# or
User: approve requirements
```

**What Happens**:
1. Orchestrator validates artifact
2. Adds "requirements" to approved list
3. Advances currentStage to "architecture"
4. Updates state file
5. Logs approval to audit trail
6. Invokes Architecture Agent
7. Architecture Agent completes
8. **Pauses at Approval Gate 2**

### Rejecting a Stage

**Command Pattern**:
```
reject [reason]
```

**Examples**:
```
User: reject

# Or with reason
User: reject - missing performance requirements
```

**What Happens**:
1. Orchestrator logs rejection with reason
2. Does NOT advance stage
3. Workflow stays at current stage
4. Waits for user to:
   - Manually edit artifact
   - Request agent retry
   - Provide additional context
5. User re-approves when ready

**Workflow Stays Paused**:
```
⏸️  Approval Gate: Requirements (REJECTED)

Rejection reason: "missing performance requirements"

Next steps:
1. Edit artifact: docs/workflows/WA-46/requirements.md
2. Add missing content
3. Re-request approval: approve requirements
```

### Checking Status

**Command Pattern**:
```
status
# or
workflow status
```

**Output**:
```
━━━ Workflow Status: WA-46 ━━━

Story: "Get Weather Data by City Name"
Status: in_progress
Progress: 3/7 stages (43%)

✅ Completed Stages:
  1. Requirements (approved 2026-05-30 19:00)
  2. Architecture (approved 2026-05-30 20:00)
  3. Planning (approved 2026-05-31 10:15)

→ Current Stage: Implementation
  Status: in_progress
  Agent: implementation-agent
  Started: 2026-05-31 10:20

⏱️  Pending Stages:
  5. Review
  6. Verification
  7. PR

📁 Artifacts: docs/workflows/WA-46/
📊 State File: .claude/state/workflows/WA-46.json
📝 Audit Log: docs/workflows/WA-46/audit-log.md
```

### Viewing Artifacts

**Command Pattern**:
```
view {stage-name}
```

**Examples**:
```
User: view requirements
User: view architecture
User: view implementation
```

**What Happens**:
- Displays artifact content
- Or opens in editor
- Or provides file path

### Retrying a Stage

**Command Pattern**:
```
retry {stage-name}
```

**Example**:
```
User: retry architecture
```

**What Happens**:
1. Orchestrator re-invokes agent for that stage
2. Agent regenerates artifact
3. New artifact overwrites previous
4. Workflow pauses at approval gate again

---

## Technical Implementation

### State Manager Implementation

**File**: `.claude/state/StateManager.js`

**Class Structure**:
```javascript
class StateManager {
  constructor(baseDir = '.claude/state') {
    this.baseDir = baseDir;
    this.workflowsDir = path.join(baseDir, 'workflows');
    this.indexPath = path.join(baseDir, 'index.json');
  }

  // Initialize new workflow
  initWorkflow(storyId, title, type) {
    const state = {
      jiraStoryId: storyId,
      title: title,
      type: type,
      currentStage: "requirements",
      status: "draft",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      stages: this.initStages()
    };
    
    this.saveWorkflow(storyId, state);
    this.updateIndex(storyId, "requirements", "draft");
    return state;
  }

  // Read workflow state
  readWorkflow(storyId) {
    const filePath = this.getWorkflowPath(storyId);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Workflow ${storyId} not found`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  // Update workflow field
  updateWorkflow(storyId, updates) {
    const state = this.readWorkflow(storyId);
    Object.assign(state, updates);
    state.lastUpdated = new Date().toISOString();
    this.saveWorkflow(storyId, state);
    return state;
  }

  // Get next stage in sequence
  getNextStage(currentStage) {
    const sequence = [
      "requirements", "architecture", "planning",
      "implementation", "review", "verification", "pr"
    ];
    const currentIndex = sequence.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      return null;
    }
    return sequence[currentIndex + 1];
  }

  // Advance to next stage
  advanceStage(storyId) {
    const state = this.readWorkflow(storyId);
    const nextStage = this.getNextStage(state.currentStage);
    
    if (!nextStage) {
      // Workflow complete
      this.updateWorkflow(storyId, {
        status: "completed",
        currentStage: "pr"
      });
      return null;
    }

    // Update current stage as completed
    state.stages[state.currentStage].status = "completed";
    state.stages[state.currentStage].approvedAt = new Date().toISOString();

    // Advance to next stage
    this.updateWorkflow(storyId, {
      currentStage: nextStage,
      status: "in_progress",
      stages: state.stages
    });

    return nextStage;
  }
}

module.exports = StateManager;
```

### Orchestrator Invocation

**Pattern**: Direct invocation with story ID

**Example Orchestrator Logic**:
```markdown
## Input

You will receive a single parameter: the Jira story ID (e.g., "WA-46")

## Process

1. **Initialize Workflow**
   - Create directories
   - Initialize state via StateManager
   - Set up audit log

2. **Fetch Jira Story**
   - Use jira-integrator skill
   - Parse story details
   - Save to context

3. **Invoke Requirements Agent**
   - Pass story details
   - Wait for agent completion
   - Agent handles approval internally
   - Verify approval obtained

4. **Auto-Advance**
   - Update state: advance stage
   - Invoke next agent (Architecture)
   - Repeat until all stages done

5. **Complete Workflow**
   - Mark as completed
   - Archive state file
   - Report PR link to user
```

### Agent Approval Handling

**Each agent manages its own approval**:

```markdown
## Agent Completion Process

1. **Generate Artifact**
   - Create markdown file
   - Write all required sections
   - Save to docs/workflows/{storyId}/

2. **Request Approval**
   - Use AskUserQuestion tool
   - Present artifact summary
   - Options: Approve, Reject, Edit

3. **Handle Decision**
   - If Approved:
     - Update StateManager: mark stage approved
     - Log approval to audit trail
     - Return to orchestrator
   
   - If Rejected:
     - Ask for feedback
     - Update artifact based on feedback
     - Re-request approval
     - Loop until approved

4. **Return to Orchestrator**
   - Only returns after approval obtained
   - Orchestrator verifies approval in state
   - Orchestrator advances to next stage
```

---

## Best Practices

### For Users

1. **Review Thoroughly**
   - Read entire artifact before approving
   - Check for completeness
   - Validate against business requirements

2. **Provide Specific Feedback**
   - Clear rejection reasons
   - Actionable suggestions
   - Reference specific sections

3. **Check Status Regularly**
   - Monitor workflow progress
   - Review audit log
   - Track time per stage

4. **Validate Early**
   - Catch issues in early stages
   - Requirements errors cascade
   - Architecture issues expensive to fix later

5. **Document Manual Changes**
   - Log why artifacts were edited
   - Note assumptions made
   - Update audit trail

### For Developers

1. **Follow Conventions**
   - Use repository coding standards
   - Follow commit message format
   - Maintain test coverage

2. **Test Locally**
   - Run tests before approval
   - Verify builds succeed
   - Check linting passes

3. **Security First**
   - Review generated code for vulnerabilities
   - Validate input handling
   - Check authentication/authorization

4. **Documentation**
   - Keep artifacts up to date
   - Document design decisions
   - Maintain CLAUDE.md file

### For Teams

1. **Establish Standards**
   - Define approval criteria per stage
   - Set coverage thresholds
   - Document quality gates

2. **Review Cadence**
   - Set SLAs for approvals
   - Assign reviewers per stage
   - Balance thoroughness and speed

3. **Continuous Improvement**
   - Analyze rejection patterns
   - Identify bottlenecks
   - Refine agent prompts

4. **Knowledge Sharing**
   - Review artifacts as team
   - Learn from implementation decisions
   - Build shared understanding

---

## Troubleshooting

### Common Issues

#### "No active workflow found"

**Cause**: Workflow not initialized

**Solution**:
```bash
# Start new workflow
start story WA-46
```

#### "Workflow already exists for WA-46"

**Cause**: Workflow file already present

**Solution**:
```bash
# Check status
status

# Or remove old workflow
rm .claude/state/workflows/WA-46.json
rm -rf docs/workflows/WA-46/

# Start fresh
start story WA-46
```

#### "Artifact validation failed"

**Cause**: Artifact missing required sections

**Solution**:
```bash
# View artifact
view architecture

# Edit manually
code docs/workflows/WA-46/architecture.md

# Add missing sections
# Re-approve
approve architecture
```

#### "Agent failed to complete"

**Cause**: Agent error or timeout

**Solution**:
```bash
# Check error in audit log
cat docs/workflows/WA-46/audit-log.md

# Retry agent
retry architecture

# Or continue with manual artifact
# 1. Create artifact manually
# 2. Approve to continue
approve architecture
```

#### "State file corrupted"

**Cause**: Invalid JSON or interrupted write

**Solution**:
```bash
# Restore from backup
cp .claude/state/workflows/WA-46.json.backup \
   .claude/state/workflows/WA-46.json

# Or recreate state manually
node .claude/state/StateManager.js init WA-46
```

### Debug Mode

**Enable verbose logging**:
```bash
export DEBUG=sdlc:*
```

**View detailed logs**:
```bash
tail -f docs/workflows/WA-46/audit-log.md
```

---

## Advanced Topics

### Customizing Agents

**Edit agent definition**:
```bash
code .claude/agents/requirements-agent.md
```

**Modify sections**:
- **Responsibilities**: Change what agent does
- **Process**: Update step-by-step logic
- **Output Format**: Change artifact structure
- **Validation Rules**: Add quality checks

### Adding Custom Stages

1. **Create new agent definition**:
   ```bash
   cp .claude/agents/_approval-template.md \
      .claude/agents/security-review-agent.md
   ```

2. **Update orchestrator sequence**:
   ```javascript
   // In StateManager.js
   const STAGE_SEQUENCE = [
     "requirements",
     "architecture",
     "planning",
     "implementation",
     "security-review",  // ← New stage
     "review",
     "verification",
     "pr"
   ];
   ```

3. **Add artifact template**:
   ```bash
   touch docs/workflows/_templates/security-review.md
   ```

4. **Test new stage**:
   ```bash
   start story TEST-001
   # ... proceed through stages
   # Verify security-review stage executes
   ```

### Metrics and Analytics

**Extract workflow metrics**:
```bash
# Time per stage
node scripts/analyze-workflow.js WA-46 --time-per-stage

# Rejection rate
node scripts/analyze-workflow.js --rejections

# Agent performance
node scripts/analyze-workflow.js --agent-metrics
```

**Sample metrics**:
- Average time per stage
- Approval vs rejection rate
- Most common rejection reasons
- Agent retry frequency
- Workflow completion time

---

## Appendix

### File Structure Reference

```
project-root/
├── .claude/
│   ├── agents/
│   │   ├── sdlc-orchestrator.md
│   │   ├── requirements-agent.md
│   │   ├── architecture-agent.md
│   │   ├── planning-agent.md
│   │   ├── implementation-agent.md
│   │   ├── review-agent.md
│   │   ├── verification-agent.md
│   │   └── pr-agent.md
│   │
│   ├── skills/
│   │   ├── README.md
│   │   ├── jira-integrator.md
│   │   ├── github-integrator.md
│   │   ├── code-generator.md
│   │   ├── test-generator.md
│   │   ├── workflow-state-manager.md
│   │   ├── artifact-validator.md
│   │   ├── approval-gate-handler.md
│   │   ├── audit-logger.md
│   │   └── agent-coordinator.md
│   │
│   └── state/
│       ├── StateManager.js
│       ├── index.json
│       ├── workflows/
│       │   ├── WA-46.json
│       │   └── WA-47.json
│       └── archive/
│           └── WA-45.json
│
├── docs/
│   └── workflows/
│       ├── WA-46/
│       │   ├── requirements.md
│       │   ├── architecture.md
│       │   ├── impl-plan.md
│       │   ├── impl-summary.md
│       │   ├── review-report.md
│       │   ├── verification-report.md
│       │   ├── pr-package.md
│       │   └── audit-log.md
│       └── _templates/
│           └── *.md (templates)
│
├── CLAUDE.md (project documentation)
├── README-AGENTIC-SDLC.md
├── FRAMEWORK-SUMMARY.md
├── WORKFLOW-DIAGRAM.md
└── STATE-MANAGEMENT.md
```

### Environment Variables

```bash
# Jira Integration
JIRA_BASE_URL="https://your-domain.atlassian.net"
JIRA_USER_EMAIL="your-email@domain.com"
JIRA_API_TOKEN="your-api-token"

# GitHub Integration
GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token"

# Optional: Debug mode
DEBUG="sdlc:*"
```

### Command Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `start story <id>` | Initialize workflow | `start story WA-46` |
| `approve [stage]` | Approve current stage | `approve` |
| `reject [reason]` | Reject current stage | `reject - needs fixes` |
| `status` | View workflow status | `status` |
| `view <stage>` | Display artifact | `view requirements` |
| `retry <stage>` | Re-run agent | `retry architecture` |

---

## Version

**Framework Version**: 1.0  
**Release Date**: 2026-05-31  
**Status**: Production Ready  
**Compatibility**: Claude Code CLI

---

## License

This framework is part of the claude-capstone project.

---

## Support & Resources

- **Documentation**: This file
- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **Workflow Diagram**: [WORKFLOW-DIAGRAM.md](WORKFLOW-DIAGRAM.md)
- **State Management**: [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md)
- **Agent Definitions**: `.claude/agents/`
- **Skills Reference**: `.claude/skills/README.md`

---

**End of Documentation**
