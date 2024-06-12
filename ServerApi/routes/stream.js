const express = require('express');
const { ObjectId } = require('mongodb');

const router = express.Router();

router.get('/:id', async (req, res) => {
    try{
        const stream = await req.db.collection("Stream").findOne({ _id: new ObjectId(req.params.id) });
        res.json(stream)
    } catch(e){
        res.status(500).json({ error: e.toString() });
    }
})

router.post('/', async (req, res) => {
    const {StreamId, Title, StartTime, EndTime, StreamerId, StreamThumbnail} = req.body;
    if(!StreamId | !Title | !StartTime | !EndTime | !StreamerId | !StreamThumbnail){
        res.status(400).json({error : "Fault in the body"});
    }
    const stream = req.body;
    try{
        const response = await req.db.collection("Stream").insertOne(stream);
        res.json(response)
    }catch(e){
        res.status(500).json({ error: e.toString()})
    }


})

router.put('/:id', async (req, res) => {
    const {StreamId, Title, StartTime, EndTime, StreamerId, StreamThumbnail} = req.body;
    if(!StreamId | !Title | !StartTime | !EndTime | !StreamerId | !StreamThumbnail){
        res.status(400).json({error : "Fault in the body"});
    }
    const stream = req.body;
    try{
        const response = await req.db.collection("Stream").updateOne({ _id: new ObjectId(req.params.id) }, { $set: stream});
        res.json(response)
    }catch(e){
        res.status(500).json({ error: e.toString()})
    }
})

module.exports = router;