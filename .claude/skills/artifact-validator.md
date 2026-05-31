---
name: artifact-validator
description: "Validate SDLC workflow artifacts - check existence, completeness, and required sections"
---

# Artifact Validator Skill

## Purpose

Reusable skill for validating workflow artifacts across any Agentic SDLC workflow. Ensures artifacts meet quality standards before stage approval.

## Usage

Invoke this skill whenever you need to:
- Check if artifact exists
- Validate artifact completeness
- Verify required sections present
- Check artifact format
- Get artifact metrics

## Operations

### 1. Check Existence

**Usage**: `artifact-validator exists <artifact-path>`

**Action**: Checks if artifact file exists

**Example**:
```bash
artifact-validator exists .artifacts/PMX-123-requirements.md
```

**Output**:
```
✅ Artifact exists
Path: .artifacts/PMX-123-requirements.md
Size: 12.5 KB
Modified: 2026-05-31T10:30:00Z
```

**Or**:
```
❌ Artifact not found
Path: .artifacts/PMX-123-requirements.md
```

### 2. Validate Completeness

**Usage**: `artifact-validator complete <artifact-path>`

**Action**: Checks artifact is not empty and has content

**Example**:
```bash
artifact-validator complete .artifacts/PMX-123-architecture.md
```

**Output**:
```
✅ Artifact complete
Lines: 245
Words: 3,421
Characters: 24,567
Sections: 12
```

**Or**:
```
❌ Artifact incomplete
Issue: File is empty (0 bytes)
```

### 3. Validate Required Sections

**Usage**: `artifact-validator sections <stage> <artifact-path>`

**Action**: Verifies artifact contains required sections for stage

**Example**:
```bash
artifact-validator sections requirements .artifacts/PMX-123-requirements.md
```

**Checks for Requirements**:
- `## Story Overview`
- `## Business Requirements`
- `## Functional Requirements`
- `## Acceptance Criteria`

**Output**:
```
✅ All required sections present

Found 12/12 sections:
✅ Story Overview
✅ Story Description
✅ Business Requirements
✅ Functional Requirements
✅ Non-Functional Requirements
✅ Assumptions
✅ Open Questions
✅ Acceptance Criteria
✅ Out of Scope
✅ Related Work
```

**Or**:
```
❌ Missing required sections

Missing:
❌ Business Requirements
❌ Acceptance Criteria

Found:
✅ Story Overview
✅ Functional Requirements
```

### 4. Validate by Stage

**Usage**: `artifact-validator stage <stage> <artifact-path>`

**Action**: Runs full validation for specific stage

**Stages**: requirements, architecture, planning, implementation, review, verification, pr

**Example**:
```bash
artifact-validator stage architecture .artifacts/PMX-123-architecture.md
```

**Performs**:
- Existence check
- Completeness check
- Required sections check
- Stage-specific validations

**Output**:
```
✅ Architecture artifact valid

Checks Passed:
✅ File exists
✅ File not empty (15.2 KB)
✅ All required sections present
✅ Architecture diagram included
✅ Impacted modules listed
✅ Interfaces defined
✅ Risks assessed

Quality Score: 95/100
```

### 5. Get Metrics

**Usage**: `artifact-validator metrics <artifact-path>`

**Action**: Returns detailed artifact metrics

**Example**:
```bash
artifact-validator metrics .artifacts/PMX-123-implementation-summary.md
```

**Output**:
```
Artifact Metrics:

File: PMX-123-implementation-summary.md
Size: 18.7 KB
Created: 2026-05-31T12:00:00Z
Modified: 2026-05-31T12:45:00Z

Content:
  Lines: 487
  Words: 6,234
  Characters: 45,678
  
Structure:
  Sections: 18
  Subsections: 42
  Code Blocks: 15
  Lists: 28
  
Completeness: 98%
Readability: High
```

### 6. Compare Artifacts

**Usage**: `artifact-validator compare <artifact1> <artifact2>`

**Action**: Compares two artifacts for consistency

**Example**:
```bash
artifact-validator compare .artifacts/PMX-123-requirements.md .artifacts/PMX-123-architecture.md
```

**Output**:
```
Consistency Check:

✅ Story ID matches: PMX-123
✅ Requirements referenced in Architecture
✅ All functional requirements addressed
⚠️ 2 requirements without explicit architecture coverage
✅ All acceptance criteria traceable

Consistency Score: 92/100
```

## Stage-Specific Validations

### Requirements Stage

**Required Sections**:
- Story Overview
- Business Requirements
- Functional Requirements
- Acceptance Criteria

