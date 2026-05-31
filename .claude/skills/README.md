# Reusable SDLC Skills

This directory contains reusable skills that can be invoked by the SDLC Orchestrator and other workflows. These skills abstract common patterns and operations into modular, testable components.

## Available Skills

### 1. Code Generator

**File**: `code-generator.md`

**Purpose**: Generate production code following best practices

**Key Operations**:
- `function` - Generate functions with documentation
- `class` - Generate classes with methods
- `endpoint` - Generate API endpoints
- `crud` - Generate CRUD operations
- `refactor` - Apply best practices
- `error-handler` - Generate error handling
- `validator` - Generate validation schemas
- `security-scan` - Scan for vulnerabilities

**Usage Example**:
```bash
code-generator function validateEmail "Validates email format" javascript
code-generator endpoint POST /api/weather "Create weather record"
code-generator security-scan src/api/weather.js
```

**Benefits**:
- Consistent code quality
- Built-in best practices
- Security by default
- Well-documented output

---

### 2. Test Generator

**File**: `test-generator.md`

**Purpose**: Generate and run comprehensive test suites

**Key Operations**:
- `unit` - Generate unit tests
- `integration` - Generate integration tests
- `functional` - Generate functional tests
- `run` - Execute test suites
- `coverage` - Check code coverage
- `suite` - Generate complete test suite
- `mock` - Generate mock data
- `analyze` - Analyze test quality

**Usage Example**:
```bash
test-generator unit validateEmail src/utils/validation.js
test-generator integration WeatherAPI "Tests API integration"
test-generator run all --coverage
test-generator coverage 90
```

**Benefits**:
- High test coverage
- Best testing practices
- Test isolation
- Fast feedback

---

### 3. Workflow State Manager

**File**: `workflow-state-manager.md`

**Purpose**: Manage workflow state operations - initialize, read, update, validate state files

**Key Operations**:
- `init` - Initialize new workflow state
- `read` - Read entire state or specific field
- `update` - Update specific field
- `append` - Add to array fields
- `validate` - Validate state structure
- `progress` - Calculate workflow progress
- `status` - Get current status

**Usage Example**:
```bash
workflow-state init WA-123 "Add weather endpoint" Feature
workflow-state update status WaitingForApproval
workflow-state append approvedStages Requirements
workflow-state progress
```

**Benefits**:
- Consistent state management
- Atomic operations
- Automatic backups
- Validation built-in

---

### 4. Artifact Validator

**File**: `artifact-validator.md`

**Purpose**: Validate workflow artifacts for completeness and quality

**Key Operations**:
- `exists` - Check file exists
- `complete` - Verify not empty
- `sections` - Check required sections
- `stage` - Full stage validation
- `metrics` - Get artifact metrics
- `compare` - Compare artifacts

**Usage Example**:
```bash
artifact-validator exists .artifacts/WA-123-requirements.md
artifact-validator stage requirements .artifacts/WA-123-requirements.md
artifact-validator metrics .artifacts/WA-123-architecture.md
```

**Benefits**:
- Quality assurance
- Early issue detection
- Automated validation
- Stage-specific rules

---

### 5. Audit Logger

**File**: `audit-logger.md`

**Purpose**: Manage audit trail for compliance and debugging

**Key Operations**:
- `init` - Initialize audit log
- `log` - Log generic action
- `approve` - Log approval
- `reject` - Log rejection
- `error` - Log error
- `agent` - Log agent activity
- `query` - Search log
- `timeline` - Display timeline
- `stats` - Get statistics

**Usage Example**:
```bash
audit-logger init WA-123
audit-logger agent Requirements started
audit-logger approve Requirements .artifacts/WA-123-requirements.md Architecture
audit-logger timeline
```

**Benefits**:
- Complete history
- Compliance ready
- Debugging aid
- Analytics enabled

---

### 6. Approval Gate Handler

**File**: `approval-gate-handler.md`

**Purpose**: Manage human approval gates

**Key Operations**:
- `create` - Create approval gate
- `summary` - Display artifact summary
- `prompt` - Collect decision
- `enforce` - Validate before approval
- `approve` - Handle approval
- `reject` - Handle rejection
- `status` - Get gate status
- `metrics` - Get gate metrics

**Usage Example**:
```bash
approval-gate create Requirements .artifacts/WA-123-requirements.md
approval-gate enforce Requirements .artifacts/WA-123-requirements.md
approval-gate prompt Requirements
approval-gate approve Requirements .artifacts/WA-123-requirements.md Architecture
```

**Benefits**:
- Consistent gates
- Validation enforced
- User-friendly
- Audit integration

---

### 7. Jira Integrator

**File**: `jira-integrator.md`

