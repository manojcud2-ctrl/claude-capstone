const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { parse } = require('csv-parse/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load weather data from CSV
let weatherData = [];

function loadWeatherData() {
  try {
    const csvFilePath = path.join(__dirname, '../data/weather-data.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    weatherData = records;
    console.log('Weather data loaded successfully');
  } catch (error) {
    console.error('Error loading weather data:', error.message);
  }
}

// Load data on startup
loadWeatherData();

// API endpoint to get weather by city
app.get('/api/weather/:city', (req, res) => {
  const cityName = req.params.city.toLowerCase();
  const weather = weatherData.find(
    (w) => w.city.toLowerCase() === cityName
  );

  if (!weather) {
    return res.status(404).json({
      error: 'City not found',
      message: `Weather data for "${req.params.city}" is not available`,
    });
  }

  res.json({
    city: weather.city,
    temperature: `${weather.temperature}°F`,
    humidity: `${weather.humidity}%`,
    condition: weather.condition,
    wind_speed: `${weather.wind_speed} mph`,
    pressure: `${weather.pressure} mb`,
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Weather API is running' });
});

// Get all available cities
app.get('/api/cities', (req, res) => {
  const cities = weatherData.map((w) => w.city);
  res.json({ cities });
});

// Get weather condition by city (query parameter)
app.get('/api/condition', (req, res) => {
  // Extract city from query parameter
  const cityParam = req.query.city;

  // Validate city parameter is provided
  if (!cityParam) {
    return res.status(400).json({
      error: 'Missing parameter',
      message: 'City name is required as a query parameter',
    });
  }

  // Perform case-insensitive city lookup
  const cityName = cityParam.toLowerCase();
  const weather = weatherData.find(
    (w) => w.city.toLowerCase() === cityName
  );

  // Handle city not found
  if (!weather) {
    return res.status(404).json({
      error: 'City not found',
      message: `Weather condition for "${cityParam}" is not available`,
    });
  }

  // Return minimal response with city and condition only
  res.json({
    city: weather.city,
    condition: weather.condition,
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Weather API server running at http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET /api/health - Health check`);
    console.log(`  GET /api/cities - List all available cities`);
    console.log(`  GET /api/weather/:city - Get weather for a specific city`);
    console.log(`  GET /api/condition?city={name} - Get weather condition only`);
    console.log(`\nExample: http://localhost:${PORT}/api/weather/New%20York`);
    console.log(`Example: http://localhost:${PORT}/api/condition?city=Chicago`);
  });
}

module.exports = app;
