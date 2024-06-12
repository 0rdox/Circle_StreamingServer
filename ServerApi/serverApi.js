const express = require('express');
const { MongoClient } = require('mongodb');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');
const streamRoutes = require('./routes/stream');

const app = express();
const port = 6000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection URL and database name
const url = 'mongodb://localhost/';
const dbName = 'TheCircleDB';

// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        const db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);
        
        // Pass the database connection to route handlers
        app.use((req, res, next) => {
            req.db = db;
            next();
        });
        
        // Include route handlers
        app.use('/chat', chatRoutes);
        app.use('/user', userRoutes);
        app.use('/stream', streamRoutes);
        
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(error => console.error(error));
