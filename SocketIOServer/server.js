const { Server } = require("socket.io");
const { MongoClient, Binary } = require('mongodb');
const fs = require("fs");
const path = require("path");
const { Stream } = require("stream");
const db = require('../Helpers/database.js');
const streams = {};
const map = new Map();

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});




db.connectToDB();
// Je moet ervoor zorgen dat alleen streamers iets kunnen sturen.

io.on("connection", (socket) => {
  //Check if user is valid
  //const token = socket.handshake.headers.authorization;

  // jwt.verify token
  // map (socketId, [verified token userId, "viewer"])   //when user starts streaming, change the unknown to streamer

  console.log(`connect ${socket.id}`);

  //Receiving data from streamer
  socket.on("stream", async (streamObject) => {
    const userId = streamObject.userId;

    //Check if streamObject contains userId
    if (!userId) {
      console.error('Received stream object without userId:', streamObject);
      return;
    }


    db.saveStream(streamObject);


    //Map.push (socketId), [(roomId), (userRole)]
    map.set(socket.id, [streamObject.userId, "Streamer"]);

    //Check if user has a stream array, if not; create it.
    if (!streams[userId]) {
      console.log("reached")
      streams[userId] = [];

      console.log("Created room with id: " + userId);
    }

    streams[userId].push(streamObject);
    //How to continue streaming to the room?
    io.in(userId).emit("stream", streamObject);
    // io.emit("stream", streamObject);
  });

  // Joining a room
  socket.on('joinRoom', (RoomId) => {
    socket.join(RoomId);
    console.log(socket.id + " Joined room: " + RoomId);

    //Map socket id to room id
    map.set(socket.id, [RoomId, "Viewer"]);
    // console.log(`User ${socket.id} joined room ${RoomId}`);

    // Send all previously saved streams to the new client
    if (streams[RoomId]) {
      console.log("Getting array", streams[RoomId]);
      streams[RoomId].forEach((streamObject) => {
        socket.emit('stream', streamObject);
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);

    //Checks if the socket is a streamer and deletes the stream if it is.
    const user = map.get(socket.id);
    if (user && user[1] === "Streamer") {
      const roomId = user[0];
      if (streams[roomId]) {
        delete streams[roomId];
        console.log("Stream Deleted");
      }
    } else {
      console.log("User not added")
    }
  });
});

console.log("Server started at ws://localhost:3000/");