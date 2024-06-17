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

//Connect to Database
db.connectToDB();

io.on("connection", (socket) => {
  // Get token and verify


  // Change to userId from token
  // Add check -> verifyRequest(), if not verified he cannot stream/watch
  db.getUser(129819);

  console.log(`connect ${socket.id}`);

  //Receiving data from streamer
  socket.on("stream", async (streamObject) => {
    const userId = streamObject.userId;

    //Check if streamObject contains userId
    if (!userId) {
      console.error('Received stream object without userId:', streamObject);
      return;
    }

    //Save stream to database
    db.saveStream(streamObject);

    //Keep track of if user is a streamer
    map.set(socket.id, [streamObject.userId, "Streamer"]);

    //Check if user has a stream array, if not; create it. (caching)
    if (!streams[userId]) {
      streams[userId] = [];
    }

    streams[userId].push(streamObject);
    io.in(userId).emit("stream", streamObject);
  });

  // Joining a room
  socket.on('joinRoom', (RoomId) => {
    socket.join(RoomId);
    console.log(socket.id + " Joined room: " + RoomId);

    //Keep track of if user is a viewer
    map.set(socket.id, [RoomId, "Viewer"]);

    // Send all previously saved streams to the viewer
    if (streams[RoomId]) {
      console.log("Getting array", streams[RoomId]);
      streams[RoomId].forEach((streamObject) => {
        socket.emit('stream', streamObject);
      });
    }
  });


  // Disconnecting
  socket.on("disconnect", () => {
    //Check if the user is a streamer, if so; delete streams from cache
    const user = map.get(socket.id);
    if (user && user[1] === "Streamer") {
      const roomId = user[0];
      if (streams[roomId]) {
        delete streams[roomId];
      }
    } else { }
  });
});

console.log("Server started at ws://localhost:3000/");