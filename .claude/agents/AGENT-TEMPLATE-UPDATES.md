# Agent Template Updates for StateManager Integration

## Add to All Stage Agents

All stage agents (requirements, architecture, planning, implementation, review, verification, pr) should include this section:

### State Management Section

Add after the "Output" section in each agent:

```markdown
## State Management

This agent uses the StateManager API for workflow state tracking.

### Initialize State Access

```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();
```

### Read Workflow State

```javascript
// Get current workflow
const workflow = await sm.getWorkflow(storyId);

// Check previous stages
const prevStage = workflow.stages.{previous-stage-name};
const prevArtifact = prevStage.artifact; // Path to previous artifact

// Get workflow metadata
const currentStage = workflow.currentStage;
const status = workflow.status;
```

### Update Stage Status

At different points in execution:

**When starting work:**
```javascript
await sm.updateStage(storyId, '{stage-name}', {
  status: 'in_progress',
  generatedAt: new Date().toISOString()
});
```

**When artifact is created:**
```javascript
await sm.updateStage(storyId, '{stage-name}', {
  status: 'draft',
  artifact: 'docs/workflows/${storyId}/{stage-name}.md',
  summary: 'Brief 1-2 sentence summary of what was produced'
});
```

**After human approval** (done by orchestrator):
```javascript
await sm.updateStage(storyId, '{stage-name}', {
  status: 'completed',
  approvedAt: new Date().toISOString()
});
```

**On error:**
```javascript
await sm.updateStage(storyId, '{stage-name}', {
  status: 'failed',
  comments: [...existingComments, errorMessage]
});
```

### CLI Alternative

If running as standalone, use the CLI tool:

```bash
# Update stage status
node .claude/skills/workflow-state-manager.js update-stage ${STORY_ID} {stage-name} '{"status":"draft","artifact":"path/to/artifact.md"}'

# Or set active and use simpler commands
node .claude/skills/workflow-state-manager.js set-active ${STORY_ID}
node .claude/skills/workflow-state-manager.js update status in_progress
```

### Integration Points

**At Agent Start:**
1. Read workflow state to get story context and previous artifacts
2. Update stage status to 'in_progress'

**During Execution:**
3. Reference artifacts from previous stages via state
4. Add comments to stage.comments array as needed

**At Agent End:**
5. Create artifact file
6. Update stage with artifact path and status 'draft'
7. Add summary to stage.summary field

**Error Handling:**
8. On any error, update stage status to 'failed'
9. Add error details to stage.comments
```

## Agent-Specific Updates

### Requirements Agent

**Input Sources from State:**
- None (first stage)

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'requirements', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/requirements.md`,
  summary: `Extracted ${businessReqCount} business requirements, ${functionalReqCount} functional requirements, ${acceptanceCriteriaCount} acceptance criteria`,
  generatedAt: new Date().toISOString()
});
```

### Architecture Agent

**Input Sources from State:**
```javascript
const requirementsStage = workflow.stages.requirements;
const requirementsDoc = requirementsStage.artifact; // Read this first
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'architecture', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/architecture.md`,
  summary: `Designed ${componentCount} components, ${interfaceCount} interfaces, identified ${riskCount} risks`,
  generatedAt: new Date().toISOString()
});
```

### Planning Agent

**Input Sources from State:**
```javascript
const requirementsStage = workflow.stages.requirements;
const architectureStage = workflow.stages.architecture;
const requirementsDoc = requirementsStage.artifact;
const architectureDoc = architectureStage.artifact;
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'planning', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/impl-plan.md`,
  summary: `Created ${taskCount} tasks, estimated ${effort}, identified ${dependencyCount} dependencies`,
  generatedAt: new Date().toISOString()
});
```

### Implementation Agent

**Input Sources from State:**
```javascript
const planningStage = workflow.stages.planning;
const planDoc = planningStage.artifact;
const architectureDoc = workflow.stages.architecture.artifact;
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'implementation', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/implementation-report.md`,
  summary: `Modified ${filesModified} files, added ${linesAdded} lines, created ${testsAdded} tests`,
  generatedAt: new Date().toISOString()
});
```

### Review Agent

**Input Sources from State:**
```javascript
const implementationStage = workflow.stages.implementation;
const implReport = implementationStage.artifact;
const requirementsDoc = workflow.stages.requirements.artifact;
const architectureDoc = workflow.stages.architecture.artifact;
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'review', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/review-report.md`,
  summary: `Found ${issueCount} issues (${criticalCount} critical, ${minorCount} minor), test coverage ${coveragePercent}%`,
  generatedAt: new Date().toISOString()
});
```

### Verification Agent

**Input Sources from State:**
```javascript
const reviewStage = workflow.stages.review;
const reviewReport = reviewStage.artifact;
const requirementsDoc = workflow.stages.requirements.artifact;
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'verification', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/verification-report.md`,
  summary: `${passedCriteria}/${totalCriteria} acceptance criteria passed, all tests passing`,
  generatedAt: new Date().toISOString()
});
```

### PR Agent

**Input Sources from State:**
```javascript
const allStages = workflow.stages;
// Read all artifacts to create comprehensive PR description
```

**Output Updates:**
```javascript
await sm.updateStage(storyId, 'pr', {
  status: 'draft',
  artifact: `docs/workflows/${storyId}/pr-description.md`,
  summary: `PR created: ${prUrl}`,
  generatedAt: new Date().toISOString()
});

// Also update workflow with PR info
await sm.updateWorkflow(storyId, {
  prUrl: prUrl,
  branch: branchName
});
```

## Implementation Checklist

For each agent file:
- [ ] Add State Management section
- [ ] Add StateManager import example
- [ ] Document which previous stages to read
- [ ] Add status update examples
- [ ] Update output section to include state updates
- [ ] Add error handling state updates
