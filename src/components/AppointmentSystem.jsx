import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  useToast,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addHours } from 'date-fns';

const SCHEDULE_ID = 758376;
const USER_ID = 13565402;

const AppointmentSystem = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Form state - only keeping full_name as per template
  const [formData, setFormData] = useState({
    full_name: '',
  });

  useEffect(() => {
    loadUserAppointments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd HH:mm:ss');
      const response = await fetch(
        `http://localhost:3000/api/supersaas/appointments/available/${SCHEDULE_ID}?fromTime=${formattedDate}&lengthMinutes=60`
      );
      if (!response.ok) throw new Error('Failed to fetch available slots');
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      showError(error.message);
    }
  };

  const loadUserAppointments = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/supersaas/appointments/user/${SCHEDULE_ID}/${USER_ID}`
      );
      if (!response.ok) throw new Error('Failed to fetch user appointments');
      const appointments = await response.json();
      setUserAppointments(appointments);
    } catch (error) {
      showError(error.message);
    }
  };

  const handleBookAppointment = async () => {
    try {
      // Strictly following the provided template
      const appointmentData = {
        booking: {
          start: format(new Date(selectedSlot), 'yyyy-MM-dd HH:mm:ss'),
          finish: format(addHours(new Date(selectedSlot), 1), 'yyyy-MM-dd% HH:mm:ss'),
          full_name: formData.full_name
        }
      };

      const response = await fetch(
        `http://localhost:3000/api/supersaas/appointments/create/${SCHEDULE_ID}/${USER_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
        }
      );
      
      if (!response.ok) throw new Error('Failed to book appointment');
      showSuccess('Appointment booked successfully!');
      onClose();
      loadUserAppointments();
      loadAvailableSlots();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/supersaas/appointments/cancel/${SCHEDULE_ID}/${appointmentId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to cancel appointment');
      showSuccess('Appointment cancelled successfully!');
      loadUserAppointments();
    } catch (error) {
      showError(error.message);
    }
  };

  const showSuccess = (message) => {
    toast({
      title: 'Success',
      description: message,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const showError = (message) => {
    console.log(message);
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading>Appointment Management System</Heading>

        <Box>
          <FormLabel>Select Date</FormLabel>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
          />
        </Box>

        <Box w="100%">
          <Heading size="md" mb={4}>
            Available Slots
          </Heading>
          <VStack spacing={2}>
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                w="100%"
                onClick={() => {
                  setSelectedSlot(slot);
                  onOpen();
                }}
              >
                {new Date(slot).toLocaleTimeString()}
              </Button>
            ))}
          </VStack>
        </Box>

        <Box w="100%">
          <Heading size="md" mb={4}>
            Your Appointments
          </Heading>
          <VStack spacing={4}>
            {userAppointments.map((appointment) => (
              <Box
                key={appointment.id}
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                w="100%"
              >
                <Text>
                  Date: {new Date(appointment.start).toLocaleDateString()}
                </Text>
                <Text>
                  Time: {new Date(appointment.start).toLocaleTimeString()}
                </Text>
                <Button
                  colorScheme="red"
                  size="sm"
                  mt={2}
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Book Appointment</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                  />
                </FormControl>
                <Button colorScheme="blue" onClick={handleBookAppointment}>
                  Book Appointment
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default AppointmentSystem;