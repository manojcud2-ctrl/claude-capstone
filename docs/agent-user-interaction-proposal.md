# Agent User Interaction & Approval Proposal

## Overview

Modify the Agentic SDLC workflow so each specialized agent is **directly responsible** for:
1. **Asking clarifying questions** to the user
2. **Presenting their output** with explanations
3. **Requesting explicit approval** before returning to orchestrator
4. **Handling rejection feedback** and making revisions

## Current Architecture Issues

**Problem**: Currently, agents produce artifacts silently and return to the orchestrator, which then requests approval. This creates a disconnect where:
- Agents can't ask clarifying questions during their work
- Users don't see the agent's reasoning or approach
- Approval happens through the orchestrator, not the agent that created the work
- Agents can't directly handle rejection feedback

## Proposed Architecture

### Agent Lifecycle with User Interaction

```
Orchestrator → Invokes Agent
                    ↓
              Agent Starts
                    ↓
         Agent Asks Questions (AskUserQuestion)
                    ↓
              User Responds
                    ↓
         Agent Does Work
                    ↓
         Agent Presents Output
                    ↓
         Agent Requests Approval (AskUserQuestion)
                    ↓
              User Reviews
                    ↓
         ┌─────────┴──────────┐
         │                    │
      Approve              Reject
         │                    │
         │            Agent Asks for Feedback
         │                    │
         │            User Provides Feedback
         │                    │
         │            Agent Revises Work
         │                    │
         │            Agent Re-presents Output
         │                    │
         └────────────────────┘
                    ↓
         Agent Returns Success to Orchestrator
                    ↓
         Orchestrator Proceeds to Next Stage
```

## Implementation Changes

### 1. Modify Agent Template

Add these sections to **every specialized agent**:

#### A. Clarifying Questions Section

```markdown
## Step 0: Ask Clarifying Questions (If Needed)

Before starting work, review the input and identify:
- Ambiguous requirements
- Missing technical details
- Decisions that require user input
- Alternative approaches to choose from

**Use AskUserQuestion tool:**
```javascript
AskUserQuestion({
  questions: [{
    question: "Which authentication method should we use?",
    header: "Auth Method",
    options: [
      {
        label: "JWT with refresh tokens",
        description: "Stateless, scalable, more secure"
      },
      {
        label: "Session-based",
        description: "Simpler, requires server-side storage"
      }
    ],
    multiSelect: false
  }]
})
```

**Guidelines:**
- Ask 1-4 questions maximum per round
- Make questions specific and actionable
- Provide clear options with trade-offs
- Only ask when truly unclear (don't over-ask)
```

#### B. Output Presentation Section

```markdown
## Final Step: Present Output & Request Approval

After completing the artifact, present your work to the user:

### 1. Display Summary

Show the user:
- What you created
- Key decisions made
- Important sections to review
- Assumptions you made
- Any concerns or limitations

**Example:**
```
I've completed the {Stage Name} for {Story ID}.

📄 Artifact Created: docs/workflows/{storyId}/{stage}.md

🔑 Key Points:
- {Main decision 1 with rationale}
- {Main decision 2 with rationale}
- {Important section to review}

⚠️ Assumptions Made:
- {Assumption 1}
- {Assumption 2}

📋 Please Review:
- Section X (lines Y-Z): {Why important}
- Section A (lines B-C): {Why important}
```

### 2. Request Approval

Use AskUserQuestion to get explicit approval:

```javascript
AskUserQuestion({
  questions: [{
    question: "Does this {stage} meet your requirements?",
    header: "Approval",
    options: [
      {
        label: "Approve - Looks good",
        description: "Approve this {stage} and proceed to next stage"
      },
      {
        label: "Reject - Needs changes",
        description: "Request revisions to this {stage}"
      },
      {
        label: "Review artifact first",
        description: "Display the full artifact before deciding"
      }
    ],
    multiSelect: false
  }]
})
```

### 3. Handle User Response

**If "Review artifact first":**
- Display the full artifact content
- Explain key sections
- Re-ask for approval

**If "Approve":**
- Update stage status to 'completed'
- Update StateManager with approval timestamp
- Display success message
- Return control to orchestrator

**If "Reject":**
- Ask for specific feedback using AskUserQuestion
- Read user's concerns
- Make revisions to the artifact
- Re-present the updated output
- Re-request approval

### 4. Handle Rejection Loop

```javascript
// Ask for feedback
AskUserQuestion({
  questions: [{
    question: "What changes would you like to see?",
    header: "Feedback",
    options: [
      {
        label: "Specific concerns",
        description: "I'll provide detailed feedback"
      },
      {
        label: "General direction",
        description: "The approach needs adjustment"
      }
    ],
    multiSelect: false
  }]
})

