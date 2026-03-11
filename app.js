import 'dotenv/config';
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, 'public')));
app.use(express.json());

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'fantastic' });
    console.log("Connected to MongoDB");
    console.log("Database: ", mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error: ', err);
    process.exit(1);
  }
}
run().catch(console.dir);

const attendeeSchema = new mongoose.Schema({
  name: String,
  status: String
});

const Attendee = mongoose.model("Attendee", attendeeSchema);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.post('/api/attendees', async (req, res) => {
  try {
    const attendee = await Attendee.create({
      name: req.body.name,
      status: req.body.status || "present"
    });
    res.status(201).json(attendee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/attendees', async (req, res) => {
  try {
    const attendees = await Attendee.find();
    res.status(200).json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/attendees/:id', async (req, res) => {
  try {
    const updated = await Attendee.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        status: req.body.status
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/attendees/:id', async (req, res) => {
  try {
    const deleted = await Attendee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});