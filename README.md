# Weather Backend API

A simple backend application that returns weather data for cities using CSV as the data source.

## Features

- ✅ Multiple API endpoints to fetch weather data
- ✅ Full weather data endpoint (temperature, humidity, condition, wind, pressure)
- ✅ Lightweight condition-only endpoint for minimal data transfer
- ✅ Weather data stored in CSV format
- ✅ CORS enabled for frontend integration
- ✅ Simple Express.js server

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

### 1. Health Check
```
GET /api/health
```
Returns server status.

**Response:**
```json
{
  "status": "OK",
  "message": "Weather API is running"
}
```

### 2. Get All Available Cities
```
GET /api/cities
```
Returns list of all cities with weather data.

**Response:**
```json
{
  "cities": ["New York", "Los Angeles", "Chicago", ...]
}
```

### 3. Get Weather for a City (Main Endpoint)
```
GET /api/weather/:city
```

**Example:**
```
GET /api/weather/New%20York
```

**Response:**
```json
{
  "city": "New York",
  "temperature": "72°F",
  "humidity": "65%",
  "condition": "Cloudy",
  "wind_speed": "12 mph",
  "pressure": "1013 mb"
}
```

**Error Response (404):**
```json
{
  "error": "City not found",
  "message": "Weather data for \"Unknown City\" is not available"
}
```

### 4. Get Weather Condition Only (Lightweight Endpoint)
```
GET /api/condition?city={cityName}
```

**Example:**
```
GET /api/condition?city=Chicago
```

**Response:**
```json
{
  "city": "Chicago",
  "condition": "Rainy"
}
```

**Error Response (400 - Missing Parameter):**
```json
{
  "error": "Missing parameter",
  "message": "City name is required as a query parameter"
}
```

**Error Response (404 - City Not Found):**
```json
{
  "error": "City not found",
  "message": "Weather condition for \"Unknown City\" is not available"
}
```

**Benefits:**
- Minimal payload (67% smaller than full weather endpoint)
- Faster response time for simple condition checks
- **Note**: City name matching is case-sensitive (exact match required)

## Testing with cURL

```bash
# Get full weather data for New York
curl http://localhost:3000/api/weather/New%20York

# Get condition only for Chicago
curl http://localhost:3000/api/condition?city=Chicago

# Get all cities
curl http://localhost:3000/api/cities

# Health check
curl http://localhost:3000/api/health
```

## Data Format

Weather data is stored in `weather-data.csv` with the following columns:
- `city` - City name
- `temperature` - Temperature in Fahrenheit
- `humidity` - Humidity percentage
- `condition` - Weather condition
- `wind_speed` - Wind speed in mph
- `pressure` - Atmospheric pressure in mb

## Adding More Cities

Edit `weather-data.csv` and add new rows with weather data for additional cities. The server will reload the data on restart.

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **CSV Parse** - CSV parsing
- **CORS** - Cross-origin support