// After user provides feedback in chat:
// 1. Read the feedback
// 2. Make specific changes to the artifact
// 3. Re-present the changes: "I've updated..."
// 4. Re-request approval
// 5. Repeat until approved
```

### 5. Update StateManager on Approval

```javascript
const StateManager = require('./.claude/state/StateManager');
const sm = new StateManager();

// When user approves
await sm.updateStage(storyId, '{stage}', {
  status: 'completed',
  artifact: 'docs/workflows/{storyId}/{stage}.md',
  approvedAt: new Date().toISOString(),
  approvedBy: 'user',
  summary: '{Brief summary of artifact}'
});

// Log to audit trail
```
```

### 2. Update Orchestrator Behavior

Modify `sdlc-orchestrator.md`:

```markdown
## Agent Invocation with User Interaction

When invoking a specialized agent:

1. **Invoke agent with clear prompt**
2. **Agent takes full ownership** of user interaction
3. **Agent requests approval** before returning
4. **Orchestrator only proceeds** after agent signals completion

### Updated Agent Invocation

```javascript
Agent({
  description: `${stageName} stage for ${storyId}`,
  subagent_type: `${stageName}-agent`,
  prompt: `You are the ${stageName} Agent for Agentic SDLC.
  
  Story ID: ${storyId}
  Current Stage: ${stageName}
  Input Artifacts: ${JSON.stringify(inputArtifacts)}
  
  YOUR RESPONSIBILITIES:
  1. Ask the user clarifying questions if needed (use AskUserQuestion)
  2. Do your work following .claude/agents/${stageName}-agent.md
  3. Create your artifact: docs/workflows/${storyId}/${stageName}.md
  4. Present your output to the user with summary
  5. Request approval using AskUserQuestion
  6. Handle rejection feedback - revise and re-request approval
  7. Only return when user approves
  
  IMPORTANT:
  - You are responsible for getting user approval
  - Do not return until approved
  - Handle all user questions and feedback
  - Use AskUserQuestion for approval gates
  
  State Management:
  - API: const sm = require('./.claude/state/StateManager');
  - Update stage on approval:
    await sm.updateStage('${storyId}', '${stageName}', {
      status: 'completed',
      artifact: 'docs/workflows/${storyId}/${stageName}.md',
      approvedAt: new Date().toISOString(),
      approvedBy: 'user'
    });
  
  Follow: .claude/agents/${stageName}-agent.md`
});

// Wait for agent to complete (with approval)
// Agent will only return after user approval
```

### Orchestrator Approval Gate (Simplified)

After agent returns:
1. **Verify** agent updated stage status to 'completed'
2. **Verify** approvedAt timestamp exists
3. **Log** stage completion to audit trail
4. **Proceed** to next stage (invoke next agent)

No need to request approval again - agent already got it!

```javascript
// After agent completes
const workflow = await sm.getWorkflow(storyId);
const stage = workflow.stages[stageName];

if (stage.status !== 'completed' || !stage.approvedAt) {
  throw new Error(`${stageName} agent returned without approval`);
}

// Log completion
await appendAuditLog(storyId, `${stageName} completed and approved`);

// Proceed to next stage
await invokeNextAgent();
```
```

### 3. Example: Requirements Agent with User Interaction

Update `requirements-agent.md`:

