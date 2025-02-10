import express from 'express';
import { AppointmentService } from './supersaas.js';

const router = express.Router();

// Route to get available appointments
router.get('/appointments/available/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  const { fromTime, lengthMinutes } = req.query;
  try {
    const appointments = await AppointmentService.getAvailable(
      scheduleId,
      fromTime,
      parseInt(lengthMinutes) || 60  // Added parsing for lengthMinutes
    );
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route to create an appointment
router.post('/appointments/create/:scheduleId/', async (req, res) => {
  const { scheduleId } = req.params;
  const appointmentData = req.body;
  try {
    const result = await AppointmentService.create(scheduleId, appointmentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to update an appointment
router.put('/appointments/update/:scheduleId/:appointmentId', async (req, res) => {
  const { scheduleId, appointmentId } = req.params;
  const appointmentData = req.body;
  try {
    const result = await AppointmentService.update(scheduleId, appointmentId, appointmentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to cancel an appointment
router.delete('/appointments/cancel/:scheduleId/:appointmentId', async (req, res) => {
  const { scheduleId, appointmentId } = req.params;
  try {
    const result = await AppointmentService.cancel(scheduleId, appointmentId);
    res.json({ success: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get a user's appointments
router.get('/appointments/user/:scheduleId/:userId', async (req, res) => {
  const { scheduleId, userId } = req.params;
  try {
    const appointments = await AppointmentService.getUserAppointments(scheduleId, userId);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
