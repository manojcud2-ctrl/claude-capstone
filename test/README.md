# Test Documentation

This directory contains comprehensive unit and functional tests for the Weather Backend API.

## Test Structure

```
test/
├── unit/
│   └── data.test.js           # Unit tests for CSV data validation
└── functional/
    └── weather.test.js        # Integration tests for API endpoints
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Functional Tests Only
```bash
npm run test:functional
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Coverage

The test suite includes:

### Unit Tests (`test/unit/data.test.js`)
- CSV file loading validation
- Data structure verification
- Column validation
- Data type validation (numeric values, ranges)
- Condition validation
- Data uniqueness checks
- Minimum data requirements

### Functional Tests (`test/functional/weather.test.js`)
- Health check endpoint (`GET /api/health`)
- Cities list endpoint (`GET /api/cities`)
- Weather data endpoint (`GET /api/weather/:city`)
- Case-insensitive city search
- Error handling (404 responses)
- HTTP method validation
- Response format validation

## Test Cases Summary

### Health Check (1 test)
- ✅ Returns 200 status with OK message

### Cities List (3 tests)
- ✅ Returns non-empty cities array
- ✅ Contains expected major cities
- ✅ Returns proper JSON format

### Weather Endpoint (6 tests)
- ✅ Returns weather data for valid cities
- ✅ Properly formats data with units
- ✅ Returns 404 for non-existent cities
- ✅ Handles case-insensitive search
- ✅ Returns data for all available cities
- ✅ Validates response structure

### Data Validation (10 tests)
- ✅ CSV file loads successfully
- ✅ All required columns present
- ✅ Temperature values are numeric
- ✅ Humidity within valid range (0-100%)
- ✅ Wind speed is numeric and non-negative
- ✅ Pressure values are realistic
- ✅ Condition strings are valid
- ✅ City names are unique
- ✅ Minimum 5 cities in dataset
- ✅ Contains major cities (New York, LA)

### Error Handling (2 tests)
- ✅ Handles undefined endpoints
- ✅ Rejects invalid HTTP methods

## Coverage Report

After running tests with coverage:
```bash
npm test
```

Coverage report will show:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

## Example Test Output

```
PASS test/functional/weather.test.js
PASS test/unit/data.test.js

Test Suites: 2 passed, 2 total
Tests:       25 passed, 25 total
Snapshots:   0 total
Time:        2.345s
```

## Writing Additional Tests

To add more tests:

1. **For API endpoints**: Add tests to `test/functional/weather.test.js`
2. **For data validation**: Add tests to `test/unit/data.test.js`

Example test structure:
```javascript
describe('Feature Name', () => {
  it('should do something specific', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Debugging Tests

Run a single test file:
```bash
npx jest test/unit/data.test.js
```

Run tests matching a pattern:
```bash
npx jest --testNamePattern="health"
```

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:
```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test
```

## Common Issues

### Port in use errors
- Functional tests use supertest which doesn't bind to actual ports
- No conflicts with running server

### CSV file not found
- Ensure `data/weather-data.csv` exists in project root
- Check file permissions

### Module not found
- Run `npm install` to install all dependencies
- Check node_modules exists