```markdown
# Requirements Agent with User Interaction

## Process Flow

### Step 0: Ask Clarifying Questions

After fetching Jira story, review for ambiguities:

```javascript
// If story is unclear
AskUserQuestion({
  questions: [{
    question: "The story mentions 'real-time updates'. Should this be WebSockets or polling?",
    header: "Real-time Approach",
    options: [
      {
        label: "WebSockets",
        description: "True real-time, more complex infrastructure"
      },
      {
        label: "Polling (5-second intervals)",
        description: "Simpler, slightly delayed updates"
      }
    ],
    multiSelect: false
  },
  {
    question: "What's the expected concurrent user count?",
    header: "Scale",
    options: [
      {
        label: "< 100 users",
        description: "Small scale"
      },
      {
        label: "100-1000 users",
        description: "Medium scale"
      },
      {
        label: "> 1000 users",
        description: "Large scale"
      }
    ],
    multiSelect: false
  }]
})
```

### Step 1-8: Do Requirements Work

[... existing steps ...]

### Step 9: Present Output & Request Approval

After generating `docs/workflows/{storyId}/requirements.md`:

```
I've completed the Requirements Specification for {Story ID}.

📄 Artifact: docs/workflows/{storyId}/requirements.md

🔑 Key Requirements Extracted:
- {X} Business Requirements focused on {main objective}
- {Y} Functional Requirements covering {main features}
- {Z} Non-Functional Requirements for {performance/security/etc}
- {N} Acceptance Criteria in Given-When-Then format

📋 Important Sections to Review:
- **Functional Requirements** (lines 150-200): Core features defined
- **Non-Functional Requirements** (lines 161-176): Performance targets set at {value}
- **Assumptions** (lines 177-182): {Key assumption worth noting}
- **Open Questions** (lines 183-189): {Any unresolved items}

⚠️ Open Questions:
{List any open questions that need stakeholder input}
```

Now request approval:

```javascript
const response = await AskUserQuestion({
  questions: [{
    question: "Does this requirements specification meet your needs?",
    header: "Approval",
    options: [
      {
        label: "Approve - Proceed to Architecture",
        description: "Requirements look good, move to next stage"
      },
      {
        label: "Reject - Needs changes",
        description: "Requirements need revision"
      },
      {
        label: "View full artifact",
        description: "Show me the complete specification first"
      }
    ],
    multiSelect: false
  }]
});

// Handle response
if (response.answers["Does this requirements specification meet your needs?"] === "View full artifact") {
  // Display full artifact
  const artifact = await Read({ file_path: `docs/workflows/${storyId}/requirements.md` });
  // Show content
  // Re-ask for approval
}

if (response.answers["Does this requirements specification meet your needs?"] === "Reject - Needs changes") {
  // Ask for feedback
  const feedback = await AskUserQuestion({
    questions: [{
      question: "What changes would you like to see?",
      header: "Feedback",
      options: [
        {
          label: "Provide detailed feedback",
          description: "I'll explain what needs to change"
        }
      ],
      multiSelect: false
    }]
  });
  
  // User provides feedback in chat
  // Read feedback, make changes, re-present
  // Loop until approved
}

if (response.answers["Does this requirements specification meet your needs?"] === "Approve - Proceed to Architecture") {
  // Update StateManager
  const StateManager = require('./.claude/state/StateManager');
  const sm = new StateManager();
  
  await sm.updateStage(storyId, 'requirements', {
    status: 'completed',
    artifact: `docs/workflows/${storyId}/requirements.md`,
    approvedAt: new Date().toISOString(),
    approvedBy: 'user',
    summary: `${businessReqCount} business reqs, ${functionalReqCount} functional reqs, ${acCount} acceptance criteria`
  });
  
  // Success message
  "✅ Requirements approved! Returning to orchestrator to proceed to Architecture stage."
  
  // Return (orchestrator will invoke architecture-agent next)
}
```
```

## Benefits of This Approach

### 1. **Direct Communication**
- Agents can ask questions when they need clarification
- No back-and-forth through orchestrator
- Faster feedback loops

### 2. **Agent Ownership**
- Each agent is responsible for their stage quality
- Agents handle their own approval gates
- Clear accountability

### 3. **Better User Experience**
- User sees agent's reasoning and decisions
- User can provide feedback directly to the agent that did the work
- Revision cycles happen within the agent context

