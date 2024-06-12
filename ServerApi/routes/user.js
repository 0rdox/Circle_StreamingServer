const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Get a single User  // Works
router.get('/:id', async (req, res) => {
    try {
        const user = await req.db.collection('User').findOne({ _id: new ObjectId(req.params.id) });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Get public key from oneUser by email
// Only working by putting email in url. Example: http://localhost:6000/user/publicKey/Bas@gmail.com

router.get('/publicKey/:email', async (req, res) => {
    try {
        const user = await req.db.collection('User').findOne({ Email: req.params.email });
        if (user) {
            res.json(user.PublicKey);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});



// Insert a new User    // works
router.post('/', async (req, res) => {
    try {
        const { UserId, UserName, Email, Password, DateBirth, PublicKey } = req.body;

        if (!UserId || !UserName || !Email || !Password || !DateBirth || !PublicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = req.body;
        const result = await req.db.collection('User').insertOne(user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});


// Update a User    // works
router.put('/:id', async (req, res) => {
    try {
        const { UserId, UserName, Email, Password, DateBirth, PublicKey } = req.body;

        if (!UserId || !UserName || !Email || !Password || !DateBirth || !PublicKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = req.body;
        const result = await req.db.collection('User').updateOne({ _id: new ObjectId(req.params.id) }, { $set: user });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;
