import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import AppointmentSystem from './components/AppointmentSystem';

function App() {
  return (
    <ChakraProvider>
      <AppointmentSystem />
    </ChakraProvider>
  );
}

export default App;