const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const { Stream } = require("stream");

const streams = {};

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

map = new Map();


io.on("connection", (socket) => {
  console.log(`connect ${socket.id}`);






  //Receiving data from streamer
  socket.on("stream", (streamObject) => {
    const userId = streamObject.userId;

    //Check if streamObject contains userId
    if (!userId) {
      console.error('Received stream object without userId:', streamObject);
      return;
    }


    //Check if user has a stream array, if not; create it.
    if (!streams[userId]) {
      console.log("reached")
      streams[userId] = [];

      console.log("Created room with id: " + userId);
    }


    streams[userId].push(streamObject);
    console.log(streams[userId].length);
    //How to continue streaming to the room?
    io.in(userId).emit('stream', streamObject);
  });

  // Joining a room
  socket.on('joinRoom', (StreamName) => {
    socket.join(StreamName);




    map.push(StreamName, socket.id);


    console.log(`User ${socket.id} joined room ${StreamName}`);

    // Send all previously saved streams to the new client
    if (streams[StreamName]) {

      // console.log("Getting array", streams[userId]);
      streams[StreamName].forEach((streamObject) => {
        socket.emit('stream', streamObject);
      });
    }

  });




  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);



    //If the streamer disconnects, delete the cached stream

    if (streams[roomId]) {
      delete streams[roomId];
    }

  });
});


console.log("Server started at ws://localhost:3000/");

// {
//   data: ,
//     hash: ,
//   userId:
// }