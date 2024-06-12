const express = require('express')
const router = express.Router()
const db = require('../dbConnection/dbConncetion')

router.get('/:_id', async (req, res) => {
    try {
        const user = await db.collection('User').findOne({ _id: ObjectId(req.params.id) });
        res.json(user);
        console.log("response", res.json(user));
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
})

module.exports = router;