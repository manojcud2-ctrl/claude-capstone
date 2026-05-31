---
name: jira-integrator
description: "Interact with Jira - fetch issues, update stories, get subtasks, and manage workflow transitions"
---

# Jira Integrator Skill

## Purpose

Reusable skill for interacting with Jira using the REST API. Provides a consistent interface for fetching and updating Jira issues, stories, and related data.

## Usage

Invoke this skill whenever you need to:
- Fetch Jira story details
- Get issue metadata (status, priority, type)
- Retrieve subtasks
- Read comments and descriptions
- Update issue fields
- Transition issues through workflow
- Search for issues using JQL

## Configuration

**Jira Instance**: `https://manoj-ai-workbench.atlassian.net/`
**Authentication**: Uses `JIRA_TOKEN` environment variable
**User**: `manoj_thangaraj@epam.com`

## Operations

### 1. Fetch Issue Details

**Usage**: `jira-integrator get-issue <issue-key>`

**Example**:
```bash
jira-integrator get-issue WA-46
```

**Implementation**:
```bash
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -H "Accept: application/json" \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}"
```

**Returns**:
```json
{
  "key": "WA-46",
  "fields": {
    "summary": "Issue title",
    "description": { "type": "doc", "content": [...] },
    "status": { "name": "To Do" },
    "priority": { "name": "Medium" },
    "issuetype": { "name": "Story" },
    "subtasks": [...],
    "comment": { "comments": [...] }
  }
}
```

**Parse Response**:
- **Summary**: `fields.summary` - Issue title
- **Description**: `fields.description.content` - Atlassian Document Format (parse text nodes)
- **Status**: `fields.status.name` - Current status (To Do, In Progress, Done)
- **Priority**: `fields.priority.name` - Priority level
- **Type**: `fields.issuetype.name` - Issue type (Story, Task, Bug, etc.)
- **Subtasks**: `fields.subtasks[]` - Array of subtask objects
- **Comments**: `fields.comment.comments[]` - Array of comment objects

### 2. Get Issue with Expanded Fields

**Usage**: `jira-integrator get-issue-expanded <issue-key>`

**Example**:
```bash
jira-integrator get-issue-expanded WA-46
```

**Implementation**:
```bash
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -H "Accept: application/json" \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}?expand=renderedFields,names,schema,operations,changelog"
```

**Additional Fields**:
- **renderedFields**: HTML-rendered versions of fields
- **changelog**: Issue history and updates
- **operations**: Available actions for the issue

### 3. Update Issue

**Usage**: `jira-integrator update-issue <issue-key> <field> <value>`

**Example**:
```bash
jira-integrator update-issue WA-46 description "Updated description text"
```

**Implementation**:
```bash
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -X PUT \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "description": {
        "type": "doc",
        "version": 1,
        "content": [
          {
            "type": "paragraph",
            "content": [{"type": "text", "text": "'"${VALUE}"'"}]
          }
        ]
      }
    }
  }' \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}"
```

### 4. Transition Issue

**Usage**: `jira-integrator transition-issue <issue-key> <transition-name>`

**Example**:
```bash
jira-integrator transition-issue WA-46 "In Progress"
```

**Implementation**:
```bash
# First, get available transitions
TRANSITIONS=$(curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}/transitions")

# Find transition ID by name and execute
TRANSITION_ID=$(echo "$TRANSITIONS" | jq -r '.transitions[] | select(.name=="'"${TRANSITION_NAME}"'") | .id')

curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"transition":{"id":"'"${TRANSITION_ID}"'"}}' \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}/transitions"
```

### 5. Search Issues (JQL)

**Usage**: `jira-integrator search-jql "<jql-query>"`

**Example**:
```bash
jira-integrator search-jql "project = WA AND status = 'To Do' ORDER BY priority DESC"
```

**Implementation**:
```bash
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jql": "'"${JQL_QUERY}"'",
    "maxResults": 50,
    "fields": ["summary", "status", "priority", "issuetype", "assignee"]
  }' \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/search"
```

### 6. Add Comment

**Usage**: `jira-integrator add-comment <issue-key> <comment-text>`

**Example**:
```bash
jira-integrator add-comment WA-46 "Requirements analysis completed"
```

**Implementation**:
```bash
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "type": "doc",
      "version": 1,
      "content": [
        {
          "type": "paragraph",
          "content": [{"type": "text", "text": "'"${COMMENT_TEXT}"'"}]
        }
      ]
    }
  }' \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}/comment"
```

### 7. Get Subtasks

**Usage**: `jira-integrator get-subtasks <issue-key>`

**Example**:
```bash
jira-integrator get-subtasks WA-46
```

**Implementation**:
```bash
# Fetch parent issue and extract subtasks
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  -H "Accept: application/json" \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${ISSUE_KEY}" \
  | jq '.fields.subtasks'
```

## Helper Functions

### Parse Atlassian Document Format (ADF)

Jira uses ADF for rich text fields like description. To extract plain text:

