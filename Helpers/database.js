const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        db = client.db('TheCircleDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}


async function getUser(userId) {
    try {
        const collection = db.collection('User');

        return await collection.findOne({ _id: new ObjectId(userId) });

    } catch (error) {
        console.error('Error getting user:', error);
    }
}

async function saveStream(streamObject) {
    try {
        const collection = db.collection('video_streams');
        await collection.insertOne(streamObject);
    } catch (error) {
        console.error('Error saving stream to MongoDB:', error);
    }
}

// Verify if the request has all necessary data
function verifyRequest(socket, streamObject) {
    if (socket._id && streamObject.hash && streamObject.data && streamObject.userId) {
        if (socket._id === streamObject.userId) {
            return true;
        }
    }
    socket.emit("error", { message: "Request invalid" });
    return false;
}




module.exports = { connectToDB, saveStream, getUser, verifyRequest };