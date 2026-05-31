const request = require('supertest');
const app = require('../../src/server');

describe('Weather API - Functional Tests', () => {
  describe('GET /api/health', () => {
    it('should return health status with 200', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
    });

    it('should return valid JSON response', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: 'OK',
        })
      );
    });
  });

  describe('GET /api/cities', () => {
    it('should return list of cities with 200', async () => {
      const response = await request(app).get('/api/cities');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it('should return non-empty cities array', async () => {
      const response = await request(app).get('/api/cities');

      expect(response.body.cities.length).toBeGreaterThan(0);
    });

    it('should return specific cities including New York', async () => {
      const response = await request(app).get('/api/cities');

      expect(response.body.cities).toContain('New York');
      expect(response.body.cities).toContain('Los Angeles');
      expect(response.body.cities).toContain('Chicago');
    });
  });

  describe('GET /api/weather/:city', () => {
    it('should return weather data for valid city', async () => {
      const response = await request(app).get('/api/weather/New%20York');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('city', 'New York');
      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('condition');
      expect(response.body).toHaveProperty('wind_speed');
      expect(response.body).toHaveProperty('pressure');
    });

    it('should return properly formatted weather data', async () => {
      const response = await request(app).get('/api/weather/Los%20Angeles');

      expect(response.status).toBe(200);
      expect(response.body.temperature).toMatch(/°F$/);
      expect(response.body.humidity).toMatch(/%$/);
      expect(response.body.wind_speed).toMatch(/mph$/);
      expect(response.body.pressure).toMatch(/mb$/);
    });

    it('should return 404 for non-existent city', async () => {
      const response = await request(app).get('/api/weather/NonExistentCity');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'City not found');
      expect(response.body).toHaveProperty('message');
    });

    it('should handle case-insensitive city search', async () => {
      const response1 = await request(app).get('/api/weather/new%20york');
      const response2 = await request(app).get('/api/weather/NEW%20YORK');
      const response3 = await request(app).get('/api/weather/New%20York');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response3.status).toBe(200);
      expect(response1.body.city).toBe(response2.body.city);
      expect(response2.body.city).toBe(response3.body.city);
    });

    it('should return correct weather data for Chicago', async () => {
      const response = await request(app).get('/api/weather/Chicago');

      expect(response.status).toBe(200);
      expect(response.body.city).toBe('Chicago');
      expect(response.body.condition).toBe('Rainy');
    });

    it('should return weather for all available cities', async () => {
      const citiesResponse = await request(app).get('/api/cities');
      const cities = citiesResponse.body.cities;

      for (const city of cities) {
        const encodedCity = encodeURIComponent(city);
        const response = await request(app).get(`/api/weather/${encodedCity}`);

        expect(response.status).toBe(200);
        expect(response.body.city).toBe(city);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing endpoint with 404', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should reject POST requests to weather endpoint', async () => {
      const response = await request(app)
        .post('/api/weather/New%20York')
        .send({});

      expect([404, 405]).toContain(response.status);
    });
  });
});
