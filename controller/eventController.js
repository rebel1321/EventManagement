import Event from '../model/Event.js';
import User from '../model/User.js';

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const { title, dateTime, location, capacity } = req.body;

    // Validate input
    if (!title || !dateTime || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, dateTime, location, capacity) are required'
      });
    }

    // Validate capacity
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number'
      });
    }

    if (capacityNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Capacity cannot exceed 1000'
      });
    }

    // Validate date format
    const eventDate = new Date(dateTime);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use ISO format (e.g., 2025-12-31T18:00:00Z)'
      });
    }

    const event = await Event.create(title, dateTime, location, capacityNum);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        eventId: event.id,
        title: event.title,
        dateTime: event.date_time,
        location: event.location,
        capacity: event.capacity
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get event details with registered users
export const getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdWithUsers(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        dateTime: event.date_time,
        location: event.location,
        capacity: event.capacity,
        registeredUsers: event.registered_users
      }
    });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Register a user for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Validate input
    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and User ID are required'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Register user for event (handles all business logic)
    const registration = await Event.registerUser(eventId, userId);

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        registrationId: registration.id,
        eventId: registration.event_id,
        userId: registration.user_id,
        registeredAt: registration.registered_at
      }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    
    // Handle specific error messages
    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Cannot register for past events') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'User already registered for this event') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message === 'Event is at full capacity') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel a user's registration
export const cancelRegistration = async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    // Validate input
    if (!eventId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and User ID are required'
      });
    }

    await Event.cancelRegistration(eventId, userId);

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    
    if (error.message === 'User is not registered for this event') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// List upcoming events with custom sorting
export const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.findUpcoming();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events.map(event => ({
        id: event.id,
        title: event.title,
        dateTime: event.date_time,
        location: event.location,
        capacity: event.capacity
      }))
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get event statistics
export const getEventStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await Event.getStats(id);

    res.status(200).json({
      success: true,
      data: {
        eventId: stats.id,
        title: stats.title,
        capacity: stats.capacity,
        totalRegistrations: parseInt(stats.total_registrations),
        remainingCapacity: parseInt(stats.remaining_capacity),
        percentageFilled: parseFloat(stats.percentage_filled)
      }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    
    if (error.message === 'Event not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dateTime, location, capacity } = req.body;

    // Validate input
    if (!title || !dateTime || !location || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, dateTime, location, capacity) are required'
      });
    }

    // Validate capacity
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number'
      });
    }

    if (capacityNum > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Capacity cannot exceed 1000'
      });
    }

    // Check if event exists
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = await Event.update(id, title, dateTime, location, capacityNum);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.delete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
