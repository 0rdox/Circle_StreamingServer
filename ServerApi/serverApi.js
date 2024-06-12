const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 6000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection URL and database name
const url = 'mongodb://localhost:27017';
const dbName = 'TheCircleDB';

let db;

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);
    })
    .catch(error => console.error(error));

// Routes

// Get a single Chat message

var oid = new ObjectId();

// app.get('/chat/:_id', async (req, res) => {
//     try {
//         console.log('Received _id parameter:', req.params._id);
//         //var id = MongoClient.ObjectId(req.params._id);
//         const chat = await db.collection('Chat').findOne({ _id: oid })
//         { _id: ObjectId(req.params._id) };

//         res.json(chat);
//     } catch (error) {
//         res.status(500).json({ error: error.toString() });
//     }
// });

app.get('/chat/:_id', async (req, res) => {
    try {
        console.log('Received _id parameter:', req.params._id);
        const chat = await db.collection('Chat').findOne({ _id: ObjectId(req.params._id) });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


// Get a single User
app.get('/user/:id', async (req, res) => {
    try {
        const user = await db.collection('User').findOne({ _id: ObjectId(req.params.id) });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// get public key from oneUser
app.get('/user/:id/publicKey', async (req, res) => {
    try {
        const user = await db.collection('User').findOne({ _id: ObjectId(req.params.id) });
        res.json(user.PublicKey);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// get public key from all Users


// Insert a new Chat message
app.post('/chat', async (req, res) => {
    try {
        const chat = req.body;
        chat.Timestamp = new Date();
        const result = await db.collection('Chat').insertOne(chat);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Insert a new User
app.post('/user', async (req, res) => {
    try {
        const user = req.body;
        const result = await db.collection('User').insertOne(user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Get a single Stream chunk
// app.get('/stream/chunks/:id', async (req, res) => {
//     try {
//         const chunk = await db.collection('Stream.chunks').findOne({ _id: ObjectId(req.params.id) });
//         res.json(chunk);
//     } catch (error) {
//         res.status(500).json({ error: error.toString() });
//     }
// });

// // Get a single Stream file
// app.get('/stream/files/:id', async (req, res) => {
//     try {
//         const file = await db.collection('Stream.files').findOne({ _id: ObjectId(req.params.id) });
//         res.json(file);
//     } catch (error) {
//         res.status(500).json({ error: error.toString() });
//     }
// });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
