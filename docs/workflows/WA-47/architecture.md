# Architecture Specification - WA-47

## Overview

**Story**: Get city condition data by city name
**Requirements**: `docs/workflows/WA-47/requirements.md`
**Design Decision**: Query Parameter approach - `/api/condition?city={cityName}`

## Technical Solution

### High-Level Design

The solution implements a lightweight REST endpoint that returns only the weather condition for a specified city. The endpoint follows the query parameter pattern as confirmed by the user, providing an alternative to the existing path parameter pattern used in other endpoints.

**Architecture Pattern**: Layered architecture with Express.js routing layer accessing shared in-memory data store.

**Key Characteristics**:
- Minimal response payload (only city name and condition)
- Uses existing data loading infrastructure
- Zero external dependencies
- Non-blocking, in-memory data access for sub-100ms response times

### Key Design Decisions

1. **Decision**: Use query parameter instead of path parameter
   - **Rationale**: Per user confirmation, query parameter approach provides flexibility
   - **Trade-offs**: Less RESTful than path parameters, but more extensible
   - **Alternatives Considered**: Path parameter - more consistent but user confirmed query preference

2. **Decision**: Return minimal JSON response (city + condition only)
   - **Rationale**: Meets business requirement for lightweight queries (80% payload reduction)
   - **Trade-offs**: Clients needing multiple fields must make multiple API calls
   - **Alternatives Considered**: Include metadata - rejected to keep response minimal

3. **Decision**: Reuse existing weatherData array and case-insensitive matching
   - **Rationale**: Maintains consistency with existing endpoint behavior
   - **Trade-offs**: O(n) search, but acceptable for current scale
   - **Alternatives Considered**: Indexed structure - unnecessary for 10 cities

4. **Decision**: Return raw condition string without formatting
   - **Rationale**: Condition is already clean (unlike numeric fields needing units)
   - **Trade-offs**: No additional context
   - **Alternatives Considered**: Add descriptions - rejected as unnecessary

5. **Decision**: Follow existing error handling pattern
   - **Rationale**: Maintains API consistency
   - **Trade-offs**: None
   - **Alternatives Considered**: Different format - rejected for consistency

### Architecture Diagram

```
Client App
    |
    | GET /api/condition?city=Chicago
    v
Express.js Router
  |
  +-- GET /api/condition (new)
  |   - Extract query param
  |   - Validate input
  |   - Call lookup logic
  |
  +-- Existing Routes
      - GET /api/health
      - GET /api/cities
      - GET /api/weather/:city
    |
    v
weatherData[] (in-memory)
    ^
    |
loadWeatherData() on startup
    ^
    |
weather-data.csv
```

## Component Design

### Component 1: Query Parameter Route Handler

- **Purpose**: Handle GET requests to /api/condition and extract city from query string
- **Responsibilities**: 
  - Extract and validate city query parameter
  - Perform case-insensitive city lookup in weatherData array
  - Return formatted JSON response or error
  - Apply input sanitization
- **Location**: src/server.js (line ~70, after existing routes)
- **Dependencies**: Express.js req.query, existing weatherData array
- **Interface**:
  ```javascript
  app.get('/api/condition', (req, res) => {
    // Extract city from query parameter
    // Validate presence
    // Perform lookup
    // Return response or error
  });
  ```

### Component 2: City Lookup Logic

- **Purpose**: Find weather data for specified city (case-insensitive)
- **Responsibilities**: 
  - Convert city name to lowercase for comparison
  - Search weatherData array using Array.find()
  - Return matching record or undefined
- **Location**: Inline within route handler
- **Dependencies**: weatherData array
- **Interface**:
  ```javascript
  const cityName = req.query.city.toLowerCase();
  const weather = weatherData.find(
    (w) => w.city.toLowerCase() === cityName
  );
  ```

### Component 3: Response Formatter

- **Purpose**: Format successful response with city and condition only
- **Responsibilities**: 
  - Extract only city and condition fields
  - Return minimal JSON response
  - Preserve original city name capitalization
- **Location**: Inline within route handler
- **Dependencies**: Weather record object
- **Interface**:
  ```javascript
  res.json({
    city: weather.city,
    condition: weather.condition
  });
  ```

### Component 4: Error Handler

- **Purpose**: Return 400 or 404 errors for invalid requests
- **Responsibilities**: 
  - Return 400 if city query parameter is missing
  - Return 404 if city not found
  - Provide helpful error messages
- **Location**: Inline within route handler
- **Dependencies**: Express.js response object
- **Interface**:
  ```javascript
  res.status(400).json({
    error: 'Missing parameter',
    message: 'City name is required as a query parameter'
  });
  ```

