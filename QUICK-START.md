# Quick Start Guide - Agentic SDLC Framework

## 🚀 Getting Started in 5 Minutes

### Prerequisites

1. **Environment Variables**
   ```bash
   export JIRA_TOKEN="your-jira-api-token"
   export GITHUB_PERSONAL_ACCESS_TOKEN="your-github-token"
   ```

2. **Tools Required**
   - Git
   - Bash
   - curl
   - Python (for JSON parsing) or jq

### Basic Usage

#### 1. Start a New Story
```bash
start story WA-46
```

This will:
- ✅ Fetch the story from Jira
- ✅ Run Requirements Agent
- ✅ Create `.artifacts/WA-46-requirements.md`
- ⏸️ **Wait for your approval**

#### 2. Review & Approve
```bash
# Review the artifact
cat .artifacts/WA-46-requirements.md

# Approve to continue
approve
```

#### 3. Continue Through Stages
Each stage follows the same pattern:
1. Agent runs automatically
2. Creates artifact
3. Shows summary
4. **Waits for your approval**

```bash
approve          # After Architecture
approve          # After Planning
approve          # After Implementation
approve          # After Review
approve          # After Verification
approve          # After PR Package
```

#### 4. Check Status Anytime
```bash
status
```

Output:
```
Story: WA-46 - Get Weather Data by City Name
Stage: Implementation
Status: WaitingForApproval
Progress: 4/7 stages complete

Approved Stages:
✓ Requirements
✓ Architecture
✓ Planning
✓ Implementation

Next: Review
```

### Rejecting & Fixing

If you need to make changes:

```bash
reject
```

Then:
1. **Manual fix**: Edit the artifact file directly
2. **Re-run agent**: Invoke the current stage agent again
3. **Approve**: Once fixed, use `approve` to continue

---

## 📝 Example Workflow

```bash
# Start
> start story WA-46

🔄 Requirements Agent running...
✓ Created: .artifacts/WA-46-requirements.md

# Review
> cat .artifacts/WA-46-requirements.md
[review content...]

# Approve
> approve

🔄 Architecture Agent running...
✓ Created: .artifacts/WA-46-architecture.md

# Continue approving through all stages...
> approve  # Planning
> approve  # Implementation (code written)
> approve  # Review
> approve  # Verification
> approve  # PR creation

🎉 Pull Request Created!
   URL: https://github.com/user/repo/pull/123
   Branch: feature/WA-46-weather-endpoint
```

---

## 🎯 What Each Stage Does

| Stage | Agent | What It Creates | What to Check |
|-------|-------|-----------------|---------------|
| 1 | Requirements | Requirements doc | Are requirements complete? |
| 2 | Architecture | Architecture doc | Does design make sense? |
| 3 | Planning | Implementation plan | Are tasks well-defined? |
| 4 | Implementation | **Actual code** | Does code look correct? |
| 5 | Review | Review report | Are issues addressed? |
| 6 | Verification | Verification report | Tests pass? Criteria met? |
| 7 | PR | PR description + creates PR | Ready to merge? |

---

## 🛠️ Using Skills Directly

Skills are reusable components you can invoke:

### Jira Operations
```bash
# Get issue details
jira-integrator get-issue WA-46

# Add comment
jira-integrator add-comment WA-46 "Implementation started"

# Search issues
jira-integrator search-jql "project = WA AND status = 'To Do'"
```

### GitHub Operations
```bash
# Create PR
github-integrator create-pr "feat: Add weather endpoint" "Description..." "feature/WA-46" "main"

# List PRs
github-integrator list-prs
```

### Code Generation
```bash
# Generate function
code-generator function validateEmail "Validates email format" javascript

# Generate endpoint
code-generator endpoint POST /api/weather "Create weather record"
```

### Test Generation
```bash
# Generate tests
test-generator unit src/api/weather.js

# Run tests
test-generator run
```

---

## 📁 Where Things Are

```
Your Project/
│
├── .artifacts/                  ← Generated documents
│   ├── WA-46-requirements.md
│   ├── WA-46-architecture.md
│   └── ...
│
├── .workflow/                   ← Workflow state
│   └── WA-46-state.json
│
├── .audit/                      ← Audit logs
│   └── WA-46-audit.log
│
├── .claude/                     ← Framework (DO NOT MODIFY)
│   ├── agents/
│   ├── skills/
│   ├── commands/
│   └── workflows/
│
├── src/                         ← Your code (modified by agents)
├── test/                        ← Tests (generated/updated)
└── data/                        ← Data files
```

---

## 🚨 Troubleshooting

### "Workflow already exists"
```bash
# Check status
status

# Continue from where you left off
approve
```

### "Artifact not found"
Agent failed to create the artifact. Check:
1. `.audit/WA-46-audit.log` for errors
2. Re-run the current stage agent

### "Jira token not set"
```bash
export JIRA_TOKEN="your-token-here"
```

### "Git conflicts"
The Implementation Agent may encounter conflicts. Resolve manually:
```bash
git status
# Fix conflicts
git add .
approve  # Continue workflow
```

---

## 💡 Pro Tips

1. **Review artifacts incrementally** - Don't wait until the end
2. **Use `status` frequently** - Stay aware of progress
3. **Commit after each approval** - Save work incrementally
4. **Read audit logs** - Understand what agents did
5. **Customize agents** - Edit `.claude/agents/*.md` to fit your needs

---

## 🔗 Next Steps

- Read [FRAMEWORK-SUMMARY.md](./FRAMEWORK-SUMMARY.md) for detailed architecture
- Review [.claude/workflows/agentic-sdlc.md](./.claude/workflows/agentic-sdlc.md) for workflow definition
- Explore [.claude/skills/README.md](./.claude/skills/README.md) for available skills
- Check [.claude/commands/](./.claude/commands/) for command documentation

---

**Happy Automating! 🤖✨**
