#!/usr/bin/env node

/**
 * Workflow State Manager Skill Implementation
 * Uses file-per-workflow StateManager for scalable state management
 */

const StateManager = require('../state/StateManager');
const path = require('path');

const sm = new StateManager('.claude/state');

// Stage definitions
const STAGES = [
  'requirements',
  'architecture',
  'planning',
  'implementation',
  'review',
  'verification',
  'pr'
];

const STATUS_VALUES = ['pending', 'draft', 'in_progress', 'completed', 'failed'];

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await sm.initialize();

    switch (command) {
      case 'init':
        await initWorkflow(args[1], args[2], args[3]);
        break;

      case 'read':
        await readState(args[1]);
        break;

      case 'update':
        await updateState(args[1], args[2]);
        break;

      case 'update-stage':
        await updateStage(args[1], args[2], args[3]);
        break;

      case 'append':
        await appendToArray(args[1], args[2]);
        break;

      case 'validate':
        await validateState(args[1]);
        break;

      case 'progress':
        await showProgress(args[1]);
        break;

      case 'status':
        await showStatus(args[1]);
        break;

      case 'list':
        await listWorkflows();
        break;

      case 'archive':
        await archiveWorkflow(args[1]);
        break;

      case 'set-active':
        await setActiveStory(args[1]);
        break;

      default:
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

/**
 * Initialize a new workflow
 */
async function initWorkflow(storyId, storyTitle, storyType = 'Feature') {
  if (!storyId) {
    throw new Error('Story ID required: workflow-state init <story-id> <title> [type]');
  }

  const workflow = await sm.createWorkflow(storyId, 'requirements');
  workflow.storyTitle = storyTitle || '';
  workflow.storyType = storyType;

  await sm.updateWorkflow(storyId, workflow);

  console.log(`✅ Workflow initialized: ${storyId}`);
  console.log(`   Location: .claude/state/workflows/${storyId}.json`);
  console.log(`   Initial Stage: requirements`);
}

/**
 * Read workflow state or specific field
 */
async function readState(field) {
  const activeStoryId = await sm.getActiveStory();

  if (!activeStoryId) {
    throw new Error('No active workflow. Use "workflow-state set-active <story-id>"');
  }

  const workflow = await sm.getWorkflow(activeStoryId);

  if (!workflow) {
    throw new Error(`Workflow ${activeStoryId} not found`);
  }

  if (!field) {
    // Return entire workflow
    console.log(JSON.stringify(workflow, null, 2));
  } else {
    // Return specific field
    const value = getNestedValue(workflow, field);
    console.log(JSON.stringify(value, null, 2));
  }
}

/**
 * Update workflow state field
 */
async function updateState(field, value) {
  const activeStoryId = await sm.getActiveStory();

  if (!activeStoryId) {
    throw new Error('No active workflow');
  }

  const workflow = await sm.getWorkflow(activeStoryId);

  if (!workflow) {
    throw new Error(`Workflow ${activeStoryId} not found`);
  }

  // Parse value
  let parsedValue = value;
  try {
    parsedValue = JSON.parse(value);
  } catch {
    // Keep as string
  }

  setNestedValue(workflow, field, parsedValue);

  await sm.updateWorkflow(activeStoryId, workflow);

  console.log(`✅ Updated ${field} = ${value}`);
}

/**
 * Update specific stage
 */
async function updateStage(storyId, stageName, dataJson) {
  if (!storyId || !stageName || !dataJson) {
    throw new Error('Usage: workflow-state update-stage <story-id> <stage> <json-data>');
  }

  const data = JSON.parse(dataJson);
  await sm.updateStage(storyId, stageName, data);

  console.log(`✅ Updated ${storyId} stage: ${stageName}`);
}

/**
 * Append to array field
 */
async function appendToArray(field, value) {
  const activeStoryId = await sm.getActiveStory();

  if (!activeStoryId) {
    throw new Error('No active workflow');
  }

  const workflow = await sm.getWorkflow(activeStoryId);
  const arr = getNestedValue(workflow, field);

  if (!Array.isArray(arr)) {
    throw new Error(`Field ${field} is not an array`);
  }

  if (!arr.includes(value)) {
    arr.push(value);
    setNestedValue(workflow, field, arr);
    await sm.updateWorkflow(activeStoryId, workflow);
    console.log(`✅ Appended ${value} to ${field}`);
  } else {
    console.log(`ℹ️  ${value} already in ${field}`);
  }
}

/**
 * Validate workflow state
 */
async function validateState(storyId) {
  const id = storyId || (await sm.getActiveStory());

  if (!id) {
    throw new Error('No workflow specified');
  }

  const workflow = await sm.getWorkflow(id);

  if (!workflow) {
    throw new Error(`Workflow ${id} not found`);
  }

  const errors = [];

  // Check required fields
  if (!workflow.jiraStoryId) errors.push('Missing jiraStoryId');
  if (!workflow.currentStage) errors.push('Missing currentStage');
  if (!workflow.status) errors.push('Missing status');

  // Validate stage
  if (workflow.currentStage && !STAGES.includes(workflow.currentStage)) {
    errors.push(`Invalid currentStage: ${workflow.currentStage}`);
  }

  // Validate status
  if (workflow.status && !STATUS_VALUES.includes(workflow.status)) {
    errors.push(`Invalid status: ${workflow.status}`);
  }

  // Validate stages structure
  if (workflow.stages) {
    for (const stageName of STAGES) {
      if (!workflow.stages[stageName]) {
        errors.push(`Missing stage: ${stageName}`);
      }
    }
  }

  if (errors.length > 0) {
    console.log('❌ Workflow state invalid\n');
    console.log('Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
    process.exit(1);
  }

  console.log('✅ Workflow state valid\n');
  console.log(`Story: ${workflow.jiraStoryId}`);
  console.log(`Stage: ${workflow.currentStage}`);
  console.log(`Status: ${workflow.status}`);
}

/**
 * Show workflow progress
 */
async function showProgress(storyId) {
  const id = storyId || (await sm.getActiveStory());

  if (!id) {
    throw new Error('No workflow specified');
  }

  const workflow = await sm.getWorkflow(id);

  if (!workflow) {
    throw new Error(`Workflow ${id} not found`);
  }

  const completed = STAGES.filter(s => workflow.stages[s]?.status === 'completed');
  const currentStage = workflow.currentStage;
  const pending = STAGES.filter(
    s => s !== currentStage && !completed.includes(s)
  );

  const percentage = Math.round((completed.length / STAGES.length) * 100);

  console.log(`Progress: ${completed.length}/${STAGES.length} stages (${percentage}%)\n`);

  if (completed.length > 0) {
    console.log('Completed:');
    completed.forEach(s => console.log(`  ✅ ${s}`));
    console.log('');
  }

  console.log('Current:');
  console.log(`  → ${currentStage}`);
  console.log('');

  if (pending.length > 0) {
    console.log('Pending:');
    pending.forEach(s => console.log(`  ⏱  ${s}`));
  }
}

/**
 * Show workflow status
 */
async function showStatus(storyId) {
  const id = storyId || (await sm.getActiveStory());

  if (!id) {
    throw new Error('No workflow specified');
  }

  const workflow = await sm.getWorkflow(id);

  if (!workflow) {
    throw new Error(`Workflow ${id} not found`);
  }

  console.log(`Status: ${workflow.status}`);
  console.log(`Stage: ${workflow.currentStage}`);
  console.log(`Last Updated: ${workflow.lastUpdated}`);

  if (workflow.status === 'completed') {
    console.log('\n✨ Workflow complete!');
  } else {
    const action =
      workflow.status === 'in_progress'
        ? 'Agent running...'
        : `Approve or reject ${workflow.currentStage}`;
    console.log(`Action Required: ${action}`);
  }
}

/**
 * List all workflows
 */
async function listWorkflows() {
  const activeWorkflows = await sm.getActiveWorkflows();
  const activeStoryId = await sm.getActiveStory();

  console.log('\n📋 Active Workflows:\n');

  if (activeWorkflows.length === 0) {
    console.log('  (none)');
  } else {
    activeWorkflows.forEach(w => {
      const marker = w.jiraStoryId === activeStoryId ? '→' : ' ';
      console.log(
        `  ${marker} ${w.jiraStoryId} - ${w.currentStage} (${w.status})`
      );
    });
  }

  console.log('');
}

/**
 * Archive a workflow
 */
async function archiveWorkflow(storyId) {
  if (!storyId) {
    throw new Error('Story ID required: workflow-state archive <story-id>');
  }

  await sm.archiveWorkflow(storyId);
  console.log(`✅ Workflow ${storyId} archived`);
}

/**
 * Set active story
 */
async function setActiveStory(storyId) {
  if (!storyId) {
    throw new Error('Story ID required: workflow-state set-active <story-id>');
  }

  const workflow = await sm.getWorkflow(storyId);

  if (!workflow) {
    throw new Error(`Workflow ${storyId} not found`);
  }

  await sm.setActiveStory(storyId);
  console.log(`✅ Active workflow set to: ${storyId}`);
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Workflow State Manager - File-per-workflow edition

Usage:
  workflow-state <command> [arguments]

Commands:
  init <id> <title> [type]     Initialize new workflow
  read [field]                 Read workflow or field (uses active)
  update <field> <value>       Update field (uses active)
  update-stage <id> <stage> <json>  Update specific stage
  append <field> <value>       Append to array field (uses active)
  validate [id]                Validate workflow
  progress [id]                Show progress
  status [id]                  Show status
  list                         List all workflows
  archive <id>                 Archive workflow
  set-active <id>              Set active workflow

Examples:
  workflow-state init WA-100 "Add feature" Feature
  workflow-state set-active WA-100
  workflow-state read currentStage
  workflow-state update status in_progress
  workflow-state progress
  workflow-state archive WA-100
`);
}

// Utility functions
function getNestedValue(obj, path) {
  return path.split('.').reduce((curr, key) => curr?.[key], obj);
}

function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((curr, key) => {
    if (!curr[key]) curr[key] = {};
    return curr[key];
  }, obj);
  target[lastKey] = value;
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error(`\n❌ ${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { sm, STAGES, STATUS_VALUES };
