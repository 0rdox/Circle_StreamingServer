const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../' + ".env") });
const { Server } = require("socket.io");
const { Stream } = require("stream");
// const { Mongoose } = require("mongoose");
const streams = {};
const map = new Map();
const db = require('../Helpers/database.js');

const jwt = require('jsonwebtoken');

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//Connect to Database
db.connectToDB();

/**
 * Middleware to verify the token of the user connecting to the socket and get the needed user's data.
 */
io.use(async (socket, next) => {
  let token = socket.handshake.auth.token;

  if (token) {
    token = token.split(" ")[1];
  } else if (!token) {
    return next(new Error("Unauthorized"));
  }

  jwt.verify(token, process.env.SECRET_KEY, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      return;
    }
    console.log("Token successfully verified");
    socket.userId = decoded.id;
    console.log("User ID: ", socket.userId)
  });

  await db.getUser(socket.userId).then((user) => {
    console.log("User: ", user);
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    console.log("USER:" + user);
    socket.username = user.UserName;
    socket.userId = user._id.toString();
    console.log("Username: " + socket.username);
    console.log("id: " + socket.userId);
    socket.userPk = user.PublicKey;

    console.log("PK: " + socket.userPk);
  });

  next();
});

io.on("connection", (socket) => {
  // When to use verifyUser?

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