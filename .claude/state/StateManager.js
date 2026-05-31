const fs = require('fs').promises;
const path = require('path');

/**
 * StateManager - File-per-workflow state management
 *
 * Structure:
 *   .claude/state/
 *     ├── index.json           - Active workflows index
 *     ├── workflows/           - Individual workflow files
 *     │   └── {storyId}.json
 *     └── archive/             - Completed workflows
 *         └── {storyId}.json
 */
class StateManager {
  constructor(baseDir = '.claude/state') {
    this.baseDir = baseDir;
    this.indexPath = path.join(baseDir, 'index.json');
    this.workflowsDir = path.join(baseDir, 'workflows');
    this.archiveDir = path.join(baseDir, 'archive');
  }

  /**
   * Initialize state directories
   */
  async initialize() {
    await fs.mkdir(this.baseDir, { recursive: true });
    await fs.mkdir(this.workflowsDir, { recursive: true });
    await fs.mkdir(this.archiveDir, { recursive: true });

    // Create index if it doesn't exist
    try {
      await fs.access(this.indexPath);
    } catch {
      await this._writeIndex({
        version: 2,
        activeStoryId: null,
        lastUpdated: new Date().toISOString(),
        activeWorkflows: []
      });
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(jiraStoryId, initialStage = 'requirements') {
    await this.initialize();

    const now = new Date().toISOString();
    const workflow = {
      jiraStoryId,
      currentStage: initialStage,
      status: 'pending',
      createdAt: now,
      lastUpdated: now,
      stages: {
        requirements: this._emptyStage(),
        architecture: this._emptyStage(),
        planning: this._emptyStage(),
        implementation: this._emptyStage(),
        review: this._emptyStage(),
        verification: this._emptyStage(),
        pr: this._emptyStage()
      }
    };

    // Write workflow file
    await this._writeWorkflow(jiraStoryId, workflow);

    // Update index
    const index = await this._readIndex();
    index.activeWorkflows.push({
      jiraStoryId,
      currentStage: initialStage,
      status: 'pending',
      lastUpdated: now
    });
    index.lastUpdated = now;
    if (!index.activeStoryId) {
      index.activeStoryId = jiraStoryId;
    }
    await this._writeIndex(index);

    return workflow;
  }

  /**
   * Get a workflow by ID
   */
  async getWorkflow(jiraStoryId) {
    const workflowPath = path.join(this.workflowsDir, `${jiraStoryId}.json`);
    try {
      const data = await fs.readFile(workflowPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(jiraStoryId, updates) {
    const workflow = await this.getWorkflow(jiraStoryId);
    if (!workflow) {
      throw new Error(`Workflow ${jiraStoryId} not found`);
    }

    Object.assign(workflow, updates);
    workflow.lastUpdated = new Date().toISOString();

    await this._writeWorkflow(jiraStoryId, workflow);

    // Sync index
    await this._syncIndexEntry(jiraStoryId, workflow);

    return workflow;
  }

  /**
   * Update a specific stage
   */
  async updateStage(jiraStoryId, stageName, stageData) {
    const workflow = await this.getWorkflow(jiraStoryId);
    if (!workflow) {
      throw new Error(`Workflow ${jiraStoryId} not found`);
    }
    if (!workflow.stages[stageName]) {
      throw new Error(`Stage ${stageName} not found in workflow ${jiraStoryId}`);
    }

    Object.assign(workflow.stages[stageName], stageData);
    workflow.lastUpdated = new Date().toISOString();

    await this._writeWorkflow(jiraStoryId, workflow);

    // Sync index if current stage changed
    if (workflow.currentStage === stageName) {
      await this._syncIndexEntry(jiraStoryId, workflow);
    }

    return workflow;
  }

  /**
   * Get a specific stage
   */
  async getStage(jiraStoryId, stageName) {
    const workflow = await this.getWorkflow(jiraStoryId);
    if (!workflow) {
      throw new Error(`Workflow ${jiraStoryId} not found`);
    }
    return workflow.stages[stageName] || null;
  }

  /**
   * Delete a workflow (move to archive)
   */
  async deleteWorkflow(jiraStoryId) {
    await this.archiveWorkflow(jiraStoryId);
    await this._removeFromIndex(jiraStoryId);
  }

  /**
   * Archive a workflow
   */
  async archiveWorkflow(jiraStoryId) {
    const workflow = await this.getWorkflow(jiraStoryId);
    if (!workflow) {
      throw new Error(`Workflow ${jiraStoryId} not found`);
    }

    // Write to archive
    const archivePath = path.join(this.archiveDir, `${jiraStoryId}.json`);
    await fs.writeFile(archivePath, JSON.stringify(workflow, null, 2));

    // Remove from workflows
    const workflowPath = path.join(this.workflowsDir, `${jiraStoryId}.json`);
    await fs.unlink(workflowPath);

    // Remove from index
    await this._removeFromIndex(jiraStoryId);

    return workflow;
  }

  /**
   * Get all active workflows
   */
  async getActiveWorkflows() {
    const index = await this._readIndex();
    return index.activeWorkflows;
  }

  /**
   * Set the active story ID
   */
  async setActiveStory(jiraStoryId) {
    const index = await this._readIndex();
    index.activeStoryId = jiraStoryId;
    index.lastUpdated = new Date().toISOString();
    await this._writeIndex(index);
  }

  /**
   * Get the active story ID
   */
  async getActiveStory() {
    const index = await this._readIndex();
    return index.activeStoryId;
  }

  /**
   * List all workflow IDs
   */
  async listAllWorkflows() {
    try {
      const files = await fs.readdir(this.workflowsDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * List archived workflow IDs
   */
  async listArchivedWorkflows() {
    try {
      const files = await fs.readdir(this.archiveDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // ========== Internal Methods ==========

  _emptyStage() {
    return {
      status: 'pending',
      artifact: null,
      comments: [],
      generatedAt: null,
      approvedAt: null,
      summary: ''
    };
  }

  async _readIndex() {
    const data = await fs.readFile(this.indexPath, 'utf8');
    return JSON.parse(data);
  }

  async _writeIndex(index) {
    await fs.writeFile(this.indexPath, JSON.stringify(index, null, 2));
  }

  async _writeWorkflow(jiraStoryId, workflow) {
    const workflowPath = path.join(this.workflowsDir, `${jiraStoryId}.json`);
    await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
  }

  async _syncIndexEntry(jiraStoryId, workflow) {
    const index = await this._readIndex();
    const entry = index.activeWorkflows.find(w => w.jiraStoryId === jiraStoryId);

    if (entry) {
      entry.currentStage = workflow.currentStage;
      entry.status = workflow.status;
      entry.lastUpdated = workflow.lastUpdated;
      index.lastUpdated = new Date().toISOString();
      await this._writeIndex(index);
    }
  }

  async _removeFromIndex(jiraStoryId) {
    const index = await this._readIndex();
    index.activeWorkflows = index.activeWorkflows.filter(
      w => w.jiraStoryId !== jiraStoryId
    );

    if (index.activeStoryId === jiraStoryId) {
      index.activeStoryId = index.activeWorkflows[0]?.jiraStoryId || null;
    }

    index.lastUpdated = new Date().toISOString();
    await this._writeIndex(index);
  }
}

module.exports = StateManager;
