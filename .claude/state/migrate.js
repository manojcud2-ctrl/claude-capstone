#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const StateManager = require('./StateManager');

/**
 * Migration script: monolithic state.json -> file-per-workflow
 *
 * Usage: node .claude/state/migrate.js [path-to-old-state.json]
 */

async function migrate(oldStatePath = '.artifacts/workflow-state.json') {
  console.log('🔄 Starting migration to file-per-workflow state management...\n');

  // Read old state
  let oldState;
  try {
    const data = await fs.readFile(oldStatePath, 'utf8');
    oldState = JSON.parse(data);
    console.log(`✅ Loaded old state from: ${oldStatePath}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`❌ Old state file not found: ${oldStatePath}`);
      console.log('   Nothing to migrate.');
      return;
    }
    throw error;
  }

  // Validate old state format
  if (!oldState.workflows || typeof oldState.workflows !== 'object') {
    console.log('❌ Invalid state format: missing "workflows" object');
    return;
  }

  const workflowIds = Object.keys(oldState.workflows);
  if (workflowIds.length === 0) {
    console.log('⚠️  No workflows found in old state. Nothing to migrate.');
    return;
  }

  console.log(`📦 Found ${workflowIds.length} workflow(s) to migrate\n`);

  // Initialize new state manager
  const stateManager = new StateManager();
  await stateManager.initialize();
  console.log('✅ Initialized new state directory: .claude/state/\n');

  // Migrate each workflow
  for (const storyId of workflowIds) {
    const oldWorkflow = oldState.workflows[storyId];
    console.log(`  Migrating: ${storyId}...`);

    // Create new workflow structure
    const now = new Date().toISOString();
    const newWorkflow = {
      jiraStoryId: storyId,
      currentStage: oldWorkflow.currentStage,
      status: mapStatus(oldWorkflow.stages[oldWorkflow.currentStage]?.status),
      createdAt: oldWorkflow.stages.requirements?.generatedAt || now,
      lastUpdated: oldWorkflow.lastUpdated || now,
      stages: {}
    };

    // Migrate stages
    for (const [stageName, stageData] of Object.entries(oldWorkflow.stages)) {
      newWorkflow.stages[stageName] = {
        status: stageData.status || 'pending',
        artifact: stageData.artifact || null,
        comments: stageData.comments || [],
        generatedAt: stageData.generatedAt || null,
        approvedAt: stageData.approvedAt || null,
        summary: stageData.summary || ''
      };
    }

    // Write workflow file
    const workflowPath = path.join('.claude/state/workflows', `${storyId}.json`);
    await fs.writeFile(workflowPath, JSON.stringify(newWorkflow, null, 2));
    console.log(`    ✅ Written: ${workflowPath}`);
  }

  // Create index
  const index = {
    version: 2,
    activeStoryId: oldState.activeStoryId || workflowIds[0],
    lastUpdated: oldState.lastUpdated || new Date().toISOString(),
    activeWorkflows: workflowIds.map(id => {
      const wf = oldState.workflows[id];
      return {
        jiraStoryId: id,
        currentStage: wf.currentStage,
        status: mapStatus(wf.stages[wf.currentStage]?.status),
        lastUpdated: wf.lastUpdated || new Date().toISOString()
      };
    })
  };

  await fs.writeFile('.claude/state/index.json', JSON.stringify(index, null, 2));
  console.log(`\n✅ Written index: .claude/state/index.json`);

  // Backup old state
  const backupPath = `${oldStatePath}.backup`;
  await fs.copyFile(oldStatePath, backupPath);
  console.log(`\n💾 Backed up old state to: ${backupPath}`);

  console.log('\n✨ Migration complete!\n');
  console.log('Next steps:');
  console.log('  1. Verify new state files in .claude/state/');
  console.log('  2. Update orchestrator to use StateManager');
  console.log('  3. Remove old state.json if everything works\n');
}

function mapStatus(oldStatus) {
  // Map old status values to new ones if needed
  const statusMap = {
    'draft': 'draft',
    'pending': 'pending',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'approved': 'completed'
  };
  return statusMap[oldStatus] || 'pending';
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const statePath = args[0];

  migrate(statePath).catch(error => {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = migrate;
