# Requirements Specification - WA-47

## Story Overview

- **ID**: WA-47
- **Title**: Get city condition data by city name
- **Type**: Story
- **Priority**: Medium
- **Status**: To Do
- **Project**: Weather App (WA)
- **Created**: 2026-05-31

## Story Description

AS a user I want to fetch the "condition" data of a city.

City name can be query param.

**Context**: This story is part of the Weather App API that currently serves comprehensive weather data for cities. The request is to provide a focused endpoint that returns only the weather condition (e.g., Sunny, Rainy, Cloudy) for a specified city, rather than the full weather dataset.

## Business Requirements

### Business Objectives

1. **Enable lightweight weather condition queries** - Provide clients with a simple, fast endpoint to check only the weather condition without retrieving full weather data
2. **Reduce data transfer** - Minimize bandwidth usage for use cases where only condition information is needed
3. **Improve API flexibility** - Allow clients to choose between comprehensive weather data (`/api/weather/:city`) and condition-only data
4. **Support targeted integrations** - Enable third-party systems that only need condition data for decision-making

### Business Value

- **Reduced bandwidth costs** - Smaller response payloads for condition-only queries (estimated 80% reduction vs. full weather endpoint)
- **Improved client experience** - Faster response times for simple condition checks
- **Increased API adoption** - More flexible API surface attracts wider range of integrations
- **Better resource utilization** - Less processing overhead for simple queries

### Success Metrics

- Response time < 100ms for condition endpoint (p95)
- Response payload size < 100 bytes
- API availability maintained at 99.9%
- Zero regression to existing `/api/weather/:city` endpoint performance

## Functional Requirements

### FR-1: Add Condition Endpoint

**Description**: Create a new REST API endpoint that returns only the weather condition for a specified city name passed as a path parameter or query parameter.

**Priority**: Must Have

**Dependencies**: 
- Existing weather data CSV (`data/weather-data.csv`)
- Existing data loading mechanism (`loadWeatherData()`)
- Existing Express server infrastructure

**Specification**:
- Endpoint path: `/api/condition/:city` OR `/api/condition?city={cityName}`
- HTTP method: GET
- Response format: JSON
- Case-insensitive city name matching (consistent with existing `/api/weather/:city` behavior)

### FR-2: Return Condition Data

**Description**: The endpoint must return a JSON response containing the city name and its weather condition.

**Priority**: Must Have

**Response Format**:
```json
{
  "city": "New York",
  "condition": "Cloudy"
}
```

**Valid Conditions** (from existing data constraints):
- Sunny
- Rainy
- Cloudy
- Partly Cloudy
- Thunderstorm
- Foggy


## Non-Functional Requirements

### NFR-1: Performance

- **Response Time**: Endpoint must respond in < 100ms (p95) under normal load
- **Throughput**: Support at least 100 requests/second without performance degradation
- **Data Access**: Use existing in-memory data structure for fast lookups

### NFR-2: Reliability

- **Availability**: Maintain 99.9% uptime consistent with existing API
- **Error Handling**: Gracefully handle missing cities, invalid input, and data loading failures
- **No Impact**: Must not affect the performance or availability of existing endpoints

### NFR-3: Maintainability

- **Code Quality**: Follow existing code patterns and conventions in `src/server.js`
- **Documentation**: Add endpoint documentation to server startup console output
- **Testing**: Include both unit and functional tests following existing test structure

### NFR-4: Security

- **Input Validation**: Sanitize city name input to prevent injection attacks
- **CORS**: Use existing CORS middleware configuration
- **Rate Limiting**: Leverage any existing rate limiting (if applicable)

### NFR-5: Compatibility

- **No Breaking Changes**: Existing endpoints must continue to function identically
- **Data Format**: Use existing CSV data structure without modifications
- **Dependencies**: No new external dependencies required

## Assumptions

1. **Data Source Unchanged**: The endpoint will use the existing `data/weather-data.csv` file and `weatherData` array without modifications
2. **Same Data Loading**: The endpoint will leverage the existing `loadWeatherData()` function and in-memory data structure
3. **Path Parameter Preference**: Despite story mention of "query param", path parameter (`:city`) is preferred for consistency with `/api/weather/:city`
4. **No Authentication**: The endpoint will be publicly accessible like existing endpoints (no authentication required)
5. **Single Condition Per City**: Each city has exactly one current weather condition (no historical data or forecasts)
6. **CSV Structure Stable**: The CSV file structure (city, temperature, humidity, condition, wind_speed, pressure) remains unchanged

## Open Questions

1. **Query vs Path Parameter**: Should the city name be provided as `/api/condition/:city` (path parameter, consistent with existing) or `/api/condition?city={name}` (query parameter, as story mentions)?
   - **Recommendation**: Use path parameter or query parameter based on stakeholder preference
   
2. **Response Format**: Should the response include any metadata (timestamp, source, etc.) or just city and condition?
   - **Recommendation**: Keep minimal (city + condition only) per business requirement for lightweight queries

## Acceptance Criteria

### AC-1: Successful Condition Retrieval with Path Parameter

```gherkin
Given the weather API is running
And the city "New York" exists in the weather data with condition "Cloudy"
When I send a GET request to "/api/condition/New York"
Then the response status code should be 200
And the response body should contain:
  {
    "city": "New York",
    "condition": "Cloudy"
  }
```

### AC-2: Endpoint Returns JSON Response

```gherkin
Given the weather API is running
And the city "Los Angeles" exists in the weather data with condition "Sunny"
When I send a GET request to "/api/condition/Los Angeles"
Then the response status code should be 200
And the response Content-Type should be "application/json"
And the response body should match the format:
  {
    "city": "Los Angeles",
    "condition": "Sunny"
  }
```

## Out of Scope

- **Historical Conditions**: This endpoint will not provide historical or forecast condition data, only current conditions
- **Multiple Cities**: Batch querying of multiple cities in a single request is not included
- **Condition Filtering**: Filtering cities by condition (e.g., "show all cities with Sunny weather") is not included
- **Query Parameter Support**: If path parameter is chosen, query parameter support is out of scope (and vice versa)
- **Authentication/Authorization**: No authentication layer will be added as part of this story
- **Rate Limiting**: Implementation of rate limiting (if not already present) is out of scope
- **Caching**: Response caching or cache-control headers are out of scope
- **Data Modifications**: No changes to the CSV file structure, data loading mechanism, or data storage approach

## Related Work

- **Depends On**: None (standalone feature)
- **Blocks**: None
- **Related To**: 
  - Existing endpoint `/api/weather/:city` (serves as design reference)
  - Existing endpoint `/api/cities` (uses same data source)

## Technical Context

### Existing System Architecture

The current Weather App API:
- Uses Express.js framework
- Loads weather data from CSV file synchronously on startup
- Stores data in-memory in `weatherData` array
- Provides three endpoints: `/api/health`, `/api/cities`, `/api/weather/:city`
- Uses CORS middleware for cross-origin requests
- Exports app for testing without starting server when required as module

### Data Structure

Weather data array contains objects with structure:
```javascript
{
  city: "New York",
  temperature: "72",
  humidity: "65",
  condition: "Cloudy",
  wind_speed: "12",
  pressure: "1013"
}
```

The new endpoint needs to extract only the `city` and `condition` fields.

### Implementation Location

The implementation should be added to `src/server.js` following the existing pattern of route handlers.

---

**Generated**: 2026-05-31T12:35:00.000Z  
**Agent**: Requirements Agent v1.0