**Additional Checks**:
- At least 1 business requirement
- At least 1 functional requirement
- At least 1 acceptance criterion
- Acceptance criteria in Given-When-Then format

### Architecture Stage

**Required Sections**:
- Technical Solution
- Impacted Modules
- Interfaces
- Risk Assessment
- Testing Strategy

**Additional Checks**:
- At least 1 impacted module listed
- At least 1 interface defined
- At least 1 risk identified
- Testing strategy includes unit, integration, functional

### Planning Stage

**Required Sections**:
- Task Breakdown
- Execution Sequence
- Testing Plan
- Deployment Plan

**Additional Checks**:
- At least 3 tasks defined
- Tasks have complexity estimates
- Dependencies mapped
- Testing plan comprehensive

### Implementation Stage

**Required Sections**:
- Tasks Completed
- Files Changed
- Tests Added
- Test Results

**Additional Checks**:
- At least 1 task completed
- At least 1 file changed
- At least 1 test added
- Test results show passing tests

### Review Stage

**Required Sections**:
- Review Summary
- Architecture Compliance
- Code Quality Assessment
- Issues Summary
- Approval Decision

**Additional Checks**:
- Review status present
- Issues categorized by severity
- Clear approval decision

### Verification Stage

**Required Sections**:
- Verification Summary
- Test Execution Results
- Acceptance Criteria Verification
- Final Verification Decision

**Additional Checks**:
- All tests passing
- All acceptance criteria verified
- Clear pass/fail decision

### PR Stage

**Required Sections**:
- PR Title
- PR Description
- Changelog
- Release Notes

**Additional Checks**:
- PR title follows convention
- Changelog has at least 1 entry
- Release notes present

## Implementation

### Validation Rules

Defined in `.claude/skills/artifact-validator-rules.json`:

```json
{
  "requirements": {
    "required_sections": [
      "## Story Overview",
      "## Business Requirements",
      "## Functional Requirements",
      "## Acceptance Criteria"
    ],
    "min_business_requirements": 1,
    "min_functional_requirements": 1,
    "min_acceptance_criteria": 1
  },
  "architecture": {
    "required_sections": [
      "## Technical Solution",
      "## Impacted Modules",
      "## Interfaces"
    ]
  }
}
```

### Custom Validators

Add stage-specific validation functions.

### Severity Levels

- **Error**: Must fix before approval
- **Warning**: Should fix but not blocking
- **Info**: Suggestions for improvement

## Error Handling

### File Not Found

```
Error: Artifact not found
Path: .artifacts/PMX-123-requirements.md
Action: Generate artifact or check path
```

### Empty File

```
Error: Artifact is empty
Path: .artifacts/PMX-123-requirements.md
Size: 0 bytes
Action: Regenerate artifact or add content
```

### Missing Sections

```
Warning: Required sections missing
Missing:
  - ## Business Requirements
  - ## Acceptance Criteria
Recommendation: Add missing sections before approval
```

## Usage in Orchestrator

```javascript
// Before approving stage
const validation = Skill({
  skill: "artifact-validator",
  args: "stage requirements .artifacts/PMX-123-requirements.md"
});

if (validation.includes("✅")) {
  // Proceed with approval
} else {
  // Reject and show validation errors
}

// Check specific sections
Skill({
  skill: "artifact-validator",
  args: "sections architecture .artifacts/PMX-123-architecture.md"
});

// Get metrics for reporting
Skill({
  skill: "artifact-validator",
  args: "metrics .artifacts/PMX-123-implementation-summary.md"
});
```

## Benefits

✅ **Quality Assurance** - Ensure artifacts meet standards  
✅ **Consistency** - Standardized validation across stages  
✅ **Early Detection** - Catch issues before approval  
✅ **Automated** - No manual checklist needed  
✅ **Extensible** - Add custom validators  

## Configuration

### Custom Rules

Create `.claude/artifact-validation-rules.json` to override defaults:

```json
{
  "requirements": {
    "required_sections": [...],
    "min_acceptance_criteria": 3,
    "custom_checks": [
      {
        "name": "performance_requirements",
        "check": "Performance requirements must be quantified"
      }
    ]
  }
}
```

### Strictness Level

Set validation strictness:
- `strict` - All checks must pass
- `moderate` - Critical checks must pass
- `lenient` - Only basic checks

## Extension Points

### Add Custom Stage

Define validation rules for new stages.

### Add Custom Checks

Implement stage-specific validators.

### Add Formatters

Check specific format requirements (e.g., Given-When-Then).

---

**Skill**: artifact-validator v1.0  
**Type**: Reusable utility  
**Compatible**: Any Agentic SDLC workflow