### 4. **Simplified Orchestrator**
- Orchestrator just coordinates sequence
- No need to request approval (agents do it)
- Just verify approval happened and proceed

### 5. **Flexible Iteration**
- Agents can iterate on feedback within their session
- No need to re-invoke agent through orchestrator
- Faster convergence to acceptable output

## Migration Path

### Phase 1: Update Agent Templates
1. Add "Step 0: Ask Clarifying Questions" section to all agents
2. Add "Final Step: Present Output & Request Approval" section to all agents
3. Update each agent to use AskUserQuestion for approval

### Phase 2: Update Orchestrator
1. Modify agent invocation prompts to include approval responsibility
2. Remove orchestrator approval gates (agents handle it)
3. Add verification that agents got approval before proceeding

### Phase 3: Test & Refine
1. Test full workflow end-to-end
2. Refine agent approval question options
3. Add better error handling for approval loops
4. Document best practices

## Example Complete Flow

```
User: "start story WA-123"

Orchestrator:
→ Invokes Requirements Agent

Requirements Agent:
→ Fetches Jira story WA-123
→ Notices story says "real-time" but unclear
→ Asks user: "WebSockets or polling?"
→ User answers: "WebSockets"
→ Generates requirements.md
→ Presents summary to user
→ Asks: "Approve requirements?"
→ User: "Reject - security requirements missing"
→ Agent: "What security requirements?"
→ User: "Need OAuth2 and rate limiting"
→ Agent adds security requirements
→ Agent re-presents updated requirements
→ Agent re-asks: "Approve requirements?"
→ User: "Approve"
→ Agent updates StateManager with approval
→ Agent returns to orchestrator

Orchestrator:
→ Verifies approval timestamp exists
→ Logs completion
→ Invokes Architecture Agent

Architecture Agent:
→ Reads requirements.md
→ Notices WebSockets chosen
→ Asks: "Which WebSocket library?"
→ User: "Socket.io"
→ Generates architecture.md
→ Presents summary
→ Asks: "Approve architecture?"
→ User: "Approve"
→ Agent updates StateManager
→ Agent returns to orchestrator

Orchestrator:
→ Verifies approval
→ Logs completion
→ Invokes Planning Agent

[... continues through all stages ...]
```

## Implementation Checklist

- [ ] Update `requirements-agent.md` with clarifying questions + approval sections
- [ ] Update `architecture-agent.md` with clarifying questions + approval sections
- [ ] Update `planning-agent.md` with clarifying questions + approval sections
- [ ] Update `implementation-agent.md` with clarifying questions + approval sections
- [ ] Update `review-agent.md` with clarifying questions + approval sections
- [ ] Update `verification-agent.md` with clarifying questions + approval sections
- [ ] Update `pr-agent.md` with clarifying questions + approval sections
- [ ] Update `sdlc-orchestrator.md` to remove approval gates (agents handle it)
- [ ] Update orchestrator agent invocation prompts
- [ ] Add approval verification logic to orchestrator
- [ ] Test complete workflow with a real story
- [ ] Document user interaction patterns
- [ ] Add error handling for infinite rejection loops

## Questions & Considerations

1. **What if an agent asks too many questions?**
   - Guideline: Max 1-4 questions per round
   - Only ask when truly necessary
   - Bundle related questions together

2. **What if user keeps rejecting?**
   - Agent should ask for specific feedback
   - After 3 rejections, escalate to orchestrator
   - Orchestrator can offer "manual edit" option

3. **Can user skip agent questions?**
   - Yes, provide "Use defaults" option
   - Document what defaults were chosen
   - User can still reject and change later

4. **How to handle timeouts?**
   - If user doesn't respond, agent waits
   - Orchestrator can check for stalled workflows
   - Provide "resume workflow" command

5. **Should orchestrator see agent conversations?**
   - Yes, agents should log key decisions
   - Audit trail captures approval events
   - Orchestrator reads StateManager for status

---

**Status**: Proposal - Ready for Review & Implementation
**Next Step**: Get user approval to proceed with Phase 1
