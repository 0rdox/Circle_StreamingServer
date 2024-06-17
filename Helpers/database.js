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

        return await collection.findOne({ userId: userId });

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
function verifyRequest(socket) {
    if (req.username && req.userId && req.timestamp && req.content && req.hash) {
        if (socket.username === req.username && socket.userId === req.userId) {
            if (verifyHash(req, socket)) {
                logger.debug("Request verified");
                return true;
            }
        }
    }
    logger.error("Request verification failed");
    socket.emit("error", { message: "Request invalid" });
    return false;
}

/**
 * Verifies a hash.
 * @param {Object} req - The request containing the hash.
 * @param {Object} socket - The socket of the user.
 * @returns {boolean} True if the hash is verified, false otherwise.
 */
function verifyHash(socket) {
    //Decrypt hash in req using the public key of the user
    if (!socket.userPk) {
        logger.error("User public key not found");
        return false;
    }

    //Check how to decrypt in viewer client
    const decryptedHash = RSAHelper.decrypt(req.hash, socket.userPk);
    const hash = sha512(`${req.username}-${req.userId}-${req.timestamp}-${req.content}`);

    if (decryptedHash === hash) {
        logger.debug("Hash verified");
        return true;
    } else {
        logger.warn("Hash verification failed");
        return false;
    }
}

module.exports = { connectToDB, saveStream, getUser };