# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js/Express weather API backend that serves weather data from a CSV file. The API provides three endpoints: health check, city list, and weather data by city name. It uses `csv-parse` for data loading and has comprehensive unit and functional tests.

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

## Key Patterns

- **Data Loading**: Weather data loads once at startup, not per-request
- **Case Handling**: City searches are case-insensitive (converted to lowercase for comparison)
- **Response Format**: Weather values include units in the response (e.g., "72°F", "65%")
- **Module Export**: Server exports the Express app for testing but only calls `listen()` when run directly (`require.main === module`)

## Adding New Cities

Edit `data/weather-data.csv` and restart the server. The CSV parser expects headers and will skip empty lines. Ensure city names are unique.
