import mongoose from 'mongoose';
const { Schema } = mongoose;

const RegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  registeredAt: { type: Date, default: Date.now }
});

// Unique per event + email prevents duplicates
RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.model('Registration', RegistrationSchema);
