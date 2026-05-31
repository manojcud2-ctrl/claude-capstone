---
name: agentic-sdlc
description: "Human-in-the-loop software delivery workflow using specialized agents"
version: "1.0"
---

# Agentic SDLC Workflow

## Overview

A complete software delivery lifecycle workflow that processes Jira stories through seven stages with mandatory human approval gates between each stage. Each stage is handled by a specialized agent, all coordinated by a master orchestrator.

## Workflow Architecture

```
                     ┌─────────────────────────┐
                     │   SDLC Orchestrator     │
                     │   (Master Controller)    │
                     └───────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
         ┌────────────┐   ┌────────────┐  ┌────────────┐
         │Requirements│   │Architecture│  │  Planning  │
         │   Agent    │   │   Agent    │  │   Agent    │
         └────────────┘   └────────────┘  └────────────┘
                │                │                │
                ▼                ▼                ▼
         [Requirements.md]  [Architecture.md] [Plan.md]
                │                │                │
                ▼                ▼                ▼
         ┌────────────┐   ┌────────────┐  ┌────────────┐
         │    HUMAN   │   │    HUMAN   │  │    HUMAN   │
         │  APPROVAL  │   │  APPROVAL  │  │  APPROVAL  │
         └────────────┘   └────────────┘  └────────────┘

                ┌────────────────┬────────────────┐
                │                │                │
                ▼                ▼                ▼
         ┌────────────┐   ┌────────────┐  ┌────────────┐
         │Implementation  │   Review   │  │Verification│
         │   Agent    │   │   Agent    │  │   Agent    │
         └────────────┘   └────────────┘  └────────────┘
                │                │                │
                ▼                ▼                ▼
         [Impl-Summary.md] [Review-Report.md] [Verification.md]
                │                │                │
                ▼                ▼                ▼
         ┌────────────┐   ┌────────────┐  ┌────────────┐
         │    HUMAN   │   │    HUMAN   │  │    HUMAN   │
         │  APPROVAL  │   │  APPROVAL  │  │  APPROVAL  │
         └────────────┘   └────────────┘  └────────────┘
                                 │
                                 ▼
                         ┌────────────┐
                         │  PR Agent  │
                         └────────────┘
                                 │
                                 ▼
                         [PR-Package.md]
```

## Workflow Stages

### Stage 1: Requirements Analysis

**Agent**: `requirements-agent`

**Purpose**: Extract and document comprehensive requirements from Jira story

**Input**: Jira Story ID

**Output**: `.artifacts/{storyId}-requirements.md`

**Activities**:
- Fetch Jira story details
- Extract business requirements
- Extract functional requirements
- Extract non-functional requirements
- Identify assumptions and open questions
- Create acceptance criteria

**Approval Gate**: Human reviews and approves requirements specification

---

### Stage 2: Architecture Design

**Agent**: `architecture-agent`

**Purpose**: Design technical solution based on requirements

**Input**: Requirements artifact

**Output**: `.artifacts/{storyId}-architecture.md`

**Activities**:
- Review requirements
- Analyze existing codebase
- Design technical solution
- Identify impacted modules
- Define interfaces and dependencies
- Assess risks
- Define testing strategy

**Approval Gate**: Human reviews and approves architecture design

---

### Stage 3: Implementation Planning

**Agent**: `planning-agent`

**Purpose**: Break down architecture into actionable implementation tasks

**Input**: Architecture artifact

**Output**: `.artifacts/{storyId}-implementation-plan.md`

**Activities**:
- Break solution into specific tasks
- Estimate complexity for each task
- Identify task dependencies
- Sequence tasks for execution
- Create detailed test plan
- Define deployment considerations

**Approval Gate**: Human reviews and approves implementation plan

---

### Stage 4: Implementation

**Agent**: `implementation-agent`

**Purpose**: Execute implementation plan by writing code and tests

**Input**: Implementation plan artifact

**Output**: `.artifacts/{storyId}-implementation-summary.md`

**Activities**:
- Follow implementation plan
- Write production code
- Write comprehensive tests
- Follow repository conventions
- Maintain code quality
- Run tests continuously
- Generate implementation summary

**Approval Gate**: Human reviews and approves implementation

---

### Stage 5: Code Review

**Agent**: `review-agent`

**Purpose**: Review implementation for quality, standards, and completeness

**Input**: Implementation summary + source code

**Output**: `.artifacts/{storyId}-review-report.md`

**Activities**:
- Review architecture compliance
- Check coding standards
- Assess code quality and maintainability
- Verify test coverage
- Check requirements coverage
- Identify issues and improvements
- Security and performance review

**Approval Gate**: Human reviews and addresses review findings

---

### Stage 6: Verification

**Agent**: `verification-agent`

