const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../' + ".env") });
const { Server } = require("socket.io");
const { Stream } = require("stream");
const jwt = require('jsonwebtoken');
const db = require('../Helpers/database.js');
const map = new Map();
const streams = {};

const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

db.connectToDB();

//-----------------------------------Middleware-----------------------------------\\
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
    socket._id = decoded.UserId;
  });

  await db.getUser(socket._id).then((user) => {
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    console.log("USER:", user);
    socket._id = user._id.toString(); //Or user._id? what does user db look like   
    socket.userPk = user.PublicKey;
    socket.userName = user.UserName;
    //Does db have a IDs streaming? then the map is not necessary

  });

  next();
});

//-----------------------------------Connection-----------------------------------\\
io.on("connection", (socket) => {
  console.log(`connect ${socket.userName}, ${socket.id}`);

  //-----------------------------------Receiving Stream-----------------------------------\\
  socket.on("stream", async (streamObject) => {
    const userId = streamObject.userId;

    //Check if the request is valid
    if (!db.verifyRequest(socket, streamObject)) {
      return;
    }

    if (!userId) {
      console.error('Received stream object without userId:', streamObject);
      return;
    }

    db.saveStream(streamObject);

    //Keep track of if user is a streamer
    map.set(socket.id, [streamObject.userId, "Streamer"]);

    //Check if user has a stream array, if not; create it. (caching)
    if (!streams[userId]) {
      db.activateStream(userId);
      streams[userId] = [];
    }

    streams[userId].push(streamObject);
    io.in(userId).emit("stream", streamObject);
  });

  //-----------------------------------Joining a Room-----------------------------------\\
  socket.on('joinRoom', (RoomId) => {
    socket.join(RoomId);
    console.log(socket.Username + " Joined room: " + RoomId);

    //Keep track of if user is a viewer
    map.set(socket.id, [RoomId, "Viewer"]);


    if (streams[RoomId]) {
      streams[RoomId].forEach((streamObject) => {
        io.in(RoomId).emit('stream', streamObject);
      });
    }
  });


  //-----------------------------------Disconnecting-----------------------------------\\
  socket.on("disconnect", () => {
    //Check if the user is a streamer, if so; delete streams from cache and deactive isStreaming
    const user = map.get(socket.id);
    if (user && user[1] === "Streamer") {
      const roomId = user[0];
      if (streams[roomId]) {
        db.deactivateStream(roomId);
        delete streams[roomId];
      }
    }
  });
});

console.log("Server started at ws://localhost:3000/");