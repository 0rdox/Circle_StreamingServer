const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

// Get a single Chat message  // Works
router.get('/:id', async (req, res) => {
    try {
        const chat = await req.db.collection('Chat').findOne({ _id: new ObjectId(req.params.id) });
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

// Insert a new Chat message
router.post('/', async (req, res) => {
    try {
        const chat = req.body;
        chat.Timestamp = new Date();
        const result = await req.db.collection('Chat').insertOne(chat);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;
