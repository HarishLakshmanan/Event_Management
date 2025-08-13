import Event from '../model/Event.js';
import Registration from '../model/registration.js';


// Create event: title, date, capacity required & date must be future
export const createEvent = async (req, res) => {
  try {
    const { title, date, capacity, description, location } = req.body;
    if (!title || !date || !capacity) {
      return res.status(400).json({ message: 'Title, date and capacity are required' });
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) 
        return res.status(400).json({ message: 'Invalid date' });
    if (d <= new Date()) 
        return res.status(400).json({ message: 'Event date must be in the future' });

    const ev = await Event.create({ title, date: d, capacity, description, location });
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List events with filters & sorting
// query params: from, to, q, status, sort (like date:asc), page, limit
export const listEvents = async (req, res) => {
  try {
    const { from, to, q, status, sort = 'date:asc', page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const [field, dir] = sort.split(':');
    const sortObj = { [field || 'date']: dir === 'desc' ? -1 : 1 };
    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * parseInt(limit, 10);

    const items = await Event.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit, 10));
    const total = await Event.countDocuments(filter);
    res.json({ total, page: pageNum, limit: parseInt(limit, 10), items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Register: duplicate email & capacity checks & cancelled block
export const register = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'name and email required' });

    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    if (ev.status === 'cancelled') return res.status(400).json({ message: 'Event is cancelled' });

    const registeredCount = await Registration.countDocuments({ eventId: ev._id });
    if (registeredCount >= ev.capacity) return res.status(409).json({ message: 'Event is full' });

    try {
      const reg = await Registration.create({ eventId: ev._id, name, email });
      res.status(201).json(reg);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'Email already registered for this event' });
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel event — prevents new registrations
export const cancelEvent = async (req, res) => {
  try {
    const ev = await Event.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stats
export const stats = async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    const registrationsCount = await Registration.countDocuments({ eventId: ev._id });
    const registrants = await Registration.find({ eventId: ev._id }).select('-__v').limit(100);

    res.json({
      eventId: ev._id,
      title: ev.title,
      date: ev.date,
      capacity: ev.capacity,
      status: ev.status,
      registrationsCount,
      remainingSeats: Math.max(ev.capacity - registrationsCount, 0),
      registrants
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