## Impacted Modules

### Files to Create

1. **`test/functional/condition.test.js`**
   - **Purpose**: Functional tests for new /api/condition endpoint
   - **Key Functionality**: 
     - Test successful condition retrieval with query parameter
     - Test case-insensitive city matching
     - Test 404 for non-existent city
     - Test 400 for missing city parameter
     - Test JSON response format and Content-Type
     - Test response for all available cities
   - **Risk Level**: Low (new test file, no impact on existing code)

### Files to Modify

1. **`src/server.js`**
   - **Changes**: Add new route handler for GET /api/condition
   - **Scope**: Minor update (~25 lines of code)
   - **Risk Level**: Low (additive change, no modification to existing routes)
   - **Lines Affected**: ~25 new lines (insert after line 68)
   - **Specific Changes**:
     - Add route handler with query parameter extraction
     - Implement city lookup logic
     - Add response formatting and error handling
     - Update startup console output

2. **`test/functional/weather.test.js`**
   - **Changes**: No changes required
   - **Scope**: None
   - **Risk Level**: None (validation only - ensure no regression)
   
3. **`README.md`** (if exists)
   - **Changes**: Document new /api/condition endpoint
   - **Scope**: Minor documentation update
   - **Risk Level**: None (documentation only)

### Files to Delete

None.

## Interfaces

### API Endpoints

#### Endpoint 1: `GET /api/condition`

**Description**: Returns only the weather condition for a specified city using query parameter.

**Query Parameters**:
- `city` (required, string): The name of the city (case-insensitive)

**Request Examples**:
```bash
GET /api/condition?city=Chicago
GET /api/condition?city=new%20york
GET /api/condition?city=Los%20Angeles
```

**Success Response (200)**:
```json
{
  "city": "Chicago",
  "condition": "Rainy"
}
```

**Error Response (400) - Missing Parameter**:
```json
{
  "error": "Missing parameter",
  "message": "City name is required as a query parameter"
}
```

**Error Response (404) - City Not Found**:
```json
{
  "error": "City not found",
  "message": "Weather condition for \"InvalidCity\" is not available"
}
```

**Status Codes**:
- `200` - Success (city found, condition returned)
- `400` - Bad Request (missing city query parameter)
- `404` - Not Found (city does not exist in dataset)
- `500` - Server Error (unexpected error)

**Response Headers**:
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` (via existing CORS middleware)

### Function Interfaces

#### Function 1: Route Handler for /api/condition

```javascript
/**
 * GET endpoint that returns weather condition for a specified city
 * @route GET /api/condition
 * @queryparam {string} city - The name of the city (case-insensitive, required)
 * @returns {Object} JSON response with city name and condition
 * @returns {Object} 400 error if city parameter is missing
 * @returns {Object} 404 error if city not found
 * 
 * @example
 * // Request: GET /api/condition?city=Chicago
 * // Response: { "city": "Chicago", "condition": "Rainy" }
 */
app.get('/api/condition', (req, res) => {
  // Implementation
});
```

### Data Structures

#### Structure 1: Success Response Object

```javascript
{
  city: "string",     // Original city name from CSV
  condition: "string" // Weather condition
}
```

#### Structure 2: Error Response Object

```javascript
{
  error: "string",    // Error type
  message: "string"   // Error description
}
```

## Dependencies

### Internal Dependencies

- **Route handler** depends on:
  - weatherData array (populated by loadWeatherData() on startup)
  - Express.js app instance
  - Express.js request and response objects
  - CORS middleware (for cross-origin access)
  - JSON middleware (for response formatting)

**Dependency Graph**:
```
/api/condition route handler
  -> weatherData array (shared)
  -> Express.js app
  -> CORS middleware (existing)
  -> express.json() middleware (existing)
