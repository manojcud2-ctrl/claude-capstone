---
name: github-integrator
description: "Interact with GitHub via MCP or gh CLI - create PRs, manage issues, get repository info"
---

# GitHub Integrator Skill

## Purpose

Reusable skill for interacting with GitHub using either MCP (Model Context Protocol) servers or GitHub CLI (`gh`). Automatically selects the best available method.

## Usage

Invoke this skill whenever you need to:
- Create pull requests
- Get repository information
- List pull requests or issues
- Update PR status
- Add reviewers or labels
- Check CI/CD status

## Integration Methods

### Method 1: GitHub MCP Server (Preferred)

**Advantages**:
- ✅ Native integration with Claude
- ✅ No CLI installation needed
- ✅ Direct API access
- ✅ Better error handling
- ✅ Structured responses

**Setup**:
```bash
# Add GitHub MCP server (if available)
# Check your MCP configuration
```

**Available MCP Tools**:
- `github_create_pull_request`
- `github_get_pull_request`
- `github_list_pull_requests`
- `github_search_repositories`
- `github_get_file_contents`
- `github_create_issue`
- `github_add_pr_comment`

### Method 2: GitHub CLI (`gh`)

**Advantages**:
- ✅ Widely available
- ✅ Comprehensive features
- ✅ Well documented

**Requirements**:
```bash
# Install gh CLI
winget install GitHub.cli  # Windows
brew install gh             # Mac
apt install gh              # Linux

# Authenticate
gh auth login
gh auth status
```

**Available Commands**:
- `gh pr create`
- `gh pr view`
- `gh pr list`
- `gh pr merge`
- `gh issue create`
- `gh repo view`

### Method 3: Manual (Documentation Only)

**Use when**: Neither MCP nor CLI available

**Provides**: Complete PR package for manual creation

## Operations

### 1. Create Pull Request

**Usage**: `github-integrator create-pr <title> <body> <branch> [base]`

**Action**: Creates PR using best available method

**Example**:
```bash
github-integrator create-pr \
  "feat: Add weather endpoint (PMX-123)" \
  "$(cat .artifacts/PMX-123-pr-package.md)" \
  "feature/PMX-123-weather" \
  "main"
```

**Process**:

```javascript
// 1. Try MCP first
if (hasMCP('github_create_pull_request')) {
  const pr = callMCP('github_create_pull_request', {
    owner: getRepoOwner(),
    repo: getRepoName(),
    title: title,
    body: body,
    head: branch,
    base: base || 'main',
    draft: false
  });
  
  return {
    method: 'mcp',
    url: pr.html_url,
    number: pr.number,
    status: 'success'
  };
}

// 2. Try gh CLI
if (hasGhCLI()) {
  const result = bash(`gh pr create --title "${title}" --body "${body}" --base ${base}`);
  const url = bash('gh pr view --json url -q .url');
  
  return {
    method: 'gh-cli',
    url: url,
    status: 'success'
  };
}

// 3. Manual fallback
return {
  method: 'manual',
  message: 'Created PR package for manual creation',
  package: '.artifacts/{storyId}-pr-package.md',
  status: 'needs_manual_creation'
};
```

**Output**:
```
✅ Pull Request Created

Method: GitHub MCP Server
URL: https://github.com/owner/repo/pull/123
Number: #123
Status: Open
Branch: feature/PMX-123-weather → main
```

### 2. Get Pull Request Info

**Usage**: `github-integrator get-pr <pr-number>`

**Action**: Retrieves PR details

**Example**:
```bash
github-integrator get-pr 123
```

**Output**:
```
Pull Request #123

Title: feat: Add weather endpoint (PMX-123)
Author: user
Status: open
Base: main ← Head: feature/PMX-123-weather
Created: 2026-05-31T10:00:00Z
Updated: 2026-05-31T15:30:00Z

Reviewers:
  • alice (approved)
  • bob (changes requested)

Checks:
  ✅ CI/CD Pipeline (passed)
  ✅ Tests (passed)
  ⏳ Security Scan (pending)

Comments: 5
Commits: 12
Files Changed: 8
```

### 3. List Pull Requests

**Usage**: `github-integrator list-prs [status] [limit]`

**Action**: Lists pull requests

**Example**:
```bash
github-integrator list-prs open 10
```

**Output**:
```
Open Pull Requests (10)

#125  feat: Add caching layer               feature/caching → main
      Created: 2 hours ago | alice

#124  fix: Handle null weather data         bugfix/null-check → main
      Created: 5 hours ago | bob

#123  feat: Add weather endpoint            feature/PMX-123-weather → main
      Created: 6 hours ago | user
      
...
```

### 4. Add PR Reviewers

**Usage**: `github-integrator add-reviewers <pr-number> <reviewers>`

**Action**: Adds reviewers to PR

**Example**:
```bash
github-integrator add-reviewers 123 "alice,bob,charlie"
```

### 5. Add PR Labels

**Usage**: `github-integrator add-labels <pr-number> <labels>`

**Action**: Adds labels to PR

