---
name: agent-coordinator
description: "Coordinate agent invocations - invoke specialized agents, monitor execution, validate outputs, handle failures"
---

# Agent Coordinator Skill

## Purpose

Reusable skill for coordinating specialized agent invocations in any Agentic SDLC workflow. Handles agent invocation, execution monitoring, output validation, and error recovery.

## Usage

Invoke this skill whenever you need to:
- Invoke a specialized agent
- Monitor agent execution
- Validate agent output
- Handle agent failures
- Retry agent execution

## Operations

### 1. Invoke Agent

**Usage**: `agent-coordinator invoke <agent-name> <story-id> [input-artifact]`

**Action**: Invokes specialized agent with proper context

**Example**:
```bash
agent-coordinator invoke requirements WA-123
agent-coordinator invoke architecture WA-123 .artifacts/WA-123-requirements.md
```

**Process**:
1. Reads agent definition from `.claude/agents/{agent-name}-agent.md`
2. Prepares agent context (story ID, input artifacts)
3. Invokes agent via Agent tool
4. Monitors execution
5. Validates output
6. Returns result

**Output**:
```
🤖 Invoking Requirements Agent

Agent: requirements-agent
Story: WA-123
Input: Jira Story Details

Execution Status:
⏳ Starting agent...
⏳ Agent running...
✅ Agent completed successfully

Output:
  Artifact: .artifacts/WA-123-requirements.md
  Size: 12.5 KB
  Validation: Passed

Duration: 25 minutes
```

### 2. Invoke by Stage

**Usage**: `agent-coordinator stage <stage-name> <story-id>`

**Action**: Invokes appropriate agent for workflow stage

**Stages**: requirements, architecture, planning, implementation, review, verification, pr

**Example**:
```bash
agent-coordinator stage requirements WA-123
agent-coordinator stage architecture WA-123
```

**Automatically**:
- Determines correct agent for stage
- Identifies required input artifacts
- Passes correct context
- Validates stage-specific output

### 3. Monitor Agent

**Usage**: `agent-coordinator monitor <agent-id>`

**Action**: Monitors running agent and reports status

**Example**:
```bash
agent-coordinator monitor agent-abc123
```

**Output**:
```
Agent Monitoring

Agent ID: agent-abc123
Agent: Planning Agent
Status: Running
Progress: 65%
Started: 2026-05-31T12:00:00Z
Elapsed: 12 minutes

Current Activity:
  Breaking down architecture into tasks
  Analyzing dependencies
  Estimating complexity

Estimated Completion: 3 minutes
```

### 4. Validate Agent Output

**Usage**: `agent-coordinator validate <agent-name> <output-path>`

**Action**: Validates agent output meets requirements

**Example**:
```bash
agent-coordinator validate requirements .artifacts/WA-123-requirements.md
```

**Checks**:
- Output artifact exists
- Artifact not empty
- Required sections present
- Format correct
- Quality score acceptable

**Output**:
```
✅ Agent Output Valid

Agent: Requirements Agent
Output: .artifacts/WA-123-requirements.md

Validation Results:
  ✅ Artifact exists
  ✅ File size appropriate (12.5 KB)
  ✅ All required sections present
  ✅ Format correct (Markdown)
  ✅ Quality score: 95/100

Status: Ready for approval gate
```

**Or if invalid**:
```
❌ Agent Output Invalid

Agent: Requirements Agent
Output: .artifacts/WA-123-requirements.md

Validation Errors:
  ❌ Missing section: Acceptance Criteria
  ⚠️ Business Requirements section empty
  ⚠️ Quality score: 62/100

Status: Agent needs to re-run or output needs manual fixes
```

### 5. Handle Agent Failure

**Usage**: `agent-coordinator handle-failure <agent-name> <error-message>`

**Action**: Processes agent failure and provides recovery options

**Example**:
```bash
agent-coordinator handle-failure planning "Agent timeout after 5 minutes"
```

