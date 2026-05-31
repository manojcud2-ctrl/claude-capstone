---
name: code-generator
description: "Generate production code following best practices - clean, maintainable, secure, and well-documented code"
---

# Code Generator Skill

## Purpose

Reusable skill for generating high-quality production code following industry best practices. Ensures code is clean, maintainable, secure, performant, and properly documented.

## Usage

Invoke this skill whenever you need to:
- Generate new code files
- Write functions or classes
- Implement features
- Refactor existing code
- Follow coding standards
- Apply best practices

## Operations

### 1. Generate Function

**Usage**: `code-generator function <name> <description> [language]`

**Action**: Generates a well-structured function with documentation

**Example**:
```bash
code-generator function validateEmail "Validates email format" javascript
```

**Output**:
```javascript
/**
 * Validates email format using RFC 5322 standard
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format, false otherwise
 * @throws {TypeError} If email is not a string
 * 
 * @example
 * validateEmail('user@example.com'); // returns true
 * validateEmail('invalid-email'); // returns false
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    throw new TypeError('Email must be a string');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = { validateEmail };
```

### 2. Generate Class

**Usage**: `code-generator class <name> <description> [language]`

**Action**: Generates a well-structured class with methods

**Example**:
```bash
code-generator class WeatherService "Service for fetching weather data" javascript
```

**Output**:
```javascript
/**
 * Service for fetching and managing weather data
 * 
 * @class WeatherService
 * @example
 * const service = new WeatherService('https://api.weather.com');
 * const weather = await service.getWeather('New York');
 */
class WeatherService {
  /**
   * Creates a new WeatherService instance
   * 
   * @param {string} apiUrl - Base URL for weather API
   * @param {Object} options - Configuration options
   * @param {number} options.timeout - Request timeout in ms (default: 5000)
   */
  constructor(apiUrl, options = {}) {
    this.apiUrl = apiUrl;
    this.timeout = options.timeout || 5000;
    this.cache = new Map();
  }

  /**
   * Fetches weather data for a city
   * 
   * @param {string} city - City name
   * @returns {Promise<Object>} Weather data
   * @throws {Error} If city not found or API request fails
   */
  async getWeather(city) {
    // Check cache first
    if (this.cache.has(city)) {
      return this.cache.get(city);
    }

    try {
      const response = await this._fetchFromAPI(city);
      this.cache.set(city, response);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch weather for ${city}: ${error.message}`);
    }
  }

  /**
   * Internal method to fetch from API
   * @private
   */
  async _fetchFromAPI(city) {
    // Implementation here
  }
}

module.exports = WeatherService;
```

### 3. Generate API Endpoint

**Usage**: `code-generator endpoint <method> <path> <description>`

**Action**: Generates Express.js API endpoint with validation

**Example**:
```bash
code-generator endpoint GET "/api/weather/:city" "Get weather for a city"
```

**Output**:
```javascript
/**
 * Get weather data for a specific city
 * 
 * @route GET /api/weather/:city
 * @param {string} req.params.city - City name
 * @returns {Object} 200 - Weather data
 * @returns {Object} 404 - City not found
 * @returns {Object} 500 - Server error
 */
router.get('/api/weather/:city', async (req, res) => {
  try {
    // Validate input
    const { city } = req.params;
    if (!city || typeof city !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'City name is required'
      });
    }

    // Sanitize input
    const sanitizedCity = city.trim();
    if (sanitizedCity.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'City name cannot be empty'
      });
    }

    // Fetch weather data
    const weather = await weatherService.getWeather(sanitizedCity);
    
    if (!weather) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Weather data for "${sanitizedCity}" not found`
      });
    }

    // Return success response
    res.json({
      city: sanitizedCity,
      ...weather
    });

  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch weather data'
    });
  }
});
```

### 4. Generate CRUD Operations

**Usage**: `code-generator crud <entity> <description>`

**Action**: Generates complete CRUD operations for an entity

**Example**:
```bash
code-generator crud User "User management operations"
```

**Output**: Complete CRUD with Create, Read, Update, Delete functions

### 5. Apply Best Practices

**Usage**: `code-generator refactor <file-path> <practices>`

**Action**: Refactors code to follow best practices

**Practices**:
- `dry` - Don't Repeat Yourself
- `solid` - SOLID principles
- `security` - Security best practices
- `performance` - Performance optimizations
- `readability` - Improve readability
- `error-handling` - Better error handling

