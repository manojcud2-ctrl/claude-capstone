# Agentic SDLC Orchestrator Framework

A complete human-in-the-loop software delivery lifecycle workflow that processes Jira stories through seven specialized agents with mandatory approval gates between each stage.

## Overview

This framework implements a master orchestrator pattern for software delivery, where an SDLC Orchestrator coordinates seven specialized agents to transform a Jira story into production-ready code with comprehensive testing, review, and verification.

### Key Features

✅ **Human-in-the-Loop** - Mandatory approval gates after each stage  
✅ **Specialized Agents** - Each stage handled by focused, expert agent  
✅ **MCP Integration** - Native GitHub and Jira integration via Model Context Protocol  
✅ **Reusable Skills** - 8 modular skills for code generation, testing, and workflow management  
✅ **State Management** - Complete workflow state tracking  
✅ **Audit Trail** - Full history of all actions and decisions  
✅ **Artifact-Driven** - Each stage produces structured documentation  
✅ **Extensible** - Easy to add new stages or customize agents  
✅ **Production-Ready** - Comprehensive error handling and validation  
✅ **Automated PR Creation** - Automatically creates GitHub pull requests with complete documentation  

## Architecture

```
┌─────────────────────────────────────────────┐
│         SDLC Orchestrator                   │
│      (Master Controller)                    │
└─────┬───────┬───────┬───────┬───────┬───────┘
      │       │       │       │       │       
      v       v       v       v       v       
   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
   │ Req  │ │ Arch │ │ Plan │ │ Impl │ │ Rev  │
   └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
      │        │        │        │        │    
      v        v        v        v        v    
   [Approval Gates - Human Reviews Each Stage]
```

## Workflow Stages

The framework processes stories through seven sequential stages:

### 1. **Requirements Analysis**
- Extract business and functional requirements
- Create acceptance criteria
- Identify assumptions and open questions
- **Output**: Requirements specification document

### 2. **Architecture Design**
- Design technical solution
- Identify impacted modules and interfaces
- Assess risks and define testing strategy
- **Output**: Architecture specification document

### 3. **Implementation Planning**
- Break down into actionable tasks
- Estimate complexity and dependencies
- Create detailed execution sequence
- **Output**: Implementation plan document

### 4. **Implementation**
- Write production code
- Create comprehensive tests
- Follow repository conventions
- **Output**: Implementation summary document

### 5. **Code Review**
- Review for quality and standards compliance
- Check test coverage
- Identify issues and improvements
- **Output**: Review report document

### 6. **Verification**
- Verify acceptance criteria met
- Validate requirements coverage
- Run full test suite
- **Output**: Verification report document

### 7. **PR Package Generation**
- Generate PR description and title
- Create changelog and release notes
- Compile testing evidence
- **Output**: PR package document

## Quick Start

### Installation

The framework is already installed in this repository:

```
.claude/
├── agents/              # 7 specialized agents + orchestrator
├── workflows/           # Workflow documentation
└── commands/            # Command handlers

.artifacts/              # Workflow artifacts (gitignored except templates)
```

### Starting a Workflow

```bash
# Start workflow for a Jira story
start story PMX-123
```

The orchestrator will:
1. Initialize workflow state
2. Fetch story from Jira (or accept manual input)
3. Run Requirements Agent
4. Display requirements summary
5. **PAUSE** for your approval

### Approving a Stage

```bash
# Approve current stage
approve

# Or explicitly
approve requirements
```

The orchestrator will:
1. Validate current artifact
2. Mark stage as approved
3. Invoke next stage agent
4. Display next artifact summary
5. **PAUSE** for your approval

### Rejecting a Stage

```bash
# Reject with reason
reject - missing performance requirements

# Or reject and explain later
reject
```

The orchestrator will:
1. Log rejection reason
2. Keep workflow at current stage
3. Provide fix options
4. Wait for corrections

### Checking Status

```bash
# View workflow progress
status
```

Displays:
- Completed stages
- Current stage and status
- Pending stages
- Artifact locations
- Next action needed

## Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `start story <id>` | Initialize workflow | `start story PMX-123` |
| `approve` | Approve current stage | `approve` |
| `reject [reason]` | Reject current stage | `reject - incomplete` |
| `status` | View progress | `status` |
| `view <stage>` | Display artifact | `view requirements` |
| `retry <stage>` | Re-run agent | `retry architecture` |

