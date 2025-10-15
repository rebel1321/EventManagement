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

---

## 📋 Complete API Documentation

### 1. **Create Event**

Creates a new event with specified details.

**Endpoint:** `POST /api/events`

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "dateTime": "2025-12-15T10:00:00Z",
  "location": "San Francisco",
  "capacity": 500
}
```

**Success Response (201 Created):**
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

**Validation Rules:**
- ✅ `title`: Required, non-empty string
- ✅ `dateTime`: Required, valid ISO 8601 format
- ✅ `location`: Required, non-empty string
- ✅ `capacity`: Required, positive integer, maximum 1000

**Error Responses:**

*Invalid capacity (400 Bad Request):*
```json
{
  "success": false,
  "message": "Capacity must be a positive number and cannot exceed 1000"
}
```

*Missing required fields (400 Bad Request):*
```json
{
  "success": false,
  "message": "All fields (title, dateTime, location, capacity) are required"
}
```

---

### 2. **Get Event Details**

Retrieves complete details of a specific event including all registered users.

**Endpoint:** `GET /api/events/:id`

**Example:** `GET /api/events/1`

**Success Response (200 OK):**
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
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "registered_at": "2025-10-15T11:45:00.000Z"
      }
    ]
  }
}
```

**Error Response:**

*Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### 3. **Get All Events**

Retrieves a list of all events in the system.

**Endpoint:** `GET /api/events`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Tech Conference 2025",
      "dateTime": "2025-12-15T10:00:00.000Z",
      "location": "San Francisco",
      "capacity": 500,
      "created_at": "2025-10-15T09:00:00.000Z"
    },
    {
      "id": 2,
      "title": "AI Workshop",
      "dateTime": "2025-11-20T14:00:00.000Z",
      "location": "New York",
      "capacity": 100,
      "created_at": "2025-10-15T10:00:00.000Z"
    }
  ]
}
```

---

### 4. **List Upcoming Events**

Retrieves all future events with custom sorting logic.

**Endpoint:** `GET /api/events/upcoming`

**Sorting Rules:**
1. **Primary Sort:** Date & Time (earliest first)
2. **Secondary Sort:** Location (alphabetical A-Z)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "title": "DevOps Meetup",
      "dateTime": "2025-11-10T18:00:00.000Z",
      "location": "Austin",
      "capacity": 50,
      "created_at": "2025-10-15T11:00:00.000Z"
    },
    {
      "id": 2,
      "title": "AI Workshop",
      "dateTime": "2025-11-10T18:00:00.000Z",
      "location": "Boston",
      "capacity": 100,
      "created_at": "2025-10-15T10:00:00.000Z"
    },
    {
      "id": 1,
      "title": "Tech Conference 2025",
      "dateTime": "2025-12-15T10:00:00.000Z",
      "location": "San Francisco",
      "capacity": 500,
      "created_at": "2025-10-15T09:00:00.000Z"
    }
  ]
}
```

**Note:** Events on the same date (Nov 10) are sorted alphabetically by location (Austin before Boston).

---

### 5. **Get Event Statistics**

Retrieves statistical information about an event including registration metrics.

**Endpoint:** `GET /api/events/:id/stats`

**Example:** `GET /api/events/1/stats`

**Success Response (200 OK):**
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

**Calculation Logic:**
- `totalRegistrations`: Count of registered users
- `remainingCapacity`: capacity - totalRegistrations
- `percentageFilled`: (totalRegistrations / capacity) × 100

**Example with Full Event:**
```json
{
  "success": true,
  "data": {
    "eventId": 2,
    "title": "AI Workshop",
    "capacity": 100,
    "totalRegistrations": 100,
    "remainingCapacity": 0,
    "percentageFilled": 100.00
  }
}
```

**Error Response:**

*Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### 6. **Register for Event**

Registers a user for a specific event with business rule validation.

**Endpoint:** `POST /api/events/register`

