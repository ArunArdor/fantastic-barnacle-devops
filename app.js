//app.js
//we are in ES6, use this. 
import 'dotenv/config'; 
import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';  // For async file reading
import mongoose from 'mongoose';

// const { MongoClient, ServerApiVersion } = require('mongodb');
//const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;


app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(process.env.MONGO_URI, {dbName: 'fantastic'});
    
    console.log("Connected to MongoDB");
    console.log("Database: ", mongoose.connection.name);
  } catch (err) {
    console.error('MongoDB connection error: ', err);
    process.exit(1);
  }
}
run().catch(console.dir);

// MongoDB schema (structure of data in database)
const attendeeSchema = new mongoose.Schema({
  name: String,
  status: String
});

// MongoDB model
const Attendee = mongoose.model("Attendee", attendeeSchema);


// middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name ur endpoint}
app.get('/', (req, res) => {
  // res.send('Hello Express'); //string response
  // res.sendFile('index.html'); // <- this don't work w/o imports, assign, and arguements
  res.sendFile(join(__dirname, 'public', 'index.html')) ;

})

app.get('/inject', (req, res) => {
  // Inject a server variable into barry.html: templating view like ejs or pug
  readFile(join(__dirname, 'public', 'index.html'), 'utf8')
    .then(html => {
      // Replace a placeholder in the HTML (e.g., {{myVar}})
      const injectedHtml = html.replace('{{myVar}}', myVar);
      res.send(injectedHtml);
    })
    .catch(err => {
      res.status(500).send('Error loading page');
    });
})

app.get('/api/json', (req, res) =>{
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.get('/api/query', (req, res) => {
  console.log("client request with query param:", req.query.name); 
  res.json({"message": req.query.name});
});

app.get('/api/url/:iaddasfsd', (req, res) => {

  console.log("client request with URL param:", req.params.iaddasfsd); 
  res.json({"message": `Hi, ${req.params.iaddasfsd}. How are you?`});
});


app.post('/api/body', (req, res) => {
  // console.log("the body:", req.body); 
  console.log("client request with body:", req.body.name); 
  res.json({"message": req.body.name});
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

//start the server. 
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