## Workflow Example

### Complete Flow

```
User: "start story PMX-123"
System: [Runs Requirements Agent]
        ✅ Requirements Complete
        ⏸ Approve?

User: "approve"
System: [Runs Architecture Agent]
        ✅ Architecture Complete
        ⏸ Approve?

User: "reject - missing database design"
System: ❌ Rejected - awaiting fixes

User: [edits artifact]
User: "approve"
System: [Runs Planning Agent]
        ✅ Planning Complete
        ⏸ Approve?

User: "approve"
System: [Runs Implementation Agent]
        ✅ Implementation Complete
        ⏸ Approve?

User: "approve"
System: [Runs Review Agent]
        ✅ Review Complete
        ⏸ Approve?

User: "approve"
System: [Runs Verification Agent]
        ✅ Verification Complete
        ⏸ Approve?

User: "approve"
System: [Runs PR Agent]
        ✅ PR Package Complete
        🎉 Workflow Finished!
```

## Artifacts

All workflow artifacts are stored in `.artifacts/`:

```
.artifacts/
├── workflow-state.json              # Current workflow state
├── audit-log.md                     # Complete action history
├── PMX-123-requirements.md          # Stage 1 output
├── PMX-123-architecture.md          # Stage 2 output
├── PMX-123-implementation-plan.md   # Stage 3 output
├── PMX-123-implementation-summary.md # Stage 4 output
├── PMX-123-review-report.md         # Stage 5 output
├── PMX-123-verification-report.md   # Stage 6 output
└── PMX-123-pr-package.md            # Stage 7 output
```

### Workflow State

`workflow-state.json` tracks:
- Story ID and metadata
- Current stage
- Approved stages
- Status (InProgress|WaitingForApproval|Completed|Failed)
- Artifact paths
- Timestamps

### Audit Trail

`audit-log.md` records:
- All workflow actions
- Agent invocations and completions
- Approval and rejection decisions
- Timestamps and actors
- Complete history for compliance

## Agents

### SDLC Orchestrator

**Master controller** that:
- Manages workflow state
- Invokes specialized agents
- Enforces approval gates
- Validates artifacts
- Maintains audit trail

**Location**: `.claude/agents/sdlc-orchestrator.md`

### Specialized Agents

| Agent | Responsibility | Input | Output |
|-------|----------------|-------|--------|
| **Requirements** | Extract and document requirements | Jira Story | requirements.md |
| **Architecture** | Design technical solution | requirements.md | architecture.md |
| **Planning** | Break down into tasks | architecture.md | implementation-plan.md |
| **Implementation** | Write code and tests | implementation-plan.md | implementation-summary.md |
| **Review** | Code review | implementation-summary.md | review-report.md |
| **Verification** | Verify criteria met | review-report.md | verification-report.md |
| **PR** | Generate PR package | verification-report.md | pr-package.md |

**Location**: `.claude/agents/`

## Approval Gates

Every stage ends with a mandatory human approval gate:

```
┌────────────────────────────────┐
│  ✅ Stage Complete              │
│                                 │
│  Artifact: requirements.md      │
│                                 │
│  Summary:                       │
│  - 5 business requirements      │
│  - 12 functional requirements   │
│  - 8 acceptance criteria        │
│                                 │
│  ⏸ Workflow Paused              │
│                                 │
│  Commands:                      │
│  • approve - Continue           │
│  • reject  - Request changes    │
└────────────────────────────────┘
```

**Why Approval Gates?**

- ✅ Quality Control - Human review catches issues early
- ✅ Context Preservation - Build on validated foundations
- ✅ Risk Mitigation - Prevent cascading errors
- ✅ Team Alignment - Ensure shared understanding
- ✅ Audit Compliance - Document decision points

## Customization

### Adding a New Stage

1. Create agent definition:
   ```bash
   .claude/agents/new-stage-agent.md
   ```

2. Update orchestrator to invoke new agent

3. Define artifact template

4. Add approval gate

5. Update workflow documentation

### Customizing Agent Behavior

Edit agent definition file:
```bash
.claude/agents/requirements-agent.md
```

Modify:
- Responsibilities
- Process steps
- Output format
- Validation rules

### Modifying Approval Logic

Edit orchestrator:
```bash
.claude/agents/sdlc-orchestrator.md
```

