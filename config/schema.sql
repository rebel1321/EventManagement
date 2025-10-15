-- Event Management API Database Schema

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Event Registrations table (many-to-many relationship)
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id) -- Prevent duplicate registrations
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_users_email ON users(email);