**Example**:
```bash
code-generator refactor src/services/weather.js "dry,security,error-handling"
```

### 6. Generate Error Handler

**Usage**: `code-generator error-handler <type>`

**Action**: Generates error handling middleware or utility

**Example**:
```bash
code-generator error-handler middleware
```

**Output**:
```javascript
/**
 * Global error handling middleware
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error('[Error]', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: isDevelopment ? err.message : 'Internal Server Error',
      ...(isDevelopment && { stack: err.stack }),
      statusCode
    }
  });
}

module.exports = errorHandler;
```

### 7. Generate Validation Schema

**Usage**: `code-generator validator <entity> <fields>`

**Action**: Generates input validation schema

**Example**:
```bash
code-generator validator User "email,password,name"
```

**Output**:
```javascript
/**
 * User validation schema
 */
const userSchema = {
  email: {
    required: true,
    type: 'string',
    format: 'email',
    maxLength: 255,
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    errorMessage: 'Valid email address is required'
  },
  
  password: {
    required: true,
    type: 'string',
    minLength: 8,
    maxLength: 128,
    validate: (value) => {
      // At least one uppercase, one lowercase, one digit, one special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      return passwordRegex.test(value);
    },
    errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character'
  },
  
  name: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100,
    validate: (value) => {
      // Only letters, spaces, hyphens
      const nameRegex = /^[a-zA-Z\s-]+$/;
      return nameRegex.test(value);
    },
    errorMessage: 'Name must contain only letters, spaces, and hyphens'
  }
};

/**
 * Validates user data against schema
 * 
 * @param {Object} data - User data to validate
 * @returns {Object} Validation result
 */
function validateUser(data) {
  const errors = {};
  
  for (const [field, rules] of Object.entries(userSchema)) {
    const value = data[field];
    
    // Check required
    if (rules.required && !value) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    // Check type
    if (value && typeof value !== rules.type) {
      errors[field] = `${field} must be a ${rules.type}`;
      continue;
    }
    
    // Check length
    if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        continue;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
        continue;
      }
    }
    
    // Custom validation
    if (value && rules.validate && !rules.validate(value)) {
      errors[field] = rules.errorMessage || `${field} is invalid`;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = { userSchema, validateUser };
```

### 8. Security Scan

**Usage**: `code-generator security-scan <file-path>`

**Action**: Scans code for common security vulnerabilities

**Checks**:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Command injection
- Path traversal
- Hardcoded secrets
- Insecure dependencies
- Missing input validation
- Weak encryption

**Example**:
```bash
code-generator security-scan src/api/users.js
```

**Output**:
```
🔒 Security Scan Results

File: src/api/users.js

❌ Critical Issues (2):
  Line 45: SQL injection vulnerability
    Issue: Direct string concatenation in SQL query
    Risk: Attacker can execute arbitrary SQL
    Fix: Use parameterized queries or ORM
    
  Line 78: XSS vulnerability
    Issue: Unescaped user input in HTML response
    Risk: Cross-site scripting attack
    Fix: Sanitize user input before rendering

⚠️ Warnings (3):
  Line 23: Missing input validation
    Issue: User input not validated
    Fix: Add validation before processing
    
  Line 56: Weak password hashing
    Issue: Using MD5 for password hashing
    Fix: Use bcrypt or argon2
    
  Line 92: Hardcoded API key
    Issue: API key in source code
    Fix: Use environment variables

✅ Good Practices (5):
  Line 12: Parameterized database query
  Line 34: Input sanitization
  Line 67: HTTPS enforced
  Line 89: Rate limiting applied
  Line 101: JWT token validation

Security Score: 62/100 (Medium Risk)

Recommendation: Fix critical issues before deployment
```

## Best Practices

### Code Quality Principles

**1. SOLID Principles**
- **S**ingle Responsibility - One purpose per function/class
- **O**pen/Closed - Open for extension, closed for modification
- **L**iskov Substitution - Subtypes must be substitutable
- **I**nterface Segregation - Many specific interfaces over one general
- **D**ependency Inversion - Depend on abstractions, not concretions

