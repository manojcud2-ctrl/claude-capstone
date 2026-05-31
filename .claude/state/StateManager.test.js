const fs = require('fs').promises;
const path = require('path');
const StateManager = require('./StateManager');

const TEST_BASE_DIR = '.claude/state-test';

describe('StateManager', () => {
  let stateManager;

  beforeEach(async () => {
    // Clean test directory
    try {
      await fs.rm(TEST_BASE_DIR, { recursive: true });
    } catch {}

    stateManager = new StateManager(TEST_BASE_DIR);
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(TEST_BASE_DIR, { recursive: true });
    } catch {}
  });

  describe('initialize', () => {
    it('should create state directories', async () => {
      await stateManager.initialize();

      const indexExists = await fileExists(stateManager.indexPath);
      const workflowsDirExists = await fileExists(stateManager.workflowsDir);
      const archiveDirExists = await fileExists(stateManager.archiveDir);

      expect(indexExists).toBe(true);
      expect(workflowsDirExists).toBe(true);
      expect(archiveDirExists).toBe(true);
    });

    it('should create default index', async () => {
      await stateManager.initialize();

      const index = await stateManager._readIndex();
      expect(index.version).toBe(2);
      expect(index.activeStoryId).toBeNull();
      expect(index.activeWorkflows).toEqual([]);
    });
  });

  describe('createWorkflow', () => {
    it('should create a new workflow file', async () => {
      const workflow = await stateManager.createWorkflow('WA-100');

      expect(workflow.jiraStoryId).toBe('WA-100');
      expect(workflow.currentStage).toBe('requirements');
      expect(workflow.status).toBe('pending');
      expect(workflow.stages).toHaveProperty('requirements');
      expect(workflow.stages).toHaveProperty('architecture');
    });

    it('should add workflow to index', async () => {
      await stateManager.createWorkflow('WA-100');

      const index = await stateManager._readIndex();
      expect(index.activeWorkflows).toHaveLength(1);
      expect(index.activeWorkflows[0].jiraStoryId).toBe('WA-100');
      expect(index.activeStoryId).toBe('WA-100');
    });

    it('should create workflow with custom initial stage', async () => {
      const workflow = await stateManager.createWorkflow('WA-100', 'planning');

      expect(workflow.currentStage).toBe('planning');
    });
  });

  describe('getWorkflow', () => {
    it('should retrieve existing workflow', async () => {
      await stateManager.createWorkflow('WA-100');

      const workflow = await stateManager.getWorkflow('WA-100');
      expect(workflow).not.toBeNull();
      expect(workflow.jiraStoryId).toBe('WA-100');
    });

    it('should return null for non-existent workflow', async () => {
      await stateManager.initialize();

      const workflow = await stateManager.getWorkflow('WA-999');
      expect(workflow).toBeNull();
    });
  });

  describe('updateWorkflow', () => {
    it('should update workflow fields', async () => {
      await stateManager.createWorkflow('WA-100');

      const updated = await stateManager.updateWorkflow('WA-100', {
        currentStage: 'architecture',
        status: 'in_progress'
      });

      expect(updated.currentStage).toBe('architecture');
      expect(updated.status).toBe('in_progress');
    });

    it('should sync index when workflow updated', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.updateWorkflow('WA-100', {
        currentStage: 'architecture',
        status: 'in_progress'
      });

      const index = await stateManager._readIndex();
      const entry = index.activeWorkflows.find(w => w.jiraStoryId === 'WA-100');

      expect(entry.currentStage).toBe('architecture');
      expect(entry.status).toBe('in_progress');
    });

    it('should throw error for non-existent workflow', async () => {
      await stateManager.initialize();

      await expect(
        stateManager.updateWorkflow('WA-999', { status: 'completed' })
      ).rejects.toThrow('Workflow WA-999 not found');
    });
  });

  describe('updateStage', () => {
    it('should update specific stage', async () => {
      await stateManager.createWorkflow('WA-100');

      await stateManager.updateStage('WA-100', 'requirements', {
        status: 'completed',
        summary: 'Requirements approved',
        approvedAt: new Date().toISOString()
      });

      const workflow = await stateManager.getWorkflow('WA-100');
      expect(workflow.stages.requirements.status).toBe('completed');
      expect(workflow.stages.requirements.summary).toBe('Requirements approved');
    });

    it('should throw error for invalid stage', async () => {
      await stateManager.createWorkflow('WA-100');

      await expect(
        stateManager.updateStage('WA-100', 'invalid_stage', { status: 'done' })
      ).rejects.toThrow('Stage invalid_stage not found');
    });
  });

  describe('getStage', () => {
    it('should retrieve specific stage', async () => {
      await stateManager.createWorkflow('WA-100');

      const stage = await stateManager.getStage('WA-100', 'requirements');
      expect(stage).not.toBeNull();
      expect(stage.status).toBe('pending');
    });
  });

  describe('archiveWorkflow', () => {
    it('should move workflow to archive', async () => {
      await stateManager.createWorkflow('WA-100');

      await stateManager.archiveWorkflow('WA-100');

      // Should not exist in workflows
      const workflow = await stateManager.getWorkflow('WA-100');
      expect(workflow).toBeNull();

      // Should exist in archive
      const archivePath = path.join(stateManager.archiveDir, 'WA-100.json');
      const archived = await fileExists(archivePath);
      expect(archived).toBe(true);
    });

    it('should remove from index', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.archiveWorkflow('WA-100');

      const index = await stateManager._readIndex();
      expect(index.activeWorkflows).toHaveLength(0);
      expect(index.activeStoryId).toBeNull();
    });

    it('should update activeStoryId to next workflow', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.createWorkflow('WA-101');

      await stateManager.archiveWorkflow('WA-100');

      const index = await stateManager._readIndex();
      expect(index.activeStoryId).toBe('WA-101');
    });
  });

  describe('getActiveWorkflows', () => {
    it('should return all active workflows', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.createWorkflow('WA-101');

      const active = await stateManager.getActiveWorkflows();
      expect(active).toHaveLength(2);
    });
  });

  describe('setActiveStory / getActiveStory', () => {
    it('should set and get active story', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.createWorkflow('WA-101');

      await stateManager.setActiveStory('WA-101');

      const activeStory = await stateManager.getActiveStory();
      expect(activeStory).toBe('WA-101');
    });
  });

  describe('listAllWorkflows', () => {
    it('should list all workflow IDs', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.createWorkflow('WA-101');

      const workflows = await stateManager.listAllWorkflows();
      expect(workflows).toContain('WA-100');
      expect(workflows).toContain('WA-101');
      expect(workflows).toHaveLength(2);
    });

    it('should return empty array if no workflows', async () => {
      await stateManager.initialize();

      const workflows = await stateManager.listAllWorkflows();
      expect(workflows).toEqual([]);
    });
  });

  describe('listArchivedWorkflows', () => {
    it('should list archived workflow IDs', async () => {
      await stateManager.createWorkflow('WA-100');
      await stateManager.archiveWorkflow('WA-100');

      const archived = await stateManager.listArchivedWorkflows();
      expect(archived).toContain('WA-100');
    });
  });
});

// Helper
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
