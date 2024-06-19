const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb://145.49.13.230:27017';
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
    console.log("UserId: ", userId);
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


let streamId;
let startTime;
async function activateStream(userId) {

    try {
        const streamCollection = db.collection('Stream');
        const result = await streamCollection.insertOne({ userId: new ObjectId(userId), StartTime: new Date() }).then((result) => {
            streamId = result.insertedId;
            startTime = new Date();
        });

        const collection = db.collection('User');
        await collection.updateOne({ _id: new ObjectId(userId) }, { $set: { IsStreaming: true } });
        console.log('Stream activated successfully');
    } catch (error) {
        console.error('Error activating chat', error);
    }
}

async function deactivateStream(userId) {
    try {
        const streamCollection = db.collection('Stream');
        const endTime = new Date();
        await streamCollection.updateOne({ _id: new ObjectId(streamId) }, { $set: { EndTime: endTime } });

        // Calculate satoshi
        const durationInMilliseconds = endTime - startTime;
        const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

        let satoshiEarned = 0;
        let satoshiPerInterval = 1;

        const numberOfIntervals = Math.floor(durationInHours);

        for (let i = 0; i < numberOfIntervals; i++) {
            satoshiEarned += satoshiPerInterval;
            satoshiPerInterval *= 2;
        }

        //Set user to not streaming
        const collection = db.collection('User');
        await collection.updateOne({ _id: new ObjectId(userId) }, { $inc: { Balance: satoshiEarned }, $set: { IsStreaming: false } });
        console.log('Stream deactivated successfully');
    } catch (error) {
        console.error('Error deactivating stream', error);
    }
}


module.exports = { connectToDB, saveStream, getUser, verifyRequest, activateStream, deactivateStream };