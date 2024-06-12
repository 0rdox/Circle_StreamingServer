const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Get a single User
router.get('/:id', async (req, res) => {
    try {
        const user = await req.db.collection('User').findOne({ _id: new ObjectId(req.params.id) });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Get public key from oneUser
router.get('/:id/publicKey', async (req, res) => {
    try {
        const user = await req.db.collection('User').findOne({ _id: ObjectId(req.params.id) });
        res.json(user.PublicKey);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Insert a new User
router.post('/', async (req, res) => {
    try {
        const user = req.body;
        const result = await req.db.collection('User').insertOne(user);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;