```bash
parse_adf_to_text() {
  local json="$1"
  echo "$json" | jq -r '
    .. | 
    select(.type? == "text") | 
    .text
  ' | tr '\n' ' '
}
```

**Usage**:
```bash
DESCRIPTION=$(curl -s ... | jq '.fields.description')
PLAIN_TEXT=$(parse_adf_to_text "$DESCRIPTION")
```

### Check if Issue Exists

```bash
issue_exists() {
  local issue_key="$1"
  local response=$(curl -s -w "%{http_code}" -o /dev/null \
    -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
    "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${issue_key}")
  
  [[ "$response" == "200" ]]
}
```

## Error Handling

### Common Error Codes

- **400** - Bad Request (invalid field values or format)
- **401** - Unauthorized (invalid credentials or token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (issue doesn't exist)
- **500** - Server Error (Jira internal error)

### Error Response Format

```json
{
  "errorMessages": ["Issue does not exist or you do not have permission to see it."],
  "errors": {}
}
```

### Handling Errors in Scripts

```bash
response=$(curl -s -w "\n%{http_code}" -u "..." "...")
body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)

if [[ "$status" != "200" ]]; then
  echo "Error: HTTP $status"
  echo "$body" | jq -r '.errorMessages[]'
  exit 1
fi
```

## Best Practices

1. **Always check JIRA_TOKEN is set**:
   ```bash
   if [[ -z "${JIRA_TOKEN}" ]]; then
     echo "Error: JIRA_TOKEN environment variable not set"
     exit 1
   fi
   ```

2. **Use `jq` for JSON parsing**: More reliable than regex or string manipulation

3. **Cache responses**: If making multiple queries, cache the issue data locally

4. **Handle ADF properly**: Use the helper function to parse rich text

5. **Validate issue keys**: Format should match `[A-Z]+-[0-9]+`

6. **Use appropriate HTTP methods**:
   - GET - Fetch data
   - POST - Create or search
   - PUT - Update existing
   - DELETE - Remove

## Examples

### Example 1: Get Story Summary

```bash
#!/bin/bash
get_story_summary() {
  local issue_key="$1"
  
  curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
    -H "Accept: application/json" \
    "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${issue_key}" \
    | jq -r '{
        key: .key,
        title: .fields.summary,
        status: .fields.status.name,
        priority: .fields.priority.name,
        type: .fields.issuetype.name
      }'
}

# Usage
get_story_summary "WA-46"
```

### Example 2: Extract Description as Plain Text

```bash
#!/bin/bash
get_story_description() {
  local issue_key="$1"
  
  curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
    -H "Accept: application/json" \
    "https://manoj-ai-workbench.atlassian.net/rest/api/3/issue/${issue_key}" \
    | jq -r '.fields.description.content[] | .. | select(.type? == "text") | .text'
}

# Usage
get_story_description "WA-46"
```

### Example 3: List All Stories in Project

```bash
#!/bin/bash
list_project_stories() {
  local project_key="$1"
  
  curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "jql": "project = '"${project_key}"' AND issuetype = Story ORDER BY created DESC",
      "maxResults": 50,
      "fields": ["summary", "status", "priority"]
    }' \
    "https://manoj-ai-workbench.atlassian.net/rest/api/3/search" \
    | jq -r '.issues[] | "\(.key): \(.fields.summary) [\(.fields.status.name)]"'
}

# Usage
list_project_stories "WA"
```

## Integration with Agents

Agents should invoke this skill instead of directly calling Jira REST API:

**Requirements Agent**:
```markdown
### Step 1: Fetch Jira Story

Use jira-integrator skill:
- Operation: `get-issue-expanded WA-123`
- Parse response for requirements extraction
```

**Planning Agent**:
```markdown
### Step 2: Update Jira Story

Use jira-integrator skill:
- Operation: `add-comment WA-123 "Implementation plan ready"`
- Link to artifacts in comment
```

## Troubleshooting

### Token Not Working
```bash
# Verify token is set
echo $JIRA_TOKEN

# Test authentication
curl -s -u "manoj_thangaraj@epam.com:${JIRA_TOKEN}" \
  "https://manoj-ai-workbench.atlassian.net/rest/api/3/myself" | jq
```

### Issue Not Found
- Verify issue key format (WA-XX)
- Check project permissions
- Ensure issue exists in the project

### JSON Parsing Errors
- Install `jq`: `winget install jqlang.jq`
- Validate JSON response before parsing
- Use `| jq .` to pretty-print and debug

## API Reference

**Jira REST API v3 Documentation**:
https://developer.atlassian.com/cloud/jira/platform/rest/v3/

**Common Endpoints**:
- `/rest/api/3/issue/{issueKey}` - Get/Update issue
- `/rest/api/3/search` - JQL search
- `/rest/api/3/issue/{issueKey}/comment` - Comments
- `/rest/api/3/issue/{issueKey}/transitions` - Workflow transitions
- `/rest/api/3/myself` - Current user info

---

**Version**: 1.0  
**Last Updated**: 2026-05-31
