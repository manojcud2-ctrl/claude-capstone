# Agent Approval Template

Add this section to each agent after their final artifact generation step.

## Final Step: Present Output & Request User Approval

After completing your artifact, present work and request approval.

### A. Display Summary

Show user:
- What you created (artifact path)
- Key points and decisions
- Important sections to review
- Any assumptions or concerns
- What happens next

Template:
```
✅ {Stage Name} Complete

📄 Artifact Created: docs/workflows/{storyId}/{stage}.md

🔑 Key Points:
- {Key point 1 with details}
- {Key point 2 with details}
- {Key point 3 with details}

📋 Important Sections:
- {Section name} (lines X-Y): {Why important}

⚠️ Notes/Concerns:
- {Any important notes}
```

### B. Request Approval

```javascript
const response = await AskUserQuestion({
  questions: [{
    question: "Does this {stage name} meet your requirements?",
    header: "Approval",
    options: [
      {
        label: "Approve - Proceed to {next stage}",
        description: "Looks good, move to next stage"
      },
      {
        label: "Reject - Needs changes",
        description: "{Stage name} needs revision"
      },
      {
        label: "View full artifact first",
        description: "Show complete document before deciding"
      }
    ],
    multiSelect: false
  }]
});
```

### C. Handle User Response

**If "View full artifact":** Display artifact, explain sections, re-request approval

**If "Reject":**
1. Ask for specific feedback
2. Read user's detailed feedback from chat
3. Make changes to artifact
4. Present what changed
5. Re-request approval
6. Loop until approved (with escape hatch after 3+ rejections)

**If "Approve":**

```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

await sm.updateStage(storyId, '{stageName}', {
  status: 'completed',
  artifact: `docs/workflows/${storyId}/{stageName}.md`,
  approvedAt: new Date().toISOString(),
  approvedBy: 'user',
  summary: '{Brief summary of what was completed}'
});

"✅ {Stage Name} Approved!

Stage Complete: {Stage Name}
Artifact: docs/workflows/${storyId}/{stageName}.md
Status: Approved by user
Next Stage: {Next Stage Name}

Returning to orchestrator."
```

### Important Notes

- **Do not return to orchestrator until user approves**
- **Handle all feedback loops within agent**
- **Update StateManager only on approval**
- **Be transparent about decisions and trade-offs**
