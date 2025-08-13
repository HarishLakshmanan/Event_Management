import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/Mongodb.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));