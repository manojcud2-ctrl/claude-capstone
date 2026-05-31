const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

describe('Unit Tests - CSV Data Loading', () => {
  describe('CSV File Loading', () => {
    it('should load weather-data.csv file successfully', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

      expect(fileContent).toBeDefined();
      expect(fileContent.length).toBeGreaterThan(0);
    });

    it('should parse CSV file with correct headers', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      expect(records.length).toBeGreaterThan(0);
    });

    it('should have all required columns in CSV', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const requiredColumns = [
        'city',
        'temperature',
        'humidity',
        'condition',
        'wind_speed',
        'pressure',
      ];

      const firstRecord = records[0];
      requiredColumns.forEach((column) => {
        expect(firstRecord).toHaveProperty(column);
      });
    });

    it('should contain valid data for each row', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      records.forEach((record) => {
        expect(record.city).toBeTruthy();
        expect(record.temperature).toBeTruthy();
        expect(record.humidity).toBeTruthy();
        expect(record.condition).toBeTruthy();
        expect(record.wind_speed).toBeTruthy();
        expect(record.pressure).toBeTruthy();
      });
    });
  });

  describe('Data Validation', () => {
    it('should have numeric temperature values', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      records.forEach((record) => {
        expect(!isNaN(record.temperature)).toBe(true);
      });
    });

    it('should have numeric humidity values', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      records.forEach((record) => {
        expect(!isNaN(record.humidity)).toBe(true);
        expect(parseInt(record.humidity)).toBeGreaterThanOrEqual(0);
        expect(parseInt(record.humidity)).toBeLessThanOrEqual(100);
      });
    });

    it('should have numeric wind_speed values', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      records.forEach((record) => {
        expect(!isNaN(record.wind_speed)).toBe(true);
        expect(parseInt(record.wind_speed)).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have numeric pressure values', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      records.forEach((record) => {
        expect(!isNaN(record.pressure)).toBe(true);
        expect(parseInt(record.pressure)).toBeGreaterThan(900);
      });
    });

    it('should have valid condition strings', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const validConditions = [
        'Sunny',
        'Rainy',
        'Cloudy',
        'Partly Cloudy',
        'Thunderstorm',
        'Foggy',
      ];

      records.forEach((record) => {
        expect(validConditions).toContain(record.condition);
      });
    });
  });

  describe('Data Uniqueness', () => {
    it('should have unique city names', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const cities = records.map((r) => r.city.toLowerCase());
      const uniqueCities = new Set(cities);

      expect(uniqueCities.size).toBe(cities.length);
    });
  });

  describe('Minimum Data Requirements', () => {
    it('should have at least 5 cities in data', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      expect(records.length).toBeGreaterThanOrEqual(5);
    });

    it('should include major US cities', () => {
      const csvFilePath = path.join(__dirname, '../../data/weather-data.csv');
      const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const cities = records.map((r) => r.city);
      expect(cities).toContain('New York');
      expect(cities).toContain('Los Angeles');
    });
  });
});