**Purpose**: Verify all acceptance criteria met and requirements covered

**Input**: Review report + implementation

**Output**: `.artifacts/{storyId}-verification-report.md`

**Activities**:
- Verify acceptance criteria met
- Verify requirements coverage
- Run full test suite
- Verify test quality
- Check review findings addressed
- Perform manual testing if needed
- Final validation

**Approval Gate**: Human confirms verification passed

---

### Stage 7: PR Package Generation

**Agent**: `pr-agent`

**Purpose**: Generate comprehensive pull request package

**Input**: Verification report + all prior artifacts

**Output**: `.artifacts/{storyId}-pr-package.md`

**Activities**:
- Generate PR title and description
- Create changelog
- Create reviewer checklist
- Summarize testing evidence
- Generate release notes
- Compile comprehensive PR package

**Completion**: PR package ready for pull request creation

---

## Workflow State

### State File

**Location**: `.artifacts/workflow-state.json`

Tracks:
- Story ID and metadata
- Current stage
- Approved stages
- Status (InProgress|WaitingForApproval|Completed|Failed)
- Artifact paths
- Timestamps

**Example**:
```json
{
  "version": "1.0",
  "storyId": "PMX-123",
  "storyTitle": "Add weather forecast endpoint",
  "currentStage": "Planning",
  "status": "WaitingForApproval",
  "approvedStages": ["Requirements", "Architecture"],
  "startedAt": "2026-05-31T10:00:00Z",
  "lastUpdatedAt": "2026-05-31T12:30:00Z",
  "artifacts": {
    "requirements": ".artifacts/PMX-123-requirements.md",
    "architecture": ".artifacts/PMX-123-architecture.md",
    "plan": ".artifacts/PMX-123-implementation-plan.md"
  }
}
```

### Audit Trail

**Location**: `.artifacts/audit-log.md`

Records:
- All workflow actions
- Agent invocations and completions
- Approval and rejection decisions
- State transitions
- Timestamps and actors

## Commands

### Start Workflow

**Usage**: `start story PMX-123`

**Description**: Initialize workflow for a Jira story

**Actions**:
1. Create artifacts directory
2. Initialize workflow state
3. Initialize audit log
4. Fetch story from Jira
5. Invoke Requirements Agent
6. Display requirements
7. Wait for approval

---

### Approve Stage

**Usage**: `approve` or `approve requirements`

**Description**: Approve current stage and advance workflow

**Actions**:
1. Validate current artifact
2. Update workflow state
3. Log approval
4. Invoke next stage agent
5. Display next artifact
6. Wait for approval

---

### Reject Stage

**Usage**: `reject` or `reject planning - needs more detail`

**Description**: Reject current stage and request changes

**Actions**:
1. Log rejection with reason
2. Keep workflow in current stage
3. Display fix options
4. Wait for manual correction

---

### Check Status

**Usage**: `status` or `workflow status`

**Description**: Display current workflow progress

**Actions**:
1. Read workflow state
2. Display completed stages
3. Show current stage
4. List pending stages
5. Show next action needed

---

### Retry Stage

**Usage**: `retry architecture`

**Description**: Re-run current stage agent

**Actions**:
1. Identify current stage
2. Re-invoke stage agent
3. Generate new artifact
4. Display result
5. Wait for approval

---

## Approval Gates

Every stage ends with an approval gate:

```
┌─────────────────────────────────────┐
│  Stage Complete                      │
│                                      │
│  Artifact: .artifacts/PMX-123-*.md   │
│                                      │
│  Summary:                            │
│  - Key Point 1                       │
│  - Key Point 2                       │
│  - Key Point 3                       │
│                                      │
│  ⏸ Workflow Paused                   │
│                                      │
│  Waiting for Approval                │
│                                      │
│  Available Commands:                 │
│  • approve - Continue to next stage  │
│  • reject  - Request changes         │
│  • status  - View progress           │
└─────────────────────────────────────┘
```

**Human Responsibilities**:
- Review artifact contents
- Verify quality and completeness
- Approve if satisfactory
- Reject if changes needed
- Provide feedback on rejection

**Orchestrator Responsibilities**:
- Never auto-approve (always wait for human)
- Validate artifact before allowing approval
- Update state on approval
- Log decision to audit trail
- Proceed to next stage or wait for fixes

## Artifacts

All artifacts stored in `.artifacts/` directory:

```
.artifacts/
├── workflow-state.json           # Workflow state
├── audit-log.md                  # Audit trail
├── PMX-123-requirements.md       # Stage 1 output
├── PMX-123-architecture.md       # Stage 2 output
├── PMX-123-implementation-plan.md   # Stage 3 output
├── PMX-123-implementation-summary.md # Stage 4 output
├── PMX-123-review-report.md      # Stage 5 output
├── PMX-123-verification-report.md   # Stage 6 output
└── PMX-123-pr-package.md         # Stage 7 output
```

