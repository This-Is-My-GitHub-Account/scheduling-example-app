import express from 'express';
import cors from 'cors';
import supersaasRoutes from './supersaasRoutes.js'; // Ensure you add the `.js` extension for ES modules

const app = express();

// Middleware to parse JSON and handle CORS
app.use(cors({
    origin: 'http://localhost:5173', // Allow your Vite development server
}));
app.use(express.json());

// SuperSaaS routes
app.use('/api/supersaas', supersaasRoutes);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
