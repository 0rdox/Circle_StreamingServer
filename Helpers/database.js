const { MongoClient } = require('mongodb');

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

        return await collection.findOne({ _id: userId });

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

/**
 * Verifies a request.
 * @param {Object} req - The request to verify.
 * @param {Object} socket - The socket of the user.
 * @returns {boolean} True if the request is verified, false otherwise.
 */
function verifyRequest(socket, streamObject) {
    // console.log("request verify part 0")
    // console.log("HASH", streamObject.hash);
    if (socket._id && streamObject.hash) {
        console.log("Request verified part 1");
        console.log("socket ID", socket._id);
        console.log("streamObject userId", streamObject.userId);
        if (socket._id === streamObject.userId) {
            console.log("Request verified part 2");
            if (verifyHash(socket, streamObject)) {
                console.log("Request fully verified");
                return true;
            }
        }
    }
    console.log("Request verification failed");
    socket.emit("error", { message: "Request invalid" });
    return false;
}

/**
 * Verifies a hash.
 * @param {Object} req - The request containing the hash.
 * @param {Object} socket - The socket of the user.
 * @returns {boolean} True if the hash is verified, false otherwise.
 */
function verifyHash(socket, streamObject) {
    //Decrypt hash in req using the public key of the user
    console.log("Verifying Hash");
    if (!socket.userPk) {
        console.log("User public key not found");
        return false;
    }

    //Check how to decrypt in viewer client
    const decryptedHash = RSAHelper.decrypt(streamObject.hash, socket.userPk);
    const hash = sha512(`${streamObject.data}`);

    if (decryptedHash === hash) {
        console.log("Hash verified");
        return true;
    } else {
        console.log("Hash verification failed");
        return false;
    }
}

module.exports = { connectToDB, saveStream, getUser, verifyRequest };