**2. DRY (Don't Repeat Yourself)**
- Extract common logic into reusable functions
- Use inheritance and composition
- Create utility libraries

**3. KISS (Keep It Simple, Stupid)**
- Simple solutions over complex ones
- Clear code over clever code
- Avoid premature optimization

**4. YAGNI (You Aren't Gonna Need It)**
- Don't add functionality until needed
- No speculative features
- Focus on current requirements

### Code Structure

**Good**:
```javascript
// Clear function names
function calculateTotalPrice(items, taxRate) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * taxRate;
  return subtotal + tax;
}

// Single responsibility
function validateEmail(email) { /* ... */ }
function sendEmail(to, subject, body) { /* ... */ }
```

**Bad**:
```javascript
// Unclear names
function doStuff(x, y) { /* ... */ }

// Multiple responsibilities
function validateAndSendEmail(email, subject, body) { /* ... */ }
```

### Error Handling

**Good**:
```javascript
async function fetchUserData(userId) {
  try {
    const user = await db.users.findById(userId);
    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-throw known errors
    }
    // Log and wrap unexpected errors
    console.error('Database error:', error);
    throw new DatabaseError('Failed to fetch user data');
  }
}
```

**Bad**:
```javascript
async function fetchUserData(userId) {
  try {
    return await db.users.findById(userId);
  } catch (error) {
    return null; // Silent failure - bad!
  }
}
```

### Security Best Practices

**1. Input Validation**
```javascript
// Always validate and sanitize user input
function createUser(userData) {
  // Validate
  const { valid, errors } = validateUser(userData);
  if (!valid) {
    throw new ValidationError(errors);
  }
  
  // Sanitize
  const sanitized = {
    email: userData.email.trim().toLowerCase(),
    name: userData.name.trim(),
    // Never store plain password
    password: await bcrypt.hash(userData.password, 10)
  };
  
  return db.users.create(sanitized);
}
```

**2. Prevent SQL Injection**
```javascript
// Bad - SQL injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// Good - Parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);
```

**3. Prevent XSS**
```javascript
// Bad - XSS vulnerable
res.send(`<h1>Hello ${req.query.name}</h1>`);

// Good - Escaped output
const escape = require('escape-html');
res.send(`<h1>Hello ${escape(req.query.name)}</h1>`);
```

### Performance Best Practices

**1. Avoid N+1 Queries**
```javascript
// Bad - N+1 queries
const users = await db.users.findAll();
for (const user of users) {
  user.posts = await db.posts.findByUserId(user.id);
}

// Good - Single query with join
const users = await db.users.findAll({
  include: [{ model: db.posts }]
});
```

**2. Use Caching**
```javascript
const cache = new Map();

async function getWeather(city) {
  // Check cache first
  if (cache.has(city)) {
    return cache.get(city);
  }
  
  // Fetch and cache
  const weather = await fetchWeatherFromAPI(city);
  cache.set(city, weather);
  
  // Expire after 5 minutes
  setTimeout(() => cache.delete(city), 5 * 60 * 1000);
  
  return weather;
}
```

**3. Async/Await for Parallel Operations**
```javascript
// Bad - Sequential
const user = await fetchUser(userId);
const posts = await fetchPosts(userId);
const comments = await fetchComments(userId);

// Good - Parallel
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId)
]);
```

## Code Templates

### API Controller Template
```javascript
class UserController {
  /**
   * Get all users
   */
  async index(req, res, next) {
    try {
      const users = await this.userService.findAll();
      res.json({ data: users });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single user
   */
  async show(req, res, next) {
    try {
      const user = await this.userService.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create user
   */
  async create(req, res, next) {
    try {
      const user = await this.userService.create(req.body);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   */
  async update(req, res, next) {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   */
  async destroy(req, res, next) {
    try {
      await this.userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```

## Usage in Implementation Agent

```javascript
// Generate production code
Skill({
  skill: "code-generator",
  args: "function validateWeatherData 'Validates weather data format' javascript"
});

// Generate API endpoint
Skill({
  skill: "code-generator",
  args: "endpoint POST /api/weather 'Create weather record'"
});

// Refactor for best practices
Skill({
  skill: "code-generator",
  args: "refactor src/weather.js 'dry,security,performance'"
});

// Security scan
Skill({
  skill: "code-generator",
  args: "security-scan src/api/weather.js"
});
```

## Benefits

✅ **Consistent Code** - Follows standards  
✅ **Best Practices** - Built-in quality  
✅ **Security** - Vulnerability prevention  
✅ **Performance** - Optimized patterns  
✅ **Maintainability** - Clean, readable code  
✅ **Documentation** - Well-documented output  

---

**Skill**: code-generator v1.0  
**Type**: Code generation utility  
**Languages**: JavaScript, TypeScript (extensible)