**Output**:
```
❌ Agent Failure Detected

Agent: Planning Agent
Error: Agent timeout after 5 minutes
Failed At: 2026-05-31T12:05:00Z

Failure Analysis:
  Type: Timeout
  Severity: Medium
  Recoverable: Yes

Recovery Options:

1️⃣ Retry with Extended Timeout
   Command: agent-coordinator retry planning WA-123 --timeout=15m
   Success Probability: High

2️⃣ Retry with Different Input
   • Review input artifact
   • Make corrections
   • Retry agent

3️⃣ Manual Creation
   • Create artifact manually
   • Use template from .claude/agents/planning-agent.md
   • Validate with: artifact-validator stage planning <path>

4️⃣ Skip Stage (Not Recommended)
   • Only if agent repeatedly fails
   • Requires manual artifact creation
   • Must meet validation requirements

Logs: Check .artifacts/audit-log.md for details
```

### 6. Retry Agent

**Usage**: `agent-coordinator retry <agent-name> <story-id> [options]`

**Action**: Retries failed agent with optional parameters

**Options**:
- `--timeout=<duration>` - Custom timeout
- `--input=<path>` - Different input artifact
- `--force` - Ignore previous output

**Example**:
```bash
agent-coordinator retry architecture WA-123 --timeout=20m
```

**Output**:
```
🔄 Retrying Architecture Agent

Retry Attempt: 2
Story: WA-123
Timeout: 20 minutes (increased from 10)

Previous Failure:
  Error: Timeout
  Occurred: 2026-05-31T11:10:00Z

Retry Status:
⏳ Starting agent (attempt 2)...
⏳ Agent running...
✅ Agent completed successfully!

Output:
  Artifact: .artifacts/WA-123-architecture.md
  Size: 15.8 KB
  Validation: Passed

Duration: 18 minutes
Success: Retry successful after 1 failure
```

### 7. Get Agent Status

**Usage**: `agent-coordinator status <agent-id>`

**Action**: Returns current status of agent execution

**Example**:
```bash
agent-coordinator status agent-abc123
```

**Output**:
```
Agent Status Report

Agent ID: agent-abc123
Agent Type: Implementation Agent
Story: WA-123

Status: Running
Progress: 80%

Timeline:
  Started: 2026-05-31T13:00:00Z
  Elapsed: 2 hours 15 minutes
  Estimated Remaining: 15 minutes

Current Phase: Writing Tests
  • Unit tests: 12/15 completed
  • Integration tests: 6/8 completed
  • Functional tests: 3/5 completed

Resources:
  Memory: 256 MB
  CPU: 25%

Health: Good
```

### 8. Get Agent History

**Usage**: `agent-coordinator history <story-id>`

**Action**: Returns history of all agent invocations for story

**Example**:
```bash
agent-coordinator history WA-123
```

**Output**:
```
Agent History - WA-123

Total Invocations: 8
Success Rate: 87.5% (7/8)

Timeline:

1. Requirements Agent
   Started: 2026-05-31T10:05:00Z
   Completed: 2026-05-31T10:30:00Z
   Duration: 25 minutes
   Status: ✅ Success
   Output: .artifacts/WA-123-requirements.md

2. Architecture Agent
   Started: 2026-05-31T10:40:00Z
   Failed: 2026-05-31T11:10:00Z (Timeout)
   Duration: 30 minutes
   Status: ❌ Failed
   Retry: Required

3. Architecture Agent (Retry)
   Started: 2026-05-31T11:45:00Z
   Completed: 2026-05-31T12:03:00Z
   Duration: 18 minutes
   Status: ✅ Success
   Output: .artifacts/WA-123-architecture.md

...

Summary:
  Fastest: PR Agent (15 min)
  Slowest: Implementation Agent (2h 30m)
  Most Retries: Review Agent (2 retries)
  Average Duration: 47 minutes
```

## Agent Invocation Pattern

### Standard Invocation

```javascript
// Prepare agent prompt
const prompt = `You are the ${agentName} Agent for the Agentic SDLC workflow.

