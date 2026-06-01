# Agentic SDLC Framework - Quick Reference Guide

> **TL;DR**: Automated Jira-to-GitHub workflow using 7 specialized AI agents with human approval gates

---

## 🎯 What It Does

Transforms a **Jira story** into **production-ready code** + **GitHub PR** through 7 automated stages:

1. **Requirements** → Extract business & functional requirements
2. **Architecture** → Design technical solution
3. **Planning** → Break into tasks
4. **Implementation** → Write code + tests
5. **Review** → Code quality check
6. **Verification** → Test acceptance criteria
7. **PR** → Create GitHub pull request

**Human approves after each stage** ✅

---

## 🚀 Quick Start

### Start a Workflow

```bash
start story WA-46
```

**What happens**:
1. Fetches story from Jira
2. Runs Requirements Agent
3. Pauses for your approval

### Approve & Continue

```bash
approve
```

**What happens**:
1. Marks current stage as approved
2. Advances to next stage
3. Runs next agent
4. Pauses for your approval

### Reject & Fix

```bash
reject - missing details
```

**What happens**:
1. Stays at current stage
2. Waits for you to fix artifact
3. Re-approve when ready

### Check Status

```bash
status
```

**Output**: Progress, current stage, completed stages

---

## 📊 Workflow Flow

```
Jira Story
    ↓
Requirements Agent → [Approve?] 
    ↓
Architecture Agent → [Approve?]
    ↓
Planning Agent → [Approve?]
    ↓
Implementation Agent → [Approve?]
    ↓
Review Agent → [Approve?]
    ↓
Verification Agent → [Approve?]
    ↓
PR Agent → GitHub PR Created! 🎉
```

---

## 📁 Where Things Live

```
.claude/
├── agents/          # 7 agent definitions
├── skills/          # Reusable components
└── state/
    ├── index.json          # Active workflows
    └── workflows/
        └── WA-46.json      # Workflow state

docs/workflows/WA-46/
├── requirements.md         # Stage 1 output
├── architecture.md         # Stage 2 output
├── impl-plan.md           # Stage 3 output
├── impl-summary.md        # Stage 4 output
├── review-report.md       # Stage 5 output
├── verification-report.md # Stage 6 output
├── pr-package.md          # Stage 7 output
└── audit-log.md           # Complete history
```

---

## 🔧 Components

### Orchestrator
**Master controller** that:
- Manages workflow state
- Invokes agents sequentially
- Enforces approval gates
- Maintains audit trail

### Agents (7 specialized)
1. **Requirements** - Extract from Jira
2. **Architecture** - Design solution
3. **Planning** - Create task breakdown
4. **Implementation** - Write code + tests
5. **Review** - Check quality
6. **Verification** - Validate criteria
7. **PR** - Generate pull request

### Skills (9 reusable)
- Jira Integrator
- GitHub Integrator
- Code Generator
- Test Generator
- State Manager
- Artifact Validator
- Approval Gate Handler
- Audit Logger
- Agent Coordinator

---

## ⚙️ Configuration

### Jira Setup
```bash
export JIRA_BASE_URL="https://your-domain.atlassian.net"
export JIRA_USER_EMAIL="your@email.com"
export JIRA_API_TOKEN="your-token"
```

### GitHub Setup
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token"
# or
gh auth login
```

---

## 📋 Commands

| Command | Action |
|---------|--------|
| `start story WA-46` | Start workflow |
| `approve` | Approve current stage |
| `reject` | Reject current stage |
| `status` | Show progress |
| `view requirements` | Display artifact |
| `retry architecture` | Re-run agent |

---

## 🎯 Key Benefits

✅ **Automation** - Eliminates boilerplate work  
✅ **Quality** - Human review at every stage  
✅ **Documentation** - Complete artifacts generated  
✅ **Audit Trail** - Full traceability  
✅ **Consistency** - Best practices enforced  
✅ **Integration** - Jira → Code → GitHub  

---

## 🔄 State Management

**Stage Sequence** (hardcoded):
```javascript
[
  "requirements",
  "architecture", 
  "planning",
  "implementation",
  "review",
  "verification",
  "pr"
]
```

**Current Stage**: Tracked in `.claude/state/workflows/{storyId}.json`

**On Approve**: Advance to next stage  
**On Reject**: Stay at current stage

---

## 🚪 Approval Gates

**Why?**
- Catch errors early
- Validate business intent
- Prevent cascade failures
- Build team alignment

**How?**
1. Agent completes → artifact created
2. Display summary to user
3. User approves or rejects
4. On approve: advance
5. On reject: stay, fix, re-approve

---

## 📈 Example Session

```bash
> start story WA-46

✓ Requirements Agent complete
  • Business objectives: 2
  • Functional requirements: 5
  • Acceptance criteria: 4

⏸️  Approve to continue?

> approve

✓ Architecture Agent complete
  • Components: 3
  • Interfaces: 2
  • Risks: 2 (mitigated)

⏸️  Approve to continue?

> reject - missing database design

❌ Rejected. Fix artifact then re-approve.

> [edit docs/workflows/WA-46/architecture.md]

> approve

✓ Planning Agent complete
  • Tasks: 8
  • Estimated: Medium
  
⏸️  Approve to continue?

> approve

[... continues through all stages ...]

🎉 Workflow Complete!
   PR: https://github.com/user/repo/pull/123
```

---

## 🛠️ Troubleshooting

### No workflow found
```bash
start story WA-46
```

### Workflow exists
```bash
# Check status
status

# Or remove and restart
rm -rf docs/workflows/WA-46
rm .claude/state/workflows/WA-46.json
start story WA-46
```

### Agent failed
```bash
# Retry agent
retry architecture

# Or create artifact manually
# Then approve
approve architecture
```

### State corrupted
```bash
# Restore backup
cp .claude/state/workflows/WA-46.json.backup \
   .claude/state/workflows/WA-46.json
```

---

## 📚 Full Documentation

See [AGENTIC-SDLC-FRAMEWORK-DOCUMENTATION.md](AGENTIC-SDLC-FRAMEWORK-DOCUMENTATION.md) for complete details.

---

## 🎓 Learn More

- **Architecture**: See FRAMEWORK-SUMMARY.md
- **Workflow Diagram**: See WORKFLOW-DIAGRAM.md  
- **State Management**: See STATE-MANAGEMENT.md
- **Agent Details**: See .claude/agents/
- **Skills Reference**: See .claude/skills/README.md

---

**Version**: 1.0  
**Status**: Production Ready  
**Framework**: Agentic SDLC with Human-in-the-Loop  
**Date**: 2026-05-31
