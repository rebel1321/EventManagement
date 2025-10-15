import express from 'express';
import {
  createEvent,
  getEventDetails,
  registerForEvent,
  cancelRegistration,
  getUpcomingEvents,
  getEventStats,
  getAllEvents,
  updateEvent,
  deleteEvent
} from '../controller/eventController.js';

const router = express.Router();

// Event routes
router.post('/', createEvent);                          // Create event
router.get('/', getAllEvents);                          // Get all events
router.get('/upcoming', getUpcomingEvents);             // Get upcoming events (must be before /:id)
router.get('/:id', getEventDetails);                    // Get event details with users
router.get('/:id/stats', getEventStats);                // Get event statistics
router.put('/:id', updateEvent);                        // Update event
router.delete('/:id', deleteEvent);                     // Delete event

// Registration routes
router.post('/register', registerForEvent);             // Register for event
router.post('/cancel-registration', cancelRegistration); // Cancel registration

export default router;