Story ID: ${storyId}
Story Title: ${storyTitle}

${inputContext}

Your task: ${agentTask}

Follow the instructions in .claude/agents/${agentName}-agent.md

Output: Create .artifacts/${storyId}-${outputFileName}.md with ${outputDescription}`;

// Invoke agent
Agent({
  description: `${stageName} stage for ${storyId}`,
  subagent_type: "general-purpose",
  prompt: prompt
});
```

### With Input Artifact

```javascript
// Read input artifact first
const inputArtifact = Read({
  file_path: inputArtifactPath
});

// Include in prompt
const prompt = `...

Input Artifact:
${inputArtifact}

Your task: Analyze the above artifact and ${task}

...`;
```

### With Retry Logic

```javascript
let retries = 0;
const maxRetries = 3;

while (retries < maxRetries) {
  try {
    const result = invokeAgent();
    if (validateOutput(result)) {
      return result;
    }
    retries++;
  } catch (error) {
    retries++;
    if (retries >= maxRetries) {
      handleFailure(error);
      return null;
    }
    wait(retryDelay);
  }
}
```

## Agent Context

### Required Context

Every agent invocation includes:
- Story ID
- Story title
- Story type
- Current stage
- Input artifacts (if applicable)
- Agent definition reference

### Optional Context

- Previous stage outputs
- Repository structure
- Coding conventions
- Test patterns
- Configuration

## Output Validation

### Validation Checklist

After agent completes:
- ✅ Output artifact exists
- ✅ Output artifact not empty
- ✅ Required sections present
- ✅ Proper markdown format
- ✅ Quality score acceptable
- ✅ Stage-specific validations pass

### Validation Failure Handling

If validation fails:
1. Log validation errors
2. Determine if retriable
3. Offer retry or manual fix
4. Update workflow state

## Error Handling

### Timeout

```
Agent timeout - increase timeout or simplify input
Recovery: Retry with longer timeout
```

### Out of Memory

```
Agent ran out of memory - reduce input size
Recovery: Chunk input or simplify task
```

### Invalid Output

```
Agent produced invalid output - validation failed
Recovery: Retry or manual fix
```

### Agent Crashed

```
Agent crashed unexpectedly
Recovery: Check logs, retry, or escalate
```

## Usage in Orchestrator

```javascript
// Invoke requirements agent
Skill({
  skill: "agent-coordinator",
  args: "invoke requirements WA-123"
});

// Invoke architecture agent with input
Skill({
  skill: "agent-coordinator",
  args: "stage architecture WA-123"
});

// Monitor running agent
Skill({
  skill: "agent-coordinator",
  args: "monitor agent-abc123"
});

// Validate output
const validation = Skill({
  skill: "agent-coordinator",
  args: "validate planning .artifacts/WA-123-implementation-plan.md"
});

// Handle failure
if (agentFailed) {
  Skill({
    skill: "agent-coordinator",
    args: `handle-failure planning "${errorMessage}"`
  });
}

// Retry
Skill({
  skill: "agent-coordinator",
  args: "retry architecture WA-123 --timeout=20m"
});
```

## Benefits

✅ **Consistent Invocation** - Standardized agent calls  
✅ **Error Recovery** - Automatic retry logic  
✅ **Validation** - Output quality assured  
✅ **Monitoring** - Track agent progress  
✅ **Debugging** - Detailed logs and history  

## Configuration

### Agent Timeouts

```json
{
  "agent_timeouts": {
    "requirements": "10m",
    "architecture": "15m",
    "planning": "10m",
    "implementation": "60m",
    "review": "20m",
    "verification": "15m",
    "pr": "5m"
  }
}
```

### Retry Settings

```json
{
  "retry": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay": "60s"
  }
}
```

### Validation Rules

```json
{
  "validation": {
    "strict_mode": true,
    "min_quality_score": 85,
    "required_sections_check": true
  }
}
```

---

**Skill**: agent-coordinator v1.0  
**Type**: Reusable utility  
**Compatible**: Any multi-agent workflow