**Request Body:**
```json
{
  "eventId": 1,
  "userId": 2
}
```

**Success Response (201 Created):**
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

**Business Rules & Error Responses:**

*1. User already registered (409 Conflict):*
```json
{
  "success": false,
  "message": "User is already registered for this event"
}
```

*2. Event at full capacity (400 Bad Request):*
```json
{
  "success": false,
  "message": "Event is at full capacity"
}
```

*3. Past event registration attempt (400 Bad Request):*
```json
{
  "success": false,
  "message": "Cannot register for past events"
}
```

*4. Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

*5. User not found (404 Not Found):*
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 7. **Cancel Registration**

Cancels a user's registration for an event.

**Endpoint:** `POST /api/events/cancel-registration`

**Request Body:**
```json
{
  "eventId": 1,
  "userId": 2
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Registration cancelled successfully"
}
```

**Error Responses:**

*User not registered (404 Not Found):*
```json
{
  "success": false,
  "message": "User is not registered for this event"
}
```

*Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### 8. **Update Event**

Updates an existing event's details.

**Endpoint:** `PUT /api/events/:id`

**Request Body:**
```json
{
  "title": "Updated Tech Conference 2025",
  "dateTime": "2025-12-16T10:00:00Z",
  "location": "Los Angeles",
  "capacity": 600
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Tech Conference 2025",
    "dateTime": "2025-12-16T10:00:00.000Z",
    "location": "Los Angeles",
    "capacity": 600
  }
}
```

**Error Response:**

*Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

### 9. **Delete Event**

Deletes an event and all associated registrations.

**Endpoint:** `DELETE /api/events/:id`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Response:**

*Event not found (404 Not Found):*
```json
{
  "success": false,
  "message": "Event not found"
}
```

---

## 👥 User Management Endpoints

### 10. **Create User**

Creates a new user in the system.

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "created_at": "2025-10-15T13:00:00.000Z"
  }
}
```

**Error Responses:**

*Missing required fields (400 Bad Request):*
```json
{
  "success": false,
  "message": "Name and email are required"
}
```

*Duplicate email (409 Conflict):*
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 11. **Get All Users**

Retrieves a list of all users.

**Endpoint:** `GET /api/users`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-10-14T09:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Alice Johnson",
      "email": "alice.j@example.com",
      "created_at": "2025-10-14T10:30:00.000Z"
    }
  ]
}
```

---

### 12. **Get User by ID**

Retrieves details of a specific user.

**Endpoint:** `GET /api/users/:id`

**Example:** `GET /api/users/1`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "created_at": "2025-10-14T09:00:00.000Z"
  }
}
```

**Error Response:**

*User not found (404 Not Found):*
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 13. **Update User**

Updates an existing user's information.

**Endpoint:** `PUT /api/users/:id`

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "email": "john.updated@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated Doe",
    "email": "john.updated@example.com"
  }
}
```

**Error Response:**

*User not found (404 Not Found):*
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 14. **Delete User**

Deletes a user and all their event registrations.

**Endpoint:** `DELETE /api/users/:id`

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response:**

*User not found (404 Not Found):*
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 📊 HTTP Status Codes

| Code | Status | Description | When Used |
|------|--------|-------------|-----------|
| 200  | OK | Request succeeded | Successful GET, PUT, DELETE, or registration cancellation |
| 201  | Created | Resource created successfully | Successful POST for creating events/users/registrations |
| 400  | Bad Request | Invalid input or business rule violation | Invalid data, capacity exceeded, past event registration |
| 404  | Not Found | Resource doesn't exist | Event/User not found, registration doesn't exist |
| 409  | Conflict | Duplicate resource | Duplicate registration, duplicate email |
| 500  | Internal Server Error | Server-side error | Database errors, unexpected failures |

---

## 🔒 Business Logic Rules