**Note**: Maintain human-in-the-loop principle

## Best Practices

### For Users

1. **Review Thoroughly** - Read artifacts before approving
2. **Provide Clear Feedback** - Specific rejection reasons help
3. **Check Status Often** - Monitor workflow progress
4. **Document Manual Changes** - Log why artifacts were edited
5. **Validate Early** - Catch issues in early stages

### For Agents

1. **Follow Templates** - Use defined artifact formats
2. **Be Complete** - Include all required sections
3. **Be Clear** - Write human-readable content
4. **Validate Input** - Check input artifacts first
5. **Flag Issues** - Report problems clearly

### For Orchestrator

1. **Enforce Gates** - Never skip approval
2. **Validate Artifacts** - Check completeness
3. **Maintain State** - Keep workflow current
4. **Log Everything** - Complete audit trail
5. **Be Transparent** - Show what's happening

## Error Handling

### Agent Failures

- Logged to audit trail
- Clear error messages
- Recovery options provided:
  - Retry agent
  - Manual artifact creation
  - Skip to manual step

### Validation Failures

- Specific failure details
- Keep at current stage
- Options to fix:
  - Re-run agent
  - Edit manually
  - View artifact

### State Corruption

- Detected automatically
- Recovery attempted
- Manual intervention requested if needed

## Integration

### Jira Integration

**Option A**: Jira MCP Server
- Automatic story fetch
- Real-time updates

**Option B**: GitHub-Jira Integration
- Use `gh api` commands
- Query linked issues

**Option C**: Manual Input
- Paste story details
- Workflow proceeds normally

### Git Integration

- Feature branches per story
- Conventional commits
- Automated PR creation ready

### CI/CD Integration

- Run tests during verification
- Generate coverage reports
- Deploy after PR merge

## Metrics and Analytics

Track workflow performance:
- **Time per stage** - Identify bottlenecks
- **Rejection rate** - Measure quality
- **Agent retry count** - Agent effectiveness
- **Total workflow duration** - Overall efficiency
- **Approval wait times** - Team responsiveness

Extract from `audit-log.md` or `workflow-state.json`

## Troubleshooting

### "No active workflow found"

**Solution**: Start a new workflow with `start story <id>`

### "Workflow not waiting for approval"

**Solution**: Check status with `status` command

### "Artifact validation failed"

**Solution**: View artifact with `view <stage>`, fix issues, then approve

### "Agent failed to complete"

**Solution**: Check error message, retry with `retry <stage>`

### "State file corrupted"

**Solution**: Restore from backup or recreate workflow

## FAQ

**Q: Can I skip a stage?**  
A: No. All stages are mandatory for quality assurance.

**Q: Can I run stages in parallel?**  
A: No. Stages are sequential; each depends on the previous.

**Q: Can I edit artifacts manually?**  
A: Yes. Edit the markdown file, then approve.

**Q: What if I don't have Jira?**  
A: Provide story details manually when prompted.

**Q: Can I add custom stages?**  
A: Yes. Create agent definition and update orchestrator.

**Q: How do I restart a failed workflow?**  
A: Use `retry <stage>` or edit artifact and `approve`.

**Q: Are artifacts version controlled?**  
A: Templates are versioned. Story artifacts are gitignored.

**Q: Can I use this for bug fixes?**  
A: Yes. The workflow adapts to story type.

## Support

- **Documentation**: `.claude/workflows/agentic-sdlc.md`
- **Agent Definitions**: `.claude/agents/`
- **Command Reference**: `.claude/commands/`
- **Audit Logs**: `.artifacts/audit-log.md`
- **Workflow State**: `.artifacts/workflow-state.json`

## Contributing

To improve the framework:

1. Identify improvement area
2. Update relevant agent or orchestrator
3. Test with sample workflow
4. Document changes
5. Update this README

## License

This framework is part of the claude-capstone project.

## Version

**Version**: 1.0  
**Release Date**: 2026-05-31  
**Status**: Production Ready  

---

## Getting Started Now

Ready to try it? Start a workflow:

```bash
# Initialize workflow for your Jira story
start story YOUR-STORY-ID

# Follow the prompts
# Review each artifact
# Approve or reject each stage
# Complete the workflow
# Create your pull request!
```

**Happy Building!** 🚀