Each artifact:
- Follows structured markdown format
- Contains complete information for its stage
- Serves as input to next stage
- Is human-readable and reviewable
- Is preserved for audit trail

## Agent Communication

**Rule**: Agents never communicate directly

**Pattern**: All communication flows through orchestrator

```
User → Orchestrator → Agent → Artifact → Orchestrator → User
```

**Orchestrator acts as**:
- Command router
- State manager
- Agent invoker
- Artifact validator
- Approval gate enforcer
- Audit logger

**Agents are**:
- Stateless (don't maintain workflow state)
- Focused (single responsibility per agent)
- Input-driven (consume artifacts)
- Output-focused (produce artifacts)
- Independent (don't invoke other agents)

## Error Handling

### Agent Failure

**Symptoms**: Agent crashes, hangs, or produces invalid output

**Orchestrator Actions**:
1. Detect failure
2. Log error to audit trail
3. Update state to Failed
4. Display error to user
5. Provide recovery options:
   - Retry agent
   - Manual artifact creation
   - Skip to manual step
   - Abort workflow

### Artifact Validation Failure

**Symptoms**: Artifact missing, empty, or malformed

**Orchestrator Actions**:
1. Run validation checks
2. Report specific failures
3. Keep workflow in current stage
4. Provide options:
   - Re-run agent
   - Edit artifact manually
   - View artifact for debugging

### State Corruption

**Symptoms**: Invalid workflow state

**Orchestrator Actions**:
1. Detect invalid state
2. Log error
3. Attempt recovery
4. Request manual intervention if cannot recover

## Best Practices

### For Users

1. **Review Carefully**: Read each artifact thoroughly before approving
2. **Provide Context**: Give clear rejection reasons
3. **Check Artifacts**: Verify artifact quality, don't just approve
4. **Use Status**: Check workflow progress regularly
5. **Document Changes**: If editing artifacts manually, document why

### For Agents

1. **Follow Specifications**: Use defined artifact templates
2. **Be Complete**: Include all required sections
3. **Be Clear**: Write human-readable content
4. **Validate Input**: Check input artifacts before processing
5. **Report Issues**: Flag problems clearly

### For Orchestrator

1. **Enforce Gates**: Never skip approval gates
2. **Validate Artifacts**: Check completeness before allowing approval
3. **Maintain State**: Keep workflow state current
4. **Log Everything**: Maintain complete audit trail
5. **Be Transparent**: Show user what's happening

## Extending the Workflow

### Adding New Stage

1. Create agent definition in `.claude/agents/{stage}-agent.md`
2. Update orchestrator to invoke new agent
3. Define artifact format for stage output
4. Add approval gate after stage
5. Update workflow documentation

### Customizing Agents

1. Edit agent definition in `.claude/agents/`
2. Modify responsibilities and process
3. Update artifact template
4. Test with orchestrator

### Modifying Approval Logic

1. Edit orchestrator agent
2. Update approval gate logic
3. Maintain human-in-the-loop principle
4. Update documentation

## Workflow Example

### Complete Flow

```
User: "start story PMX-123"

[Requirements Agent runs]
Orchestrator: "Requirements complete. Approve?"
User: "approve"

[Architecture Agent runs]
Orchestrator: "Architecture complete. Approve?"
User: "reject - missing database design"

[User edits artifact or retries]
User: "retry architecture"

[Architecture Agent re-runs]
Orchestrator: "Architecture complete. Approve?"
User: "approve"

[Planning Agent runs]
Orchestrator: "Planning complete. Approve?"
User: "approve"

[Implementation Agent runs]
Orchestrator: "Implementation complete. Approve?"
User: "approve"

[Review Agent runs]
Orchestrator: "Review complete. Approve?"
User: "approve"

[Verification Agent runs]
Orchestrator: "Verification complete. Approve?"
User: "approve"

[PR Agent runs]
Orchestrator: "PR package complete. Workflow finished!"
```

## Success Criteria

Workflow successful when:
- ✅ All 7 stages completed
- ✅ All approval gates passed
- ✅ All artifacts generated
- ✅ All requirements met
- ✅ All tests passing
- ✅ PR package ready
- ✅ Audit trail complete

## Metrics

Track:
- Time per stage
- Number of rejections per stage
- Number of agent retries
- Total workflow duration
- Approval gate wait times
- Issue detection by stage

---

**Workflow**: Agentic SDLC v1.0
**Paradigm**: Human-in-the-Loop Software Delivery
**Control**: Master Orchestrator Pattern
**Principle**: Specialized Agents + Approval Gates
