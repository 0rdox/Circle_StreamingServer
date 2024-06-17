// import { io } from "socket.io-client";

// export const socket = io("ws://localhost:8080/", {});

// socket.on("connect", () => {
//   console.log(`connect ${socket.id}`);
// });

// socket.on("disconnect", () => {
//   console.log(`disconnect`);
// });

const { io } = require("socket.io-client");

const socket = io("ws://localhost:8080/", {});

socket.on("connect", () => {
  console.log(`connect ${socket.id}`);
});

socket.on("disconnect", () => {
  console.log(`disconnect`);
});

module.exports = socket; // Export if needed