**Purpose**: Interact with Jira to fetch and update issues, stories, and workflow

**Key Operations**:
- `get-issue` - Fetch issue details
- `get-issue-expanded` - Fetch with expanded fields (changelog, operations)
- `update-issue` - Update issue fields
- `transition-issue` - Move issue through workflow
- `search-jql` - Search using JQL queries
- `add-comment` - Add comment to issue
- `get-subtasks` - Get issue subtasks

**Usage Example**:
```bash
jira-integrator get-issue WA-46
jira-integrator get-issue-expanded WA-46
jira-integrator add-comment WA-46 "Requirements extracted"
jira-integrator search-jql "project = WA AND status = 'To Do'"
```

**Benefits**:
- Centralized Jira access
- Consistent error handling
- ADF format parsing helpers
- Reusable across agents
- Environment-based config

---

### 8. GitHub Integrator

**File**: `github-integrator.md`

**Purpose**: Interact with GitHub via MCP or gh CLI

**Key Operations**:
- `create-pr` - Create pull request
- `get-pr` - Get PR information
- `list-prs` - List pull requests
- `add-reviewers` - Add reviewers to PR
- `add-labels` - Add labels to PR
- `check-pr` - Check CI/CD status
- `repo-info` - Get repository info

**Usage Example**:
```bash
github-integrator create-pr "feat: Add endpoint" "$(cat pr-body.md)" "feature/branch" "main"
github-integrator add-reviewers 123 "alice,bob"
github-integrator check-pr 123
```

**Benefits**:
- Multiple integration methods (MCP, gh CLI, manual)
- Auto-detection of available tools
- Graceful fallbacks
- Complete GitHub API coverage

---

### 8. Agent Coordinator

**File**: `agent-coordinator.md`

**Purpose**: Coordinate specialized agent invocations

**Key Operations**:
- `invoke` - Invoke agent
- `stage` - Invoke by stage
- `monitor` - Monitor execution
- `validate` - Validate output
- `handle-failure` - Process failure
- `retry` - Retry failed agent
- `status` - Get agent status
- `history` - Get invocation history

**Usage Example**:
```bash
agent-coordinator invoke requirements WA-123
agent-coordinator stage architecture WA-123
agent-coordinator validate planning .artifacts/WA-123-implementation-plan.md
agent-coordinator retry architecture WA-123 --timeout=20m
```

**Benefits**:
- Consistent invocation
- Error recovery
- Output validation
- Progress monitoring

---

## How to Use Skills

### From Orchestrator

```javascript
// Invoke skill via Skill tool
Skill({
  skill: "workflow-state-manager",
  args: "init WA-123 'Add weather endpoint' Feature"
});

// Get result
const stage = Skill({
  skill: "workflow-state-manager",
  args: "read currentStage"
});

// Chain skills
Skill({ skill: "audit-logger", args: "init WA-123" });
Skill({ skill: "workflow-state-manager", args: "init WA-123 ..." });
Skill({ skill: "agent-coordinator", args: "invoke requirements WA-123" });
```

### From Commands

Commands can use skills internally:

```bash
# start-story command uses:
workflow-state init <story-id>
audit-logger init <story-id>
agent-coordinator invoke requirements <story-id>

# approve command uses:
workflow-state update status WaitingForApproval
workflow-state append approvedStages <stage>
audit-logger approve <stage>
agent-coordinator invoke <next-stage>

# status command uses:
workflow-state read
workflow-state progress
```

## Skill Composition

Skills can be composed to create complex operations:

```javascript
// Create approval gate workflow
function createApprovalGate(stage, artifactPath) {
  // Validate artifact
  Skill({
    skill: "artifact-validator",
    args: `stage ${stage} ${artifactPath}`
  });
  
  // Create gate
  Skill({
    skill: "approval-gate-handler",
    args: `create ${stage} ${artifactPath}`
  });
  
  // Wait for decision
  const decision = Skill({
    skill: "approval-gate-handler",
    args: `prompt ${stage}`
  });
  
  // Handle decision
  if (decision === "approve") {
    Skill({
      skill: "workflow-state-manager",
      args: `append approvedStages ${stage}`
    });
    Skill({
      skill: "audit-logger",
      args: `approve ${stage} ${artifactPath}`
    });
  } else {
    Skill({
      skill: "audit-logger",
      args: `reject ${stage} "${reason}" ${artifactPath}`
    });
  }
}
```

## Benefits of Skills

### Modularity

Each skill has a single, well-defined responsibility.

### Reusability

Skills can be used across multiple workflows and projects.

### Testability

Skills can be tested independently.

### Maintainability

Changes to a skill propagate to all users.

### Composability

Skills can be combined to create complex behaviors.

## Creating New Skills

