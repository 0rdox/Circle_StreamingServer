const { Server } = require("socket.io");


const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {


  console.log(`connect ${socket.id}`);

  socket.on("stream", (streamObject) => {
    //Create room 
    console.log("Started room: " + streamObject.userId)
    // const userId = streamObject.userId;
    // io.emit("stream", streamObject);

    io.emit("stream", streamObject);


    //Dont use to, because it will only send to the user that is connected to the server instead of all users connected to the room
    // io.in(userId).emit("stream", streamObject);
  });

  socket.on("disconnect", () => {
    console.log(`disconnect ${socket.id}`);
  });
});

console.log("Server started at ws://localhost:3000/");

// {
//   data: ,
//     hash: ,
//   userId:
// }