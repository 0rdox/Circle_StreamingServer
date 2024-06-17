const { MongoClient } = require('mongodb');
// MongoDB Connection URI
const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db; // Initialize variable to hold the database reference

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db('TheCircleDB'); // Replace with your database name
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}


async function saveStream(streamObject) {
    // Save streamObject to MongoDB
    try {
        const collection = db.collection('video_streams'); // Replace with your collection name
        await collection.insertOne(streamObject);
        console.log('Stream saved to MongoDB');
    } catch (error) {
        console.error('Error saving stream to MongoDB:', error);
    }
}
module.exports = { connectToDB, saveStream };