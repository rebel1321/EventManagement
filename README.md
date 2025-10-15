# Event Management API

A comprehensive REST API for managing events and user registrations built with Node.js, Express, and PostgreSQL.

## Features

- 🎫 **Event Management**: Create, update, delete, and view events
- 👥 **User Management**: Full CRUD operations for users
- 📝 **Event Registration**: Register/cancel event registrations with business logic
- 📊 **Event Statistics**: Track registrations, capacity, and percentage filled
- 🔐 **Validation**: Input validation and error handling
- 🚫 **Business Rules**: Capacity limits, duplicate prevention, past event restrictions

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Language**: JavaScript (ES6+)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventManagementApi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your PostgreSQL credentials:
   ```
   DATABASE_USER=your_postgres_username
   DATABASE_HOST=localhost
   DATABASE_NAME=event_management
   DATABASE_PASSWORD=your_postgres_password
   DATABASE_PORT=5432
   PORT=3000
   ```

4. **Set up the database**
   
   Create the database:
   ```bash
   psql -U postgres
   CREATE DATABASE event_management;
   \q
   ```
   
   Run the schema:
   ```bash
   psql -U postgres -d event_management -f config/schema.sql
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The API will be running at `http://localhost:3000`

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Events

#### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00Z",
  "location": "San Francisco",
  "capacity": 500
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "eventId": 1,
    "title": "Tech Conference 2025",
    "dateTime": "2025-12-15T10:00:00.000Z",
    "location": "San Francisco",
    "capacity": 500
  }
}
```

**Validations**:
- Capacity must be positive and ≤ 1000
- All fields required
- Date must be valid ISO format

#### Get Event Details
```http
GET /api/events/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tech Conference 2025",
    "dateTime": "2025-12-15T10:00:00.000Z",
    "location": "San Francisco",
    "capacity": 500,
    "registeredUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com",
        "registered_at": "2025-10-15T10:30:00.000Z"
      }
    ]
  }
}
```

#### Get All Events
```http
GET /api/events
```

#### Get Upcoming Events
```http
GET /api/events/upcoming
```

Returns future events sorted by:
1. Date (ascending)
2. Location (alphabetically)

#### Get Event Statistics
```http
GET /api/events/:id/stats
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "title": "Tech Conference 2025",
    "capacity": 500,
    "totalRegistrations": 125,
    "remainingCapacity": 375,
    "percentageFilled": 25.00
  }
}
```

#### Update Event
```http
PUT /api/events/:id
Content-Type: application/json

{
  "title": "Updated Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00Z",
  "location": "San Francisco",
  "capacity": 600
}
```

#### Delete Event
```http
DELETE /api/events/:id
```

### Registrations

#### Register for Event
```http
POST /api/events/register
Content-Type: application/json

{
  "eventId": 1,
  "userId": 2
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Successfully registered for the event",
  "data": {
    "registrationId": 5,
    "eventId": 1,
    "userId": 2,
    "registeredAt": "2025-10-15T12:00:00.000Z"
  }
}
```

**Business Rules**:
- ❌ Cannot register for past events (400)
- ❌ Cannot register if event is full (400)
- ❌ Cannot register twice for same event (409)
- ❌ User/Event must exist (404)

#### Cancel Registration
```http
POST /api/events/cancel-registration
Content-Type: application/json

{
  "eventId": 1,
  "userId": 2
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

### Users

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

#### Get All Users
```http
GET /api/users
```

#### Get User by ID
```http
GET /api/users/:id
```

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

#### Delete User
```http
DELETE /api/users/:id
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200  | OK - Request succeeded |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid input or business rule violation |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Duplicate resource (e.g., duplicate registration) |
| 500  | Internal Server Error - Server-side error |

## Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

## Database Schema

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- created_at (TIMESTAMP)
```

### Events Table
```sql
- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- date_time (TIMESTAMP)
- location (VARCHAR)
- capacity (INTEGER, CHECK: > 0 AND <= 1000)
- created_at (TIMESTAMP)
```

### Event Registrations Table (Many-to-Many)
```sql
- id (SERIAL PRIMARY KEY)
- event_id (INTEGER, FK to events)
- user_id (INTEGER, FK to users)
- registered_at (TIMESTAMP)
- UNIQUE(event_id, user_id)
```

## Business Logic

### Registration Constraints
1. **Capacity Enforcement**: Maximum 1000 attendees per event
2. **No Duplicates**: One user can register only once per event
3. **Time Validation**: Cannot register for past events
4. **Concurrency Safe**: Uses database transactions for concurrent registrations

### Event Sorting
Upcoming events are sorted using a custom comparator:
1. Primary: Date & Time (ascending)
2. Secondary: Location (alphabetical)

## Project Structure

```
EventManagementApi/
├── config/
│   ├── db.js              # Database connection
│   └── schema.sql         # Database schema
├── controller/
│   ├── eventController.js # Event business logic
│   └── userController.js  # User business logic
├── model/
│   ├── Event.js          # Event model
│   └── User.js           # User model
├── routes/
│   ├── eventRoutes.js    # Event endpoints
│   └── userRoutes.js     # User endpoints
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Application entry point
```

## Development

### Run in Development Mode
```bash
npm run dev
```

### Run in Production Mode
```bash
npm start
```

## Testing

You can test the API using tools like:
- **Postman**: Import the endpoints and test
- **cURL**: Command-line testing
- **Thunder Client**: VS Code extension

### Example cURL Requests

**Create an event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Workshop",
    "dateTime": "2025-11-20T14:00:00Z",
    "location": "New York",
    "capacity": 50
  }'
```

**Register for event:**
```bash
curl -X POST http://localhost:3000/api/events/register \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "userId": 1
  }'
```

## Algorithms & Data Structures

### Custom Sorting Algorithm
The `findUpcoming()` method implements a custom comparator that sorts events by:
1. Date/Time (ascending) - Earlier events first
2. Location (alphabetical) - A-Z within same date

This is achieved using SQL `ORDER BY date_time ASC, location ASC`.

### Concurrency Handling
Registration uses PostgreSQL transactions with `FOR UPDATE` locking to handle concurrent registrations safely, preventing race conditions when checking capacity.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes with meaningful messages
4. Push to the branch
5. Open a Pull Request

## License

MIT

## Author

Satyam Tripathi

## Support

For issues or questions, please open an issue on the repository.
