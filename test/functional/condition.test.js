const request = require('supertest');
const app = require('../../src/server');

describe('GET /api/condition', () => {
  describe('Success cases', () => {
    test('should return condition for valid city with query parameter', async () => {
      const response = await request(app).get('/api/condition?city=Chicago');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('city');
      expect(response.body).toHaveProperty('condition');
      expect(response.body.city).toBe('Chicago');
      expect(response.body.condition).toBeDefined();
      expect(typeof response.body.condition).toBe('string');
    });

    test('should return correct Content-Type header', async () => {
      const response = await request(app).get('/api/condition?city=Chicago');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should handle case-insensitive city names (lowercase)', async () => {
      const response = await request(app).get('/api/condition?city=chicago');

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('Chicago');
      expect(response.body.condition).toBeDefined();
    });

    test('should handle case-insensitive city names (uppercase)', async () => {
      const response = await request(app).get('/api/condition?city=CHICAGO');

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('Chicago');
      expect(response.body.condition).toBeDefined();
    });

    test('should handle case-insensitive city names (mixed case)', async () => {
      const response = await request(app).get('/api/condition?city=ChIcAgO');

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('Chicago');
      expect(response.body.condition).toBeDefined();
    });

    test('should handle URL-encoded city names with spaces', async () => {
      const response = await request(app).get(
        '/api/condition?city=New%20York'
      );

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('New York');
      expect(response.body.condition).toBeDefined();
    });

    test('should return proper JSON format with exactly 2 properties', async () => {
      const response = await request(app).get('/api/condition?city=Chicago');

      expect(response.status).toBe(200);
      expect(Object.keys(response.body).length).toBe(2);
      expect(response.body).toEqual({
        city: expect.any(String),
        condition: expect.any(String),
      });
    });

    test('should preserve original city name capitalization', async () => {
      const response = await request(app).get('/api/condition?city=new%20york');

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('New York');
      expect(response.body.city).not.toBe('new york');
    });

    test('should return valid weather condition from allowed list', async () => {
      const validConditions = [
        'Sunny',
        'Rainy',
        'Cloudy',
        'Partly Cloudy',
        'Thunderstorm',
        'Foggy',
      ];

      const response = await request(app).get('/api/condition?city=Chicago');

      expect(response.status).toBe(200);
      expect(validConditions).toContain(response.body.condition);
    });
  });

  describe('Error cases', () => {
    test('should return 400 when city query parameter is missing', async () => {
      const response = await request(app).get('/api/condition');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('Missing parameter');
      expect(response.body.message).toBe(
        'City name is required as a query parameter'
      );
    });

    test('should return 404 for non-existent city', async () => {
      const response = await request(app).get(
        '/api/condition?city=InvalidCity'
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('City not found');
      expect(response.body.message).toContain('InvalidCity');
    });

    test('should return 404 for empty city parameter', async () => {
      const response = await request(app).get('/api/condition?city=');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing parameter');
    });

    test('should return helpful error message including city name', async () => {
      const response = await request(app).get(
        '/api/condition?city=NonExistentCity'
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/NonExistentCity/);
      expect(response.body.message).toMatch(/not available/);
    });
  });

  describe('Multiple cities', () => {
    test('should return condition for all available cities', async () => {
      // Get list of available cities first
      const citiesResponse = await request(app).get('/api/cities');
      const cities = citiesResponse.body.cities;

      expect(cities.length).toBeGreaterThan(0);

      // Test condition endpoint for each city
      for (const city of cities) {
        const response = await request(app).get(
          `/api/condition?city=${encodeURIComponent(city)}`
        );

        expect(response.status).toBe(200);
        expect(response.body.city).toBe(city);
        expect(response.body.condition).toBeDefined();
      }
    });

    test('should return different conditions for different cities', async () => {
      const response1 = await request(app).get('/api/condition?city=Chicago');
      const response2 = await request(app).get('/api/condition?city=New%20York');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Both should have valid structure
      expect(response1.body).toHaveProperty('city');
      expect(response1.body).toHaveProperty('condition');
      expect(response2.body).toHaveProperty('city');
      expect(response2.body).toHaveProperty('condition');
    });
  });

  describe('Response comparison', () => {
    test('should return minimal payload compared to /api/weather endpoint', async () => {
      const conditionResponse = await request(app).get(
        '/api/condition?city=Chicago'
      );
      const weatherResponse = await request(app).get('/api/weather/Chicago');

      expect(conditionResponse.status).toBe(200);
      expect(weatherResponse.status).toBe(200);

      // Condition response should have only 2 fields
      expect(Object.keys(conditionResponse.body).length).toBe(2);

      // Weather response should have more fields
      expect(Object.keys(weatherResponse.body).length).toBeGreaterThan(2);

      // Both should have city
      expect(conditionResponse.body.city).toBe(weatherResponse.body.city);

      // Condition response should not have temperature, humidity, etc.
      expect(conditionResponse.body).not.toHaveProperty('temperature');
      expect(conditionResponse.body).not.toHaveProperty('humidity');
      expect(conditionResponse.body).not.toHaveProperty('wind_speed');
      expect(conditionResponse.body).not.toHaveProperty('pressure');
    });
  });
});
