# Claude Rules Directory

This directory contains **validation rules and governance policies** for the weather API project.

## Purpose

Define **enforceable rules** that:
- Validate data quality
- Enforce API contracts
- Maintain code standards
- Guide SDLC workflow decisions

## Rule Types

### 1. Data Validation Rules
**File**: `weather-api-validation.md`
- CSV data format rules
- Data type constraints
- Business logic validation

### 2. Code Quality Rules
**File**: `code-quality-rules.md` (future)
- Test coverage thresholds (currently 50%)
- Linting standards
- Security checks

### 3. SDLC Workflow Rules
**File**: `workflow-rules.md` (future)
- Stage approval criteria
- Artifact validation requirements
- PR creation rules

## How Rules Are Used

### By Claude Agents
Agents reference these rules when:
- Generating code
- Validating artifacts
- Making architectural decisions

### By Tests
Tests enforce rules through:
- Unit tests (`test/unit/data.test.js`)
- Functional tests (`test/functional/weather.test.js`)

### By Hooks
Settings hooks can validate rules:
```json
{
  "hooks": {
    "beforeCommit": "npm test"
  }
}
```

## Rule Format

Each rule should specify:
1. **Requirement**: What must be true
2. **Validation**: How to check it
3. **Enforcement Point**: Where it's checked
4. **Severity**: CRITICAL/WARNING/MEDIUM/LOW

## Available Rules

| File | Description | Status |
|------|-------------|--------|
| `weather-api-validation.md` | API data validation rules | ✅ Active |
| `code-quality-rules.md` | Code standards | 📝 Planned |
| `workflow-rules.md` | SDLC governance | 📝 Planned |

---

**Last Updated**: 2026-06-01