```

### External Dependencies

None. The implementation uses only existing dependencies:
- **express** (^4.18.2) - Already present
- **cors** (^2.8.5) - Already present
- No new npm packages required

### Data Dependencies

- **Data Source**: `data/weather-data.csv`
  - **Type**: CSV file
  - **Access**: Read via loadWeatherData() on startup
  - **Required Fields**: city, condition
  - **Format**: UTF-8 encoded CSV with headers
  - **Loading**: Synchronous load at startup

- **In-Memory Store**: weatherData array
  - **Type**: JavaScript array of objects
  - **Access**: Direct read access
  - **Lifecycle**: Populated once at startup
  - **Structure**: Objects with city, temperature, humidity, condition, wind_speed, pressure

### Configuration Dependencies

- **ENV Variable**: `PORT`
  - **Purpose**: Server listening port
  - **Default**: `3000`
  - **Impact on Endpoint**: None

No new configuration needed.

## Risk Assessment

### Risk 1: Query Parameter Confusion

- **Category**: Integration
- **Description**: Developers may expect path parameter based on existing patterns
- **Likelihood**: Medium
- **Impact**: Low (results in 400 error with clear message)
- **Mitigation**: 
  - Provide clear error message when city parameter is missing
  - Document query parameter format prominently
  - Include usage examples in README
  - Add JSDoc comments with examples

### Risk 2: Missing Query Parameter Handling

- **Category**: Technical
- **Description**: If req.query.city is undefined, calling toLowerCase() could cause runtime error
- **Likelihood**: High (users will call /api/condition without query param)
- **Impact**: Medium (500 error instead of clean 400)
- **Mitigation**: 
  - Add explicit validation check before processing
  - Return 400 Bad Request with helpful message if missing
  - Test coverage for missing parameter scenario

### Risk 3: Special Characters in City Name

- **Category**: Security/Technical
- **Description**: City names with special characters could cause injection or parsing issues
- **Likelihood**: Medium (city names like "New York" have spaces)
- **Impact**: Medium (potential XSS or unexpected behavior)
- **Mitigation**: 
  - Express.js automatically URL-decodes query parameters
  - Use strict comparison (no eval or dynamic code execution)
  - Return sanitized city name from CSV data, not from user input
  - Test with city names containing spaces and special characters

### Risk 4: Case Sensitivity Edge Cases

- **Category**: Technical
- **Description**: Inconsistent case handling could lead to unexpected 404 errors
- **Likelihood**: Low (existing pattern is proven)
- **Impact**: Low (user receives 404, retries with different case)
- **Mitigation**: 
  - Follow exact pattern from /api/weather/:city
  - Test case-insensitive matching with multiple case variations
  - Document case-insensitive behavior

### Risk 5: Performance Degradation

- **Category**: Performance
- **Description**: O(n) linear search could become bottleneck with larger datasets
- **Likelihood**: Low (current dataset has 10 cities)
- **Impact**: Low (sub-1ms search time for 10 records)
- **Mitigation**: 
  - Acceptable for current scale (meets <100ms requirement with large margin)
  - If dataset grows beyond 1000 cities, consider Map index
  - Monitor P95 response times in production
  - No optimization needed for MVP

### Risk 6: Breaking Change to Existing Endpoints

- **Category**: Technical
- **Description**: Modifying src/server.js could inadvertently break existing routes
- **Likelihood**: Very Low (additive change only)
- **Impact**: High (would break production functionality)
- **Mitigation**: 
  - Only add new route, do not modify existing routes
  - Run full test suite before deployment
  - Place new route in clearly isolated section
  - Code review focusing on no changes to existing lines

### Risk 7: Test Coverage Gap

- **Category**: Maintenance
- **Description**: Insufficient test coverage could allow bugs to reach production
- **Likelihood**: Low (comprehensive test plan defined)
- **Impact**: Medium (bugs in production)
- **Mitigation**: 
  - Create dedicated test file test/functional/condition.test.js
  - Test all scenarios: success, 404, 400, case-insensitive, all cities
  - Verify coverage threshold maintained (50% minimum)
  - Include edge cases

## Testing Strategy

### Unit Tests

**Coverage Target**: 50% (maintain existing threshold)

**Tests Needed**: None required

**Rationale**: The endpoint is a thin routing layer with no complex business logic. Functional tests provide adequate coverage.

### Integration Tests

**Tests Needed**: None required

**Rationale**: Endpoint uses existing in-memory data structure with no external integrations.

### Functional Tests

**Test File**: `test/functional/condition.test.js`

**Tests Needed**:

1. **Test**: Should return condition for valid city with query parameter
   - **Focus**: Verify 200 status, correct JSON structure, matching city and condition

2. **Test**: Should return 400 when city query parameter is missing
   - **Focus**: Verify 400 status, error message clarity

3. **Test**: Should return 404 for non-existent city
   - **Focus**: Verify 404 status, error message includes city name

4. **Test**: Should handle case-insensitive city names
   - **Focus**: Verify same result for lowercase, uppercase, and mixed case

5. **Test**: Should return correct Content-Type header
   - **Focus**: Verify Content-Type: application/json header

6. **Test**: Should return condition for all available cities
   - **Focus**: Iterate through all cities and verify condition endpoint works

7. **Test**: Should handle URL-encoded city names with spaces
   - **Focus**: Verify spaces in city names work correctly

8. **Test**: Should return proper JSON format
   - **Focus**: Verify response has exactly 2 properties: city and condition

9. **Test**: Should preserve original city name capitalization
   - **Focus**: Verify response uses city name from CSV, not query param

### Test Data

- **Fixtures**: Use existing data/weather-data.csv
- **Test Cities**: 
  - Positive: "Chicago", "New York", "Los Angeles"
  - Negative: "InvalidCity", "NonExistent"
  - Case variations: "chicago", "CHICAGO", "ChIcAgO"
  - Special characters: "New York" (space), "Los Angeles" (space)
- **Mocks**: None required
- **Setup**: Use supertest with Express app

### Performance Tests

**Tests Needed**: None required for MVP

**Rationale**: With in-memory data access and 10 cities, response time will be <10ms, meeting <100ms requirement.

### Security Tests

**Tests Needed**:

1. **Test**: Should handle special characters safely
   - **Focus**: Verify city names with special characters are handled properly

**Rationale**: Response returns data from CSV (not user input) and uses strict equality comparison, minimizing injection risk.

## Performance Considerations

1. **In-Memory Data Access**: O(n) lookup. For 10 cities, search completes in <1ms, meeting <100ms requirement with 100x margin.

2. **No File I/O Per Request**: Data loaded once at startup. Each request performs only array search and JSON serialization.

3. **Minimal Response Payload**: Response size ~40-50 bytes vs ~150 bytes for /api/weather/:city (67% reduction).

4. **No Blocking Operations**: All operations are synchronous but fast (<1ms).

5. **Scalability**: Supports 100+ requests/second on modest hardware. If traffic exceeds 1000 req/s, consider Map index for O(1) lookup.

6. **Monitoring**: Track P95 response time in production. If consistently >50ms, investigate.

## Security Considerations

1. **Input Sanitization**: User input used only for comparison, never injected into responses. Response returns city name from CSV data, preventing XSS.

2. **CORS**: Endpoint inherits existing CORS middleware configuration.

3. **No Authentication**: Endpoint is publicly accessible, consistent with existing API design.

4. **Rate Limiting**: Consider adding rate limiting middleware to prevent abuse. Out of scope for this story but recommended for production.

5. **Error Message Disclosure**: Error messages do not reveal internal system details.

6. **Query Parameter Length**: Express.js limits query string length (default 100KB), preventing memory exhaustion attacks.

## Deployment Considerations

1. **Zero Downtime Deployment**: Changes are additive (no modifications to existing routes). Deployment can be performed without downtime.

2. **No Database Migration**: No database changes required. Data source remains weather-data.csv.

3. **No Configuration Changes**: No new environment variables or config files. Uses existing server configuration.

4. **Backward Compatibility**: Existing endpoints unchanged. Clients using other endpoints are unaffected.

5. **Deployment Steps**:
   - Run full test suite locally (npm test)
   - Deploy code to staging environment
   - Smoke test new endpoint: GET /api/condition?city=Chicago
   - Verify existing endpoints still work
   - Deploy to production
   - Update API documentation

6. **Health Check**: Existing /api/health endpoint remains unchanged. No new health checks required.

## Rollback Plan

**If deployment fails**:

1. **Immediate Action**: Revert to previous Git commit and redeploy
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Verification**: 
   - Confirm /api/health returns 200 OK
   - Test existing endpoints
   - Verify server logs show no errors

3. **Root Cause Analysis**:
   - Review server error logs
   - Check test results in CI/CD pipeline
   - Identify failure reason

4. **Fix Forward** (if rollback not possible):
   - Remove only the new route handler from src/server.js
   - Remove startup console log entry for new endpoint
   - Redeploy hotfix

**Rollback Risk**: Very low. Changes are isolated to single new route handler.

## Documentation Updates

Files that need documentation updates:

1. **README.md** - Add new endpoint documentation
   - **Section**: "API Endpoints" or "Available Endpoints"
   - **Content**: Add GET /api/condition with query parameter, examples

2. **CLAUDE.md** - Update project overview
   - **Section**: "API Endpoints"
   - **Content**: Add /api/condition?city={name} to endpoint list
   - **Section**: "Key Patterns"
   - **Content**: Document query parameter pattern

3. **src/server.js** - Update startup console output
   - **Location**: Lines 74-79
   - **Content**: Add log line for new endpoint

4. **API Documentation** (if exists separately)
   - Update OpenAPI/Swagger spec if present
   - Add endpoint to Postman collection if present

---

**Generated**: 2026-05-31T12:40:00.000Z  
**Agent**: Architecture Agent v1.0  
**Based On**: `docs/workflows/WA-47/requirements.md`
