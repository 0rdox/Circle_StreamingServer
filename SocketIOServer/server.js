const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../' + ".env") });
const { Server } = require("socket.io");
const { Stream } = require("stream");
// const { Mongoose } = require("mongoose");
const streams = {};
const map = new Map();

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

console.log(path.join(__dirname, '../' + ".env"));
//Only streamers can send something

io.on("connection", (socket) => {

  //Get token out of handshake.auth.token or headers.authorization --> depends on client very easy
  let token = socket.handshake.auth.token;
  console.log("Token: " + token);
  // Check for token
  if (socket.handshake.headers.authorization) {
    const token = socket.handshake.headers.authorization;
  } else {
    console.error("No token provided");
    return;
  }

  // Verify the token
  // place secret in env
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Invalid token:", err);
      return;
    }

    //Verify token with API
    // fetch("http://localhost:5000/api/verifyToken", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ token }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.error) {
    //       console.error("Invalid token:", data.error);
    //       return;
    //     }


    // Get the user ID from the decoded token
    //   const userId = decoded.userId;
    //   Map the socket ID to the user ID and set the user role as "viewer"
    map.set(socket.id, [userId, "viewer"]);


    console.log(`connect ${socket.id}`);

    //Receiving data from streamer
    socket.on("stream", (streamObject) => {
      const userId = streamObject.userId;

      //Check if streamObject contains userId
      if (!userId) {
        console.error('Received stream object without userId:', streamObject);
        return;
      }

      //Map.push (socketId), [(roomId), (userRole)]
      map.set(socket.id, [streamObject.userId, "Streamer"]);

      //Check if user has a stream array, if not; create it.
      if (!streams[userId]) {
        console.log("reached")
        streams[userId] = [];

        console.log("Created room with id: " + userId);
      }

      //Save stream to database (what does the database expect?)
      saveToDatabase(streamObject);

      console.log("Getting Stream: " + streamObject.sequenceId);
      streams[userId].push(streamObject);
      //How to continue streaming to the room?
      io.in(userId).emit("stream", streamObject);
      // io.emit("stream", streamObject);
    });

    // Joining a room
    socket.on('joinRoom', (RoomId) => {
      socket.join(RoomId);

      //Map socket id to room id
      map.set(socket.id, [RoomId, "Viewer"]);

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


  function saveToDatabase(streamObject) {
    // Save the stream to the database
    console.log("Saving to database:", streamObject);

  }


  // {
  //   data: ,
  //     hash: ,
  //   userId:
  // }
});
console.log("Server started at ws://localhost:3000/");
console.log("Secret Key " + process.env.SECRET_KEY);