### Event Management
- ✅ **Capacity Limit**: Events cannot have more than 1000 attendees
- ✅ **Positive Capacity**: Capacity must be at least 1
- ✅ **Required Fields**: All event fields (title, dateTime, location, capacity) are mandatory
- ✅ **Date Format**: DateTime must be in valid ISO 8601 format

### Registration Constraints
- ❌ **No Duplicate Registrations**: A user can only register once per event
- ❌ **Capacity Enforcement**: Cannot register when event is at full capacity
- ❌ **Time Validation**: Cannot register for events that have already occurred
- ❌ **User/Event Existence**: Both user and event must exist in the database
- ✅ **Cascading Deletes**: Deleting an event removes all associated registrations
- ✅ **Cascading Deletes**: Deleting a user removes all their registrations

### Sorting Logic
- **Upcoming Events**: Sorted first by date/time (ascending), then by location (alphabetical)
- Implementation uses SQL `ORDER BY date_time ASC, location ASC`

---

## 🔧 Testing Examples

### Using cURL

**1. Create a User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"John Doe\", \"email\": \"john@example.com\"}"
```

**2. Create an Event:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Tech Meetup\", \"dateTime\": \"2025-11-20T18:00:00Z\", \"location\": \"Boston\", \"capacity\": 50}"
```

**3. Register User for Event:**
```bash
curl -X POST http://localhost:3000/api/events/register \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": 1, \"userId\": 1}"
```

**4. Get Event Statistics:**
```bash
curl http://localhost:3000/api/events/1/stats
```

**5. Get Upcoming Events:**
```bash
curl http://localhost:3000/api/events/upcoming
```

**6. Cancel Registration:**
```bash
curl -X POST http://localhost:3000/api/events/cancel-registration \
  -H "Content-Type: application/json" \
  -d "{\"eventId\": 1, \"userId\": 1}"
```

### Using PowerShell

**1. Create a User:**
```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Post -Body $body -ContentType "application/json"
```

**2. Create an Event:**
```powershell
$body = @{
    title = "Tech Meetup"
    dateTime = "2025-11-20T18:00:00Z"
    location = "Boston"
    capacity = 50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/events" -Method Post -Body $body -ContentType "application/json"
```

**3. Register for Event:**
```powershell
$body = @{
    eventId = 1
    userId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/events/register" -Method Post -Body $body -ContentType "application/json"
```

**4. Get Event Details:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/events/1" -Method Get
```

---

## 🎯 Complete Workflow Example

### Scenario: Creating an event and managing registrations

**Step 1: Create two users**
```bash
# User 1
POST /api/users
{
  "name": "Alice Johnson",
  "email": "alice@example.com"
}
# Response: { "success": true, "data": { "id": 1, ... }}

# User 2
POST /api/users
{
  "name": "Bob Smith",
  "email": "bob@example.com"
}
# Response: { "success": true, "data": { "id": 2, ... }}
```

**Step 2: Create an event**
```bash
POST /api/events
{
  "title": "JavaScript Workshop",
  "dateTime": "2025-11-15T14:00:00Z",
  "location": "Seattle",
  "capacity": 2
}
# Response: { "success": true, "data": { "eventId": 1, ... }}
```

**Step 3: Register users**
```bash
# Register Alice
POST /api/events/register
{
  "eventId": 1,
  "userId": 1
}
# Response: { "success": true, "message": "Successfully registered for the event" }

# Register Bob
POST /api/events/register
{
  "eventId": 1,
  "userId": 2
}
# Response: { "success": true, "message": "Successfully registered for the event" }
```

**Step 4: Try to register third user (should fail - capacity full)**
```bash
POST /api/users
{
  "name": "Charlie Brown",
  "email": "charlie@example.com"
}
# Response: { "success": true, "data": { "id": 3, ... }}

