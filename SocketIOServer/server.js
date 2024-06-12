const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
const { Stream } = require("stream");

const streams = {};
const map = new Map();

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});



io.on("connection", (socket) => {
  // const token = socket.handshake.headers.authorization;

  //Check if token is valid
  // jwt.verify token
  // map (socketId, [verified token userId, "viewer"])   //when user starts streaming, change the unknown to streamer

  console.log(`connect ${socket.id}`);

  //Receiving data from streamer
  socket.on("stream", (streamObject) => {
    const userId = streamObject.userId;

    console.log("Received stream object:", streamObject);
    //Check if streamObject contains userId
    if (!userId) {
      console.error('Received stream object without userId:', streamObject);
      return;
    }

    //map socket id to user id (maybe use socket.id + role?)
    //map with 3 parameters ? (socket + userId is the same in streamer and viewer because the roomcode is user id of the streamer. if you do [userId (roomcode)] and [socket.id + role (viewer/streamer)]
    // you can check in onDisconnect for the socket.id, if socketId is a streamer, you can check the userId associated with the socketId and delete the stream.
    //I can also have 2 maps, one for the socketId and one for the userId. I can check if the socketId is a streamer or viewer and then check the userId associated with the socketId and delete the stream.

    //Map.push (socketId), [(roomId), (userRole)]
    map.set(socket.id, [streamObject.userId, "Streamer"]);



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
  socket.on('joinRoom', (RoomId) => {
    socket.join(RoomId);
    // console.log(socket.id + " Joined room: " + RoomId);

    //Map socket id to room id
    map.set(socket.id, [RoomId, "Viewer"]);
    // console.log(`User ${socket.id} joined room ${RoomId}`);

    // Send all previously saved streams to the new client
    if (streams[RoomId]) {
      // console.log("Getting array", streams[userId]);
      streams[RoomId].forEach((streamObject) => {
        socket.emit('stream', streamObject);
      });
    }

  });



  socket.on("stopStream", (streamObject) => {
    if (streams[roomId]) {
      delete streams[roomId];
    }
  })


  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);

    //Uit socket header de user krijgen


    //check socketId with userId
    // check userId with existing streams

    // if stream exist delete stream

    //If the streamer disconnects, delete the cached stream


    console.log(map.get(socket.id));


    // if (streams[roomId]) {
    //   delete streams[roomId];
    // }

  });
});


console.log("Server started at ws://localhost:3000/");

// {
//   data: ,
//     hash: ,
//   userId:
// }