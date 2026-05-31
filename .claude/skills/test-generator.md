---
name: test-generator
description: "Generate and run comprehensive tests - unit, integration, functional tests with high coverage"
---

# Test Generator Skill

## Purpose

Reusable skill for generating comprehensive test suites and executing tests. Ensures high code coverage, proper test structure, and validates functionality works as expected.

## Usage

Invoke this skill whenever you need to:
- Generate unit tests
- Generate integration tests
- Generate functional tests
- Run test suites
- Check code coverage
- Analyze test results

## Operations

### 1. Generate Unit Test

**Usage**: `test-generator unit <function-name> <file-path>`

**Action**: Generates comprehensive unit tests for a function

**Example**:
```bash
test-generator unit validateEmail src/utils/validation.js
```

**Output**:
```javascript
const { validateEmail } = require('../src/utils/validation');

describe('validateEmail', () => {
  describe('Valid emails', () => {
    it('should return true for standard email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('should return true for email with plus sign', () => {
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should return true for email with numbers', () => {
      expect(validateEmail('user123@example123.com')).toBe(true);
    });

    it('should return true for email with dots', () => {
      expect(validateEmail('first.last@example.com')).toBe(true);
    });
  });

  describe('Invalid emails', () => {
    it('should return false for missing @ symbol', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should return false for missing domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should return false for missing username', () => {
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should return false for missing TLD', () => {
      expect(validateEmail('user@example')).toBe(false);
    });

    it('should return false for spaces in email', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should return false for multiple @ symbols', () => {
      expect(validateEmail('user@@example.com')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false for empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should throw TypeError for null input', () => {
      expect(() => validateEmail(null)).toThrow(TypeError);
    });

    it('should throw TypeError for undefined input', () => {
      expect(() => validateEmail(undefined)).toThrow(TypeError);
    });

    it('should throw TypeError for number input', () => {
      expect(() => validateEmail(123)).toThrow(TypeError);
    });

    it('should throw TypeError for object input', () => {
      expect(() => validateEmail({})).toThrow(TypeError);
    });
  });

  describe('Boundary cases', () => {
    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.com';
      const result = validateEmail(longEmail);
      expect(typeof result).toBe('boolean');
    });

    it('should handle single character username', () => {
      expect(validateEmail('a@example.com')).toBe(true);
    });

    it('should handle single character domain', () => {
      expect(validateEmail('user@a.com')).toBe(true);
    });
  });
});
```

### 2. Generate Integration Test

**Usage**: `test-generator integration <component> <description>`

**Action**: Generates integration tests for component interactions

**Example**:
```bash
test-generator integration WeatherAPI "Tests weather API integration"
```

**Output**:
```javascript
const request = require('supertest');
const app = require('../src/server');
const db = require('../src/database');

describe('Weather API Integration Tests', () => {
  // Setup and teardown
  beforeAll(async () => {
    // Connect to test database
    await db.connect(process.env.TEST_DB_URL);
  });

  afterAll(async () => {
    // Cleanup and disconnect
    await db.disconnect();
  });

  beforeEach(async () => {
    // Seed test data before each test
    await db.seed('test-data/weather.json');
  });

  afterEach(async () => {
    // Clean up after each test
    await db.clear();
  });

  describe('GET /api/weather/:city', () => {
    it('should return weather data for existing city', async () => {
      const response = await request(app)
        .get('/api/weather/New%20York')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        city: 'New York',
        temperature: expect.any(String),
        humidity: expect.any(String),
        condition: expect.any(String)
      });
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app)
        .get('/api/weather/NonExistentCity')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('City not found');
    });

    it('should handle city names with spaces', async () => {
      const response = await request(app)
        .get('/api/weather/Los%20Angeles')
        .expect(200);

      expect(response.body.city).toBe('Los Angeles');
    });

    it('should be case-insensitive', async () => {
      const responses = await Promise.all([
        request(app).get('/api/weather/new%20york'),
        request(app).get('/api/weather/NEW%20YORK'),
        request(app).get('/api/weather/New%20York')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.city).toBe('New York');
      });
    });

    it('should return consistent data format', async () => {
      const response = await request(app)
        .get('/api/weather/Chicago')
        .expect(200);

      expect(response.body.temperature).toMatch(/°F$/);
      expect(response.body.humidity).toMatch(/%$/);
      expect(response.body.wind_speed).toMatch(/mph$/);
    });
  });

  describe('POST /api/weather', () => {
    it('should create new weather record', async () => {
      const newWeather = {
        city: 'Boston',
        temperature: 65,
        humidity: 70,
        condition: 'Cloudy'
      };

      const response = await request(app)
        .post('/api/weather')
        .send(newWeather)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toMatchObject({
        city: 'Boston',
        temperature: '65°F',
        humidity: '70%',
        condition: 'Cloudy'
      });

      // Verify it was stored
      const getResponse = await request(app)
        .get('/api/weather/Boston')
        .expect(200);

      expect(getResponse.body.city).toBe('Boston');
    });

    it('should validate required fields', async () => {
      const invalidWeather = {
        city: 'Boston'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/weather')
        .send(invalidWeather)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate cities', async () => {
      const weather = {
        city: 'New York',
        temperature: 70,
        humidity: 65,
        condition: 'Sunny'
      };

      const response = await request(app)
        .post('/api/weather')
        .send(weather)
        .expect(409);

      expect(response.body.error).toMatch(/already exists/i);
    });
  });

  describe('Database integration', () => {
    it('should persist data across requests', async () => {
      // Create
      await request(app)
        .post('/api/weather')
        .send({
          city: 'Seattle',
          temperature: 55,
          humidity: 80,
          condition: 'Rainy'
        })
        .expect(201);

      // Verify persistence
      const response = await request(app)
        .get('/api/weather/Seattle')
        .expect(200);

      expect(response.body.city).toBe('Seattle');
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app).get('/api/weather/New%20York')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.city).toBe('New York');
      });
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors', async () => {
      // Simulate database failure
      await db.disconnect();

      const response = await request(app)
        .get('/api/weather/Chicago')
        .expect(500);

      expect(response.body).toHaveProperty('error');

      // Reconnect
      await db.connect(process.env.TEST_DB_URL);
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/api/weather')
        .send('not-json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### 3. Generate Functional Test

**Usage**: `test-generator functional <feature> <description>`

**Action**: Generates end-to-end functional tests

**Example**:
```bash
test-generator functional "User Authentication" "Tests login and session flow"
```

**Output**:
```javascript
const request = require('supertest');
const app = require('../src/server');

