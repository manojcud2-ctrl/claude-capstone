# State Management - File-Per-Workflow

Scalable state management with individual workflow files and an active workflows index.

## Quick Start

```javascript
const StateManager = require('./.claude/state/StateManager');

const sm = new StateManager();

// Create workflow
await sm.createWorkflow('WA-100');

// Update workflow
await sm.updateWorkflow('WA-100', {
  currentStage: 'architecture',
  status: 'in_progress'
});

// Update specific stage
await sm.updateStage('WA-100', 'requirements', {
  status: 'completed',
  approvedAt: new Date().toISOString(),
  summary: 'Requirements approved'
});

// Get workflow
const workflow = await sm.getWorkflow('WA-100');

// Archive completed workflow
await sm.archiveWorkflow('WA-100');
```

## Migration from Monolithic State

```bash
# Migrate from old .artifacts/workflow-state.json
node .claude/state/migrate.js .artifacts/workflow-state.json

# Or with default path
node .claude/state/migrate.js
```

## Running Tests

```bash
cd .claude/state
npm test
npm run test:watch  # Watch mode
```

## Directory Structure

```
.claude/state/
├── index.json           # Active workflows index
├── workflows/           # Individual workflow files
│   ├── WA-46.json
│   ├── WA-47.json
│   └── WA-48.json
├── archive/             # Completed workflows
│   └── WA-45.json
├── StateManager.js      # Core state management class
├── migrate.js           # Migration utility
├── StateManager.test.js # Test suite
├── package.json
└── README.md
```

## Benefits

1. **Scalability**: No file size growth - one file per workflow
2. **Performance**: Load only active workflows
3. **Archival**: Move completed workflows out of active index
4. **Debugging**: Inspect/edit individual workflow files easily
5. **Concurrency**: Smaller surface area for conflicts

## Next Steps

Update orchestrator and agents to use StateManager:

```javascript
// Old
const state = JSON.parse(fs.readFileSync('.artifacts/workflow-state.json'));

// New
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();
const workflow = await sm.getWorkflow(jiraStoryId);
```
