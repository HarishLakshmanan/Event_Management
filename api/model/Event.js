import mongoose from 'mongoose';
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  capacity: { type: Number, required: true, min: 1 },
  location: String,
  status: { type: String, enum: ['scheduled','cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Event', EventSchema);