describe('User Authentication - Functional Tests', () => {
  let authToken;

  describe('User Registration Flow', () => {
    it('should complete full registration process', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User'
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body).toHaveProperty('token');
      
      // Step 2: Verify email (mock)
      const verifyResponse = await request(app)
        .get(`/api/auth/verify/${registerResponse.body.verificationCode}`)
        .expect(200);

      expect(verifyResponse.body.message).toMatch(/verified/i);

      // Step 3: Login with verified account
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      authToken = loginResponse.body.token;

      // Step 4: Access protected resource
      const profileResponse = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe('newuser@example.com');
    });
  });

  describe('Login Flow', () => {
    it('should authenticate valid user and provide access', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
      const token = loginResponse.body.token;

      // Access protected resource
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.error).toMatch(/invalid credentials/i);
    });
  });

  describe('Session Management', () => {
    it('should maintain session across multiple requests', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!'
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Multiple requests with same token
      const requests = [
        request(app).get('/api/user/profile'),
        request(app).get('/api/user/settings'),
        request(app).get('/api/user/activity')
      ];

      const responses = await Promise.all(
        requests.map(req => req.set('Authorization', `Bearer ${token}`))
      );

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should invalidate token on logout', async () => {
      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPass123!'
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Try to use token after logout
      await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });
});
```

### 4. Run Tests

**Usage**: `test-generator run <type> [options]`

**Action**: Executes test suite

**Types**: all, unit, integration, functional

**Options**:
- `--coverage` - Generate coverage report
- `--watch` - Watch mode
- `--verbose` - Verbose output

**Example**:
```bash
test-generator run unit --coverage
test-generator run all --verbose
```

**Output**:
```
🧪 Running Unit Tests

Test Suites: 12 passed, 12 total
Tests:       147 passed, 147 total
Snapshots:   0 total
Time:        8.542s

Coverage Summary:
──────────────────────────────────────────────────────
File              | % Stmts | % Branch | % Funcs | % Lines
──────────────────────────────────────────────────────
All files         |   94.23 |    89.47 |   92.31 |   94.12
 src/             |   95.67 |    91.23 |   94.44 |   95.55
  validation.js   |   98.50 |    95.00 |   100.0 |   98.33
  weather.js      |   92.86 |    87.50 |   88.89 |   92.65
 src/utils/       |   91.30 |    85.71 |   87.50 |   91.18
  helpers.js      |   91.30 |    85.71 |   87.50 |   91.18
──────────────────────────────────────────────────────

✅ Coverage threshold met: 94.23% > 90% required

Test Results: ✅ PASSED
```

### 5. Check Coverage

**Usage**: `test-generator coverage [threshold]`

**Action**: Analyzes test coverage and reports gaps

**Example**:
```bash
test-generator coverage 90
```

**Output**:
```
📊 Code Coverage Analysis

Overall Coverage: 87.5%
Target: 90%
Status: ⚠️ Below Threshold (-2.5%)

Coverage by Type:
  Statements: 88.2% ✅
  Branches:   82.1% ⚠️ (target: 85%)
  Functions:  91.3% ✅
  Lines:      87.9% ⚠️

Uncovered Files:
──────────────────────────────────────────────────────
File                    | Coverage | Missing Lines
──────────────────────────────────────────────────────
src/services/payment.js |   64.3%  | 45-52, 78-92, 120
src/utils/cache.js      |   71.2%  | 23-28, 56-61
src/middleware/auth.js  |   79.5%  | 12-15, 34-38
──────────────────────────────────────────────────────

