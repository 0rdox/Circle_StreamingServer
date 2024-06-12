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
app.get('/chat/:_id', async (req, res) => {
    try {
        console.log('Received _id parameter:', req.params._id);
        const chat = await db.collection('Chat').findOne({ _id: new ObjectId(req.params._id) });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


// Get a single User
app.get('/user/:_id', async (req, res) => {
    try {
        const user = await db.collection('User').findOne({ _id: new ObjectId(req.params._id) });
        res.json(user);
        console.log("response", res.json(user));
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// get public key from oneUser by email
app.get('/user/publicKey', async (req, res) => {
    try {
        // Retrieve the email from the query parameters
        const email = req.query.email;

        // Check if the email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required in the query parameters' });
        }

        // Find the user by email
        const user = await db.collection('User').findOne({ Email: email });

        if (user) {
            // Respond with the user's public key if found
            res.json(user.PublicKey);
        } else {
            // Respond with a 404 status code and an error message if the user is not found
            res.status(404).json({ error: 'User not found' });
        }
      
    } catch (error) {
        // Handle any errors that occur during the process
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