POST /api/events/register
{
  "eventId": 1,
  "userId": 3
}
# Response: { "success": false, "message": "Event is at full capacity" } ❌
```

**Step 5: Check event statistics**
```bash
GET /api/events/1/stats
# Response:
{
  "success": true,
  "data": {
    "eventId": 1,
    "title": "JavaScript Workshop",
    "capacity": 2,
    "totalRegistrations": 2,
    "remainingCapacity": 0,
    "percentageFilled": 100.00
  }
}
```

**Step 6: Bob cancels registration**
```bash
POST /api/events/cancel-registration
{
  "eventId": 1,
  "userId": 2
}
# Response: { "success": true, "message": "Registration cancelled successfully" }
```

**Step 7: Now Charlie can register**
```bash
POST /api/events/register
{
  "eventId": 1,
  "userId": 3
}
# Response: { "success": true, "message": "Successfully registered for the event" } ✅
```

**Step 8: Get event details with registered users**
```bash
GET /api/events/1
# Response:
{
  "success": true,
  "data": {
    "id": 1,
    "title": "JavaScript Workshop",
    "dateTime": "2025-11-15T14:00:00.000Z",
    "location": "Seattle",
    "capacity": 2,
    "registeredUsers": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "registered_at": "2025-10-15T10:30:00.000Z"
      },
      {
        "id": 3,
        "name": "Charlie Brown",
        "email": "charlie@example.com",
        "registered_at": "2025-10-15T11:15:00.000Z"
      }
    ]
  }
}
```

---

## 💾 Database Schema

### Tables Structure

#### 1. **users**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Auto-incrementing unique identifier
- `name`: User's full name
- `email`: Unique email address
- `created_at`: Account creation timestamp

#### 2. **events**
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id`: Auto-incrementing unique identifier
- `title`: Event name
- `date_time`: When the event occurs (ISO 8601)
- `location`: Event venue/location
- `capacity`: Maximum attendees (1-1000)
- `created_at`: Event creation timestamp

**Constraints:**
- Capacity must be between 1 and 1000

#### 3. **event_registrations** (Many-to-Many Relationship)
```sql
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);
```

**Columns:**
- `id`: Auto-incrementing unique identifier
- `event_id`: Foreign key to events table
- `user_id`: Foreign key to users table
- `registered_at`: Registration timestamp

**Constraints:**
- `UNIQUE(event_id, user_id)`: Prevents duplicate registrations
- `ON DELETE CASCADE`: Auto-deletes registrations when event/user is deleted

### Relationships

```
users (1) ----< event_registrations >---- (1) events
         Many-to-Many Relationship
```

- One user can register for many events
- One event can have many registered users
- The `event_registrations` table is the junction/bridge table

---

## 🗂️ Project Structure

```
EventManagementApi/
│
├── config/
│   ├── db.js                    # PostgreSQL connection pool
│   └── schema.sql               # Database schema definition
│
├── controller/
│   ├── eventController.js       # Event business logic & validation
│   └── userController.js        # User CRUD operations
│
├── model/
│   ├── Event.js                 # Event database queries
│   └── User.js                  # User database queries
│
├── routes/
│   ├── eventRoutes.js           # Event API endpoints
│   └── userRoutes.js            # User API endpoints
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
├── README.md                    # This file
└── server.js                    # Application entry point
```

### File Descriptions

| File | Purpose |
|------|---------|
| `server.js` | Main application file, sets up Express server and middleware |
| `config/db.js` | PostgreSQL connection configuration using pg Pool |
| `config/schema.sql` | SQL script to create database tables and constraints |
| `model/Event.js` | Data layer for event-related database operations |
| `model/User.js` | Data layer for user-related database operations |
| `controller/eventController.js` | Business logic for events, registrations, validations |
| `controller/userController.js` | Business logic for user management |
| `routes/eventRoutes.js` | Express route definitions for event endpoints |
| `routes/userRoutes.js` | Express route definitions for user endpoints |

---

## 🚀 Getting Started Guide