Recommendations:
1. Add tests for src/services/payment.js error paths
2. Test cache expiration in src/utils/cache.js
3. Cover edge cases in src/middleware/auth.js

To improve coverage:
  test-generator unit payment src/services/payment.js
  test-generator unit cache src/utils/cache.js
```

### 6. Generate Test Suite

**Usage**: `test-generator suite <module> <description>`

**Action**: Generates complete test suite for a module

**Example**:
```bash
test-generator suite WeatherService "Complete weather service tests"
```

**Output**: Generates unit, integration, and functional tests

### 7. Generate Mock Data

**Usage**: `test-generator mock <entity> <count>`

**Action**: Generates mock test data

**Example**:
```bash
test-generator mock User 10
```

**Output**:
```javascript
const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    name: 'John Doe',
    createdAt: '2026-01-15T10:00:00Z',
    role: 'user'
  },
  {
    id: 2,
    email: 'user2@example.com',
    name: 'Jane Smith',
    createdAt: '2026-01-16T11:30:00Z',
    role: 'admin'
  },
  // ... 8 more users
];

const mockUser = (overrides = {}) => ({
  id: Math.floor(Math.random() * 1000),
  email: `user${Date.now()}@example.com`,
  name: 'Test User',
  createdAt: new Date().toISOString(),
  role: 'user',
  ...overrides
});

module.exports = { mockUsers, mockUser };
```

### 8. Analyze Test Quality

**Usage**: `test-generator analyze <test-file>`

**Action**: Analyzes test quality and suggests improvements

**Example**:
```bash
test-generator analyze test/weather.test.js
```

**Output**:
```
🔍 Test Quality Analysis

File: test/weather.test.js

✅ Strengths:
  • Good test organization (3 describe blocks)
  • Covers happy path scenarios
  • Uses descriptive test names
  • Includes setup/teardown

⚠️ Areas for Improvement:
  • Missing edge case tests (empty input, null values)
  • No error path coverage
  • Missing boundary condition tests
  • Test assertions could be more specific
  • No performance tests

❌ Issues:
  • Line 23: Test has no assertions
  • Line 45: Test depends on previous test (not isolated)
  • Line 67: Hardcoded test data

Quality Score: 72/100

Recommendations:
1. Add edge case tests for empty/null inputs
2. Test error scenarios (network failures, timeouts)
3. Make tests independent (no shared state)
4. Use more specific assertions
5. Add boundary tests for limits
```

## Test Patterns

### AAA Pattern (Arrange, Act, Assert)

```javascript
it('should calculate total price correctly', () => {
  // Arrange - Setup test data
  const items = [
    { price: 10.00 },
    { price: 20.00 },
    { price: 15.00 }
  ];
  const taxRate = 0.10;

  // Act - Execute the function
  const total = calculateTotal(items, taxRate);

  // Assert - Verify the result
  expect(total).toBe(49.50); // (10 + 20 + 15) * 1.10
});
```

### Test Isolation

```javascript
describe('User Service', () => {
  let service;
  let mockDatabase;

  beforeEach(() => {
    // Fresh setup for each test
    mockDatabase = createMockDatabase();
    service = new UserService(mockDatabase);
  });

  afterEach(() => {
    // Clean up after each test
    mockDatabase.clear();
  });

  it('should create user', async () => {
    // Test is isolated - no dependencies on other tests
    const user = await service.createUser({ email: 'test@example.com' });
    expect(user).toHaveProperty('id');
  });
});
```

### Mocking External Dependencies

```javascript
jest.mock('../src/services/emailService');
jest.mock('../src/database');

describe('User Registration', () => {
  it('should send welcome email after registration', async () => {
    const emailService = require('../src/services/emailService');
    emailService.send.mockResolvedValue(true);

    await registerUser({ email: 'user@example.com' });

    expect(emailService.send).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Welcome!',
      template: 'welcome'
    });
  });
});
```

## Test Coverage Goals

**Minimum Coverage Targets**:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

**Critical Code**: 95%+
- Payment processing
- Authentication
- Data validation
- Security functions

## Usage in Implementation Agent

```javascript
// Generate unit tests for new function
Skill({
  skill: "test-generator",
  args: "unit validateWeatherData src/utils/validation.js"
});

// Generate integration tests
Skill({
  skill: "test-generator",
  args: "integration WeatherAPI 'Tests API integration'"
});

// Run tests with coverage
Skill({
  skill: "test-generator",
  args: "run all --coverage"
});

// Check if coverage meets threshold
const coverage = Skill({
  skill: "test-generator",
  args: "coverage 90"
});

if (!coverage.includes("✅")) {
  // Coverage below threshold - add more tests
}
```

## Benefits

✅ **High Coverage** - Comprehensive test generation  
✅ **Best Practices** - Follows testing patterns  
✅ **Isolation** - Tests are independent  
✅ **Fast Feedback** - Quick test execution  
✅ **Quality Metrics** - Coverage analysis  
✅ **Maintainability** - Well-structured tests  

---

**Skill**: test-generator v1.0  
**Type**: Testing utility  
**Frameworks**: Jest, Supertest (extensible)
