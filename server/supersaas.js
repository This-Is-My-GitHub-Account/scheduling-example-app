// supersaas.js
import { Client } from 'supersaas-api-client';

// Initialize the client
const client = new Client({
  accountName:"tujha account name",
  api_key: "tujhi api key",
});

// Rate limiting helper
const rateLimiter = {
  lastRequest: 0,
  minInterval: 1000, // 1 second between requests
  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minInterval - timeSinceLastRequest)
      );
    }
    this.lastRequest = Date.now();
  },
};

// Error handler
const handleApiError = (error) => {
  console.error('API Error:', error);
  let message = 'An error occurred';

  if (error.message.includes('status')) {
    const status = parseInt(error.message.match(/\d+/)[0]);
    switch (status) {
      case 400:
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'Unauthorized. Please check your credentials.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 422:
        message = 'Invalid data provided. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      default:
        message = 'Server error. Please try again later.';
    }
  }

  throw new Error(message);
};

// Appointment Service
export const AppointmentService = {
  async getAvailable(scheduleId, fromTime, lengthMinutes = 60) {
    try {
      await rateLimiter.throttle();
      return await client.appointments.available(
        scheduleId,
        fromTime,
        lengthMinutes
      );
    } catch (error) {
      handleApiError(error);
    }
  },

  async create(scheduleId, userId, appointmentData) {
    try {
      await rateLimiter.throttle();
      return await client.appointments.create(
        scheduleId,
        userId,
        appointmentData,  
        true,
        true
      );
    } catch (error) {
      handleApiError(error);
    }
  },

  async update(scheduleId, appointmentId, appointmentData) {
    try {
      await rateLimiter.throttle();
      return await client.appointments.update(
        scheduleId,
        appointmentId,
        appointmentData,
        true,
        true
      );
    } catch (error) {
      handleApiError(error);
    }
  },

  async cancel(scheduleId, appointmentId) {
    try {
      await rateLimiter.throttle();
      await client.appointments.delete(scheduleId, appointmentId);
      return true;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getUserAppointments(scheduleId, userId) {
    try {
      await rateLimiter.throttle();
      const appointments = await client.appointments.list(
        scheduleId,
        true
      );
      return appointments.filter((app) => app.user_id === userId);
    } catch (error) {
      handleApiError(error);
    }
  },
};

export const supersaasClient = client;