### Prerequisites Checklist
- [ ] Node.js v14+ installed
- [ ] PostgreSQL v12+ installed and running
- [ ] Git installed (for version control)
- [ ] Code editor (VS Code recommended)

### Step-by-Step Setup

**1. Clone and Navigate**
```bash
git clone <repository-url>
cd EventManagementApi
```

**2. Install Dependencies**
```bash
npm install
```

**3. Configure Environment**

Create a `.env` file in the root directory:
```env
DATABASE_USER=postgres
DATABASE_HOST=localhost
DATABASE_NAME=event_management
DATABASE_PASSWORD=your_password_here
DATABASE_PORT=5432
PORT=3000
```

**4. Setup Database**

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE event_management;

# Exit psql
\q

# Run schema
psql -U postgres -d event_management -f config/schema.sql
```

**5. Start the Server**
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

**6. Verify Installation**
```bash
curl http://localhost:3000/api/events
# Should return: {"success": true, "data": []}
```

---

## 🧪 Testing the API

### Recommended Tools
- **VS Code Extension**: Thunder Client or REST Client
- **Standalone**: Postman or Insomnia
- **Command Line**: cURL or PowerShell

### Test Sequence

1. ✅ Create users
2. ✅ Create events
3. ✅ Register users for events
4. ✅ View event details with registrations
5. ✅ Check event statistics
6. ✅ List upcoming events
7. ✅ Test business rules (duplicate registration, capacity, past events)
8. ✅ Cancel registrations
9. ✅ Update events/users
10. ✅ Delete events/users

---

## ⚙️ Algorithms & Technical Implementation

### 1. Custom Sorting Algorithm
**Location**: `model/Event.js` - `findUpcoming()` method

**Implementation**:
```javascript
// SQL-based sorting with custom comparator
ORDER BY date_time ASC, location ASC
```

**Logic**:
- Primary sort: Events are ordered by date/time (earliest first)
- Secondary sort: Events on the same date are sorted alphabetically by location
- Only future events are included (`WHERE date_time > NOW()`)

### 2. Concurrency Handling
**Location**: `controller/eventController.js` - `registerForEvent()` method

**Problem**: Multiple users registering simultaneously for limited spots

**Solution**:
```javascript
// PostgreSQL transaction with row-level locking
BEGIN;
SELECT capacity FROM events WHERE id = $1 FOR UPDATE;
// Check capacity constraint
INSERT INTO event_registrations ...
COMMIT;
```

**Benefits**:
- Prevents race conditions
- Ensures data consistency
- Handles concurrent requests safely

### 3. Business Rule Validation
**Location**: `controller/eventController.js`

**Implemented Rules**:
1. **Capacity Check**: Validates total registrations < capacity
2. **Time Validation**: Compares event datetime with current time
3. **Duplicate Prevention**: Uses UNIQUE constraint in database
4. **Cascade Operations**: ON DELETE CASCADE for referential integrity

### 4. Error Handling Strategy
- **Try-Catch Blocks**: Wrap all async operations
- **Meaningful Messages**: User-friendly error messages
- **Proper HTTP Codes**: RESTful status code conventions
- **Consistent Format**: All responses follow same structure

---

## 📚 Dependencies

```json
{
  "express": "^4.18.2",        // Web framework
  "pg": "^8.11.3",              // PostgreSQL client
  "dotenv": "^16.3.1",          // Environment variable management
  "nodemon": "^3.0.1"           // Development auto-reload (dev only)
}
```

---

## 🔐 Security Considerations

### Current Implementation
- ✅ Environment variables for sensitive data
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation on all endpoints

### Production Recommendations
- 🔒 Add authentication (JWT tokens)
- 🔒 Implement rate limiting
- 🔒 Add request validation middleware (e.g., express-validator)
- 🔒 Use HTTPS in production
- 🔒 Implement CORS properly
- 🔒 Add logging and monitoring
- 🔒 Database connection pooling (already implemented with pg Pool)

---

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
