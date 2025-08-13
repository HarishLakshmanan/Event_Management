import express from 'express';
import { createEvent, listEvents, getEvent, register, cancelEvent, stats } 
  from '../controller/eventController.js';
const router = express.Router();

router.post('/', createEvent);
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/:id/register', register);
router.post('/:id/cancel', cancelEvent); // POST used for simplicity
router.get('/:id/stats', stats);

export default router;