### Skill Template

```markdown
---
name: skill-name
description: "Brief description of skill purpose"
---

# Skill Name

## Purpose

Detailed purpose and use cases

## Usage

When to invoke this skill

## Operations

### 1. Operation Name

**Usage**: `skill-name operation <args>`

**Action**: What it does

**Example**: Example usage

**Output**: Expected output

## Implementation

How it works

## Benefits

Why use this skill
```

### Guidelines

1. **Single Responsibility** - One clear purpose
2. **Clear Interface** - Documented operations
3. **Error Handling** - Handle all error cases
4. **Validation** - Validate inputs
5. **Documentation** - Comprehensive docs
6. **Examples** - Show usage patterns

## Skill Dependencies

### Internal Dependencies

Skills can use other skills:
- `approval-gate-handler` uses `artifact-validator`
- `agent-coordinator` uses `audit-logger`

### External Dependencies

Skills may require:
- Workflow state file
- Audit log file
- Artifact files
- Agent definitions

## Testing Skills

### Manual Testing

```bash
# Test workflow-state-manager
workflow-state init TEST-001 "Test Story" Feature
workflow-state read
workflow-state update status WaitingForApproval
workflow-state validate

# Test artifact-validator
artifact-validator exists .artifacts/TEST-001-requirements.md
artifact-validator complete .artifacts/TEST-001-requirements.md

# Test audit-logger
audit-logger init TEST-001
audit-logger log "Test Action" "Success" "Testing skill"
audit-logger timeline
```

### Integration Testing

Test skills together in complete workflow:

```bash
# Start workflow
workflow-state init TEST-001
audit-logger init TEST-001
agent-coordinator invoke requirements TEST-001

# Create approval gate
artifact-validator stage requirements .artifacts/TEST-001-requirements.md
approval-gate create requirements .artifacts/TEST-001-requirements.md

# Approve
audit-logger approve requirements .artifacts/TEST-001-requirements.md
workflow-state append approvedStages Requirements
```

## Skill Versioning

Skills are versioned:
```markdown
**Skill**: skill-name v1.0
```

Version format: `v<major>.<minor>`

Breaking changes increment major version.

## Extension Points

### Custom Operations

Add new operations to existing skills.

### Custom Validation

Add project-specific validation rules.

### Custom Formatters

Add custom output formats.

### Integrations

Connect skills to external systems.

## Best Practices

1. **Always Validate** - Check inputs before processing
2. **Log Everything** - Use audit-logger for traceability
3. **Handle Errors** - Provide clear error messages
4. **Use Skills** - Don't duplicate skill logic
5. **Document Changes** - Update docs when modifying skills

## Skill Integration Examples

### Complete Implementation Flow

```javascript
// 1. Generate production code
Skill({
  skill: "code-generator",
  args: "endpoint POST /api/weather 'Create weather record'"
});

// 2. Generate tests for the code
Skill({
  skill: "test-generator",
  args: "unit createWeather src/api/weather.js"
});

Skill({
  skill: "test-generator",
  args: "integration WeatherAPI 'POST /api/weather tests'"
});

// 3. Run tests with coverage
Skill({
  skill: "test-generator",
  args: "run all --coverage"
});

// 4. Validate artifact quality
Skill({
  skill: "artifact-validator",
  args: "stage implementation .artifacts/WA-123-implementation-summary.md"
});

// 5. Security scan
Skill({
  skill: "code-generator",
  args: "security-scan src/api/weather.js"
});

// 6. Update workflow state
Skill({
  skill: "workflow-state-manager",
  args: "update status WaitingForApproval"
});

// 7. Log to audit trail
Skill({
  skill: "audit-logger",
  args: "agent Implementation completed Success"
});
```

## Future Skills

Potential future skills:
- `notification-manager` - Send notifications
- `metrics-collector` - Collect workflow metrics
- `report-generator` - Generate reports
- `jira-integrator` - Jira integration
- `github-integrator` - GitHub integration
- `documentation-generator` - Generate API docs
- `deployment-manager` - Manage deployments

---

**Skills Directory**: v1.0  
**Total Skills**: 8  
**Compatible**: Any Agentic SDLC workflow

## MCP Integration

The framework supports Model Context Protocol (MCP) for seamless integrations:

**GitHub MCP Server**:
- Native pull request creation
- Repository management
- Issue tracking
- File operations

**Setup MCP**:
1. Add GitHub MCP server to configuration
2. Provide `GITHUB_TOKEN` environment variable
3. Skills automatically detect and use MCP tools

**Fallback Chain**:
```
MCP Tools (preferred) → CLI Tools (fallback) → Manual (last resort)
```

Skills like `github-integrator` automatically select the best available method.
