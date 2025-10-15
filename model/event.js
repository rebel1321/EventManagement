import pool from '../config/db.js';

class Event {
  // Create a new event
  static async create(title, dateTime, location, capacity) {
    try {
      const query = `
        INSERT INTO events (title, date_time, location, capacity) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;
      const values = [title, dateTime, location, capacity];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find event by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM events WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get event details with registered users
  static async findByIdWithUsers(id) {
    try {
      const query = `
        SELECT 
          e.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', u.id,
                'name', u.name,
                'email', u.email,
                'registered_at', er.registered_at
              ) ORDER BY er.registered_at
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'
          ) as registered_users
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        LEFT JOIN users u ON er.user_id = u.id
        WHERE e.id = $1
        GROUP BY e.id
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all events
  static async findAll() {
    try {
      const query = 'SELECT * FROM events ORDER BY date_time';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get upcoming events with custom sorting (date ASC, then location alphabetically)
  static async findUpcoming() {
    try {
      const query = `
        SELECT * FROM events 
        WHERE date_time > NOW()
        ORDER BY date_time ASC, location ASC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Register a user for an event
  static async registerUser(eventId, userId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check if event exists and get details
      const eventQuery = 'SELECT * FROM events WHERE id = $1 FOR UPDATE';
      const eventResult = await client.query(eventQuery, [eventId]);
      
      if (eventResult.rows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventResult.rows[0];

      // Check if event is in the past
      if (new Date(event.date_time) < new Date()) {
        throw new Error('Cannot register for past events');
      }

      // Check if user already registered
      const checkQuery = `
        SELECT * FROM event_registrations 
        WHERE event_id = $1 AND user_id = $2
      `;
      const checkResult = await client.query(checkQuery, [eventId, userId]);
      
      if (checkResult.rows.length > 0) {
        throw new Error('User already registered for this event');
      }

      // Count current registrations
      const countQuery = `
        SELECT COUNT(*) as count FROM event_registrations 
        WHERE event_id = $1
      `;
      const countResult = await client.query(countQuery, [eventId]);
      const currentRegistrations = parseInt(countResult.rows[0].count);

      // Check if event is full
      if (currentRegistrations >= event.capacity) {
        throw new Error('Event is at full capacity');
      }

      // Register the user
      const registerQuery = `
        INSERT INTO event_registrations (event_id, user_id) 
        VALUES ($1, $2) 
        RETURNING *
      `;
      const registerResult = await client.query(registerQuery, [eventId, userId]);

      await client.query('COMMIT');
      return registerResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancel a user's registration
  static async cancelRegistration(eventId, userId) {
    try {
      // Check if registration exists
      const checkQuery = `
        SELECT * FROM event_registrations 
        WHERE event_id = $1 AND user_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [eventId, userId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('User is not registered for this event');
      }

      // Delete the registration
      const deleteQuery = `
        DELETE FROM event_registrations 
        WHERE event_id = $1 AND user_id = $2 
        RETURNING *
      `;
      const result = await pool.query(deleteQuery, [eventId, userId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get event statistics
  static async getStats(eventId) {
    try {
      const query = `
        SELECT 
          e.id,
          e.title,
          e.capacity,
          COUNT(er.id) as total_registrations,
          (e.capacity - COUNT(er.id)) as remaining_capacity,
          ROUND((COUNT(er.id)::decimal / e.capacity * 100), 2) as percentage_filled
        FROM events e
        LEFT JOIN event_registrations er ON e.id = er.event_id
        WHERE e.id = $1
        GROUP BY e.id, e.title, e.capacity
      `;
      const result = await pool.query(query, [eventId]);
      
      if (result.rows.length === 0) {
        throw new Error('Event not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update event
  static async update(id, title, dateTime, location, capacity) {
    try {
      const query = `
        UPDATE events 
        SET title = $1, date_time = $2, location = $3, capacity = $4 
        WHERE id = $5 
        RETURNING *
      `;
      const values = [title, dateTime, location, capacity, id];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Delete event
  static async delete(id) {
    try {
      const query = 'DELETE FROM events WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default Event;
