# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express weather API backend that serves weather data from a CSV file. The API provides four endpoints: health check, city list, full weather data by city name, and weather condition by city name. It uses `csv-parse` for data loading and has comprehensive unit and functional tests.

## Development Commands

### Running the Application
```bash
npm start        # Start the server on port 3000
npm run dev      # Alias for start
```

### Testing
```bash
npm test                # Run all tests with coverage
npm run test:unit       # Run unit tests only (CSV data loading/validation)
npm run test:functional # Run functional tests only (API endpoints)
npm run test:watch      # Run tests in watch mode
```

Coverage thresholds are set at 50% for branches, functions, lines, and statements.

### Running a Single Test
```bash
npx jest test/unit/data.test.js           # Run specific test file
npx jest -t "should return health status" # Run test by name pattern
```

## Architecture

### Core Components

**Server (`src/server.js`)**
- Single-file Express application
- Loads CSV data synchronously on startup via `loadWeatherData()`
- Stores parsed weather records in-memory in `weatherData` array
- Exports the Express app for testing (doesn't listen when required as module)

**Data Source (`data/weather-data.csv`)**
- CSV file with columns: city, temperature, humidity, condition, wind_speed, pressure
- Must contain unique city names
- Valid conditions: Sunny, Rainy, Cloudy, Partly Cloudy, Thunderstorm, Foggy

### API Endpoints

- `GET /api/health` - Returns server status
- `GET /api/cities` - Returns array of all available city names
- `GET /api/weather/:city` - Returns formatted weather data for a city (case-insensitive)
  - Returns 404 if city not found
  - Formats response with units (°F, %, mph, mb)
- `GET /api/condition?city={name}` - Returns only weather condition for a city (case-sensitive)
  - Returns 400 if city query parameter is missing
  - Returns 404 if city not found or case doesn't match exactly
  - Minimal response payload (city and condition only)

### Test Structure

**Unit Tests (`test/unit/data.test.js`)**
- Tests CSV file loading and parsing
- Validates required columns and data types
- Checks data constraints (humidity 0-100, pressure >900, valid conditions)
- Ensures city name uniqueness

**Functional Tests (`test/functional/weather.test.js`)**
- Tests all API endpoints using `supertest`
- Validates response format and status codes
- Tests case-insensitive city search
- Verifies error handling for non-existent cities

**Functional Tests (`test/functional/condition.test.js`)**
- Tests /api/condition endpoint with query parameters
- Validates minimal response payload (city + condition only)
- Tests case-sensitive matching and URL encoding
- Verifies error handling for missing and invalid parameters

## Key Patterns

- **Data Loading**: Weather data loads once at startup, not per-request
- **Case Handling**: City searches are case-insensitive (converted to lowercase for comparison)
- **Response Format**: Weather values include units in the response (e.g., "72°F", "65%")
- **Query Parameters**: /api/condition uses query parameter pattern (?city={name}) vs path parameter pattern used by other endpoints
- **Case Sensitivity**: /api/condition requires exact case match, while /api/weather/:city is case-insensitive
- **Minimal Responses**: /api/condition returns only city and condition (67% payload reduction vs full weather data)
- **Module Export**: Server exports the Express app for testing but only calls `listen()` when run directly (`require.main === module`)

## Adding New Cities

Edit `data/weather-data.csv` and restart the server. The CSV parser expects headers and will skip empty lines. Ensure city names are unique.
