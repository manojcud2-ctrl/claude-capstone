# Weather API Validation Rules

## Rule Type: Data Validation
**Applies To**: CSV data loading and API responses
**Enforcement**: Pre-commit hook + Runtime validation

---

## Rule 1: City Name Uniqueness

**Requirement**: All city names in `data/weather-data.csv` must be unique.

**Validation**:
```javascript
const cityNames = weatherData.map(row => row.city.toLowerCase());
const uniqueCities = new Set(cityNames);
if (cityNames.length !== uniqueCities.size) {
  throw new Error('RULE VIOLATION: Duplicate city names found in weather-data.csv');
}
```

**Enforcement Point**: 
- `src/server.js` line ~20 (loadWeatherData function)
- Unit test: `test/unit/data.test.js`

**Severity**: 🔴 CRITICAL - Server won't start

---

## Rule 2: Required CSV Columns

**Requirement**: CSV must contain exactly these columns:
- city
- temperature
- humidity
- condition
- wind_speed
- pressure

**Validation**:
```javascript
const requiredColumns = ['city', 'temperature', 'humidity', 'condition', 'wind_speed', 'pressure'];
const missingColumns = requiredColumns.filter(col => !headers.includes(col));
if (missingColumns.length > 0) {
  throw new Error(`RULE VIOLATION: Missing required columns: ${missingColumns.join(', ')}`);
}
```

**Enforcement Point**: 
- `src/server.js` loadWeatherData function
- Unit test: `test/unit/data.test.js`

**Severity**: 🔴 CRITICAL - Data loading fails

---

## Rule 3: Valid Weather Conditions

**Requirement**: Condition field must be one of:
- Sunny
- Rainy
- Cloudy
- Partly Cloudy
- Thunderstorm
- Foggy

**Validation**:
```javascript
const validConditions = ['Sunny', 'Rainy', 'Cloudy', 'Partly Cloudy', 'Thunderstorm', 'Foggy'];
weatherData.forEach(row => {
  if (!validConditions.includes(row.condition)) {
    throw new Error(`RULE VIOLATION: Invalid condition "${row.condition}" for city ${row.city}`);
  }
});
```

**Enforcement Point**: 
- Unit test: `test/unit/data.test.js`
- Runtime: Data loading validation

**Severity**: 🟡 WARNING - Invalid data

---

## Rule 4: Humidity Range

**Requirement**: Humidity must be between 0 and 100 (inclusive).

**Validation**:
```javascript
weatherData.forEach(row => {
  const humidity = parseFloat(row.humidity);
  if (humidity < 0 || humidity > 100) {
    throw new Error(`RULE VIOLATION: Humidity ${humidity}% out of range for city ${row.city}`);
  }
});
```

**Enforcement Point**: 
- Unit test: `test/unit/data.test.js`

**Severity**: 🟡 WARNING - Data quality issue

---

## Rule 5: API Response Format

**Requirement**: All API responses must include units in formatted strings.

**Validation**:
```javascript
// Temperature must include °F
// Humidity must include %
// Wind speed must include mph
// Pressure must include mb
```

**Example Valid Response**:
```json
{
  "city": "Austin",
  "temperature": "72°F",
  "humidity": "65%",
  "condition": "Sunny",
  "wind_speed": "10 mph",
  "pressure": "1013 mb"
}
```

**Enforcement Point**: 
- Functional test: `test/functional/weather.test.js`

**Severity**: 🟢 MEDIUM - API contract compliance

---

## Rule 6: Case-Insensitive City Search

**Requirement**: `/api/weather/:city` must accept city names in any case.

**Validation**:
```javascript
// "austin", "AUSTIN", "Austin" should all work
const cityLower = req.params.city.toLowerCase();
const cityData = weatherData.find(row => row.city.toLowerCase() === cityLower);
```

**Enforcement Point**: 
- `src/server.js` /api/weather/:city endpoint
- Functional test: `test/functional/weather.test.js`

**Severity**: 🟢 MEDIUM - User experience

---

## Rule 7: Error Response Format

**Requirement**: 404 responses must return JSON with error message.

**Validation**:
```javascript
res.status(404).json({
  error: 'City not found',
  city: req.params.city
});
```

**Enforcement Point**: 
- All API endpoints
- Functional tests

**Severity**: 🟢 LOW - API consistency

---

## Rule Enforcement Summary

| Rule | Enforcement | Severity | Auto-Fix |
|------|-------------|----------|----------|
| City Uniqueness | Runtime + Test | CRITICAL | No |
| Required Columns | Runtime + Test | CRITICAL | No |
| Valid Conditions | Test | WARNING | No |
| Humidity Range | Test | WARNING | No |
| Response Format | Test | MEDIUM | No |
| Case-Insensitive | Runtime + Test | MEDIUM | Yes |
| Error Format | Test | LOW | Yes |

---

## Adding New Rules

To add a new rule:

1. Document it in this file
2. Add validation logic to appropriate location
3. Create unit/functional test
4. Update enforcement table
5. Set severity level

---

## Version History

- **v1.0** (2026-06-01): Initial weather API validation rules