**Example**:
```bash
github-integrator add-labels 123 "feature,enhancement,high-priority"
```

### 6. Check PR Status

**Usage**: `github-integrator check-pr <pr-number>`

**Action**: Checks PR CI/CD status

**Example**:
```bash
github-integrator check-pr 123
```

**Output**:
```
PR #123 Status

CI/CD Checks:
  ✅ Build (passed in 2m 34s)
  ✅ Unit Tests (passed - 147/147)
  ✅ Integration Tests (passed - 28/28)
  ✅ Lint (passed)
  ⏳ Security Scan (running)
  
Review Status:
  ✅ 1 approval (alice)
  ❌ 1 change requested (bob)
  ⏳ 2 pending (charlie, david)

Mergeable: No (changes requested)
```

### 7. Get Repository Info

**Usage**: `github-integrator repo-info`

**Action**: Gets current repository information

**Example**:
```bash
github-integrator repo-info
```

**Output**:
```
Repository Information

Name: weather-app
Owner: acme
Full Name: acme/weather-app
URL: https://github.com/acme/weather-app

Description: Weather API backend service

Visibility: private
Default Branch: main
Language: JavaScript

Stats:
  Stars: 42
  Forks: 8
  Open Issues: 5
  Open PRs: 3
  
Settings:
  Issues: enabled
  Projects: enabled
  Wiki: disabled
```

## MCP Integration Details

### GitHub MCP Server Setup

If using GitHub MCP server with Claude Code, register it at user scope:

```powershell
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "YOUR_TOKEN_HERE"
claude mcp add-json github --scope user "{\"type\":\"http\",\"url\":\"https://api.githubcopilot.com/mcp\",\"headers\":{\"Authorization\":\"Bearer $env:GITHUB_PERSONAL_ACCESS_TOKEN\"}}"
```

Then verify with:

```powershell
claude mcp list
```

### MCP Tool Mapping

```javascript
// PR Operations
github_create_pull_request({
  owner, repo, title, body, head, base, draft
})

github_get_pull_request({
  owner, repo, pull_number
})

github_list_pull_requests({
  owner, repo, state, per_page
})

github_update_pull_request({
  owner, repo, pull_number, title, body, state
})

// Issue Operations
github_create_issue({
  owner, repo, title, body, labels, assignees
})

github_list_issues({
  owner, repo, state, labels
})

// Repository Operations
github_get_repository({
  owner, repo
})

github_search_repositories({
  query, per_page
})

// File Operations
github_get_file_contents({
  owner, repo, path, ref
})

github_create_or_update_file({
  owner, repo, path, message, content, branch
})
```

## Usage in PR Agent

```javascript
// In PR Agent, use GitHub Integrator skill

// 1. Create PR
const result = Skill({
  skill: "github-integrator",
  args: `create-pr "${prTitle}" "$(cat .artifacts/${storyId}-pr-package.md)" "${branch}" "main"`
});

// Check result
if (result.status === 'success') {
  console.log(`PR created: ${result.url}`);
} else if (result.status === 'needs_manual_creation') {
  console.log(`Manual creation needed. Package: ${result.package}`);
}

// 2. Add reviewers
Skill({
  skill: "github-integrator",
  args: `add-reviewers ${prNumber} "alice,bob"`
});

// 3. Add labels
Skill({
  skill: "github-integrator",
  args: `add-labels ${prNumber} "feature,sdlc-workflow"`
});

// 4. Check status
Skill({
  skill: "github-integrator",
  args: `check-pr ${prNumber}`
});
```

## Error Handling

### MCP Not Available

```
ℹ️ GitHub MCP Server not found

Falling back to GitHub CLI (gh)...

To enable MCP:
1. Install GitHub MCP server
2. Configure in MCP settings
3. Restart Claude Code
```

### gh CLI Not Available

```
⚠️ GitHub CLI (gh) not installed

Install with:
  Windows: winget install GitHub.cli
  Mac: brew install gh
  Linux: apt install gh

Then authenticate:
  gh auth login

Falling back to manual PR creation...
```

### Authentication Failed

```
❌ GitHub authentication failed

Fix:
  gh auth login
  gh auth status

Or provide GITHUB_TOKEN environment variable
```

### Repository Not Found

```
❌ Repository not found: owner/repo

Check:
1. Repository exists
2. You have access
3. Remote URL correct: git remote -v
```

## Benefits

✅ **Flexible** - Multiple integration methods  
✅ **Automatic** - Selects best available method  
✅ **Robust** - Fallback options  
✅ **Complete** - Full GitHub API coverage  
✅ **Error Handling** - Clear error messages  

## Future Enhancements

- **GitHub Actions**: Trigger workflows
- **Branch Protection**: Check rules
- **Code Review**: Automated review comments
- **Merge Strategies**: Auto-merge when approved
- **Notifications**: Slack/email on PR events

---

**Skill**: github-integrator v1.0  
**Type**: Integration utility  
**Methods**: MCP (preferred), gh CLI (fallback), Manual (last resort)
