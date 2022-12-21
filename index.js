// const server = require('./server')
const cluster = require('cluster');
const cCPUs = require('os').cpus().length;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const channelRoutes = require("./routes/channels");
const Channel = require("./models/channelModel");
const User = require("./models/userModel");
const app = express();
const socket = require("socket.io");
require("dotenv").config();
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const bodyParser = require('body-parser');

// SWITCH MONGODB URL
let server
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    //console.log(err.message);
  });
  if (process.env.NODE_ENV === 'development') {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  }
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.errorHandler());
  }

  if (cluster.isMaster) {
    // Create a worker for each CPU
    for (let i = 0; i < cCPUs; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online.');
    });
    cluster.on('exit', function (worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died.');
    });
} else {
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    app.use(cors());
    app.use(express.json());
    app.get("/test", (_req, res) =>  {
      res.status(200).send("Test Hello world Fajar")
    })
    app.use("/api/auth", authRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/channels", channelRoutes);
    
    server = app.listen(process.env.PORT, () =>
      console.log(`Server started on ${process.env.PORT}`)
    );
    
}

const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
    maxHttpBufferSize: 1e8 // 100 MB
  });
  var clients = 0;
  io.use(async (socket, next) => {
    
    const userID = socket.handshake.auth.userID;
    const sessionID = socket.handshake.auth.sessionID;
    const username = socket.handshake.auth.username;
    const email = socket.handshake.auth.email;
    const avatarImage = socket.handshake.auth.avatarImage;
  
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.sessionID = randomId();
    socket.userID = userID;
    socket.username = username;
    socket.email = email;
    socket.avatarImage = avatarImage;
    next();
  });
  
  io.on("connection", (socket) => {
    clients++;
    socket.emit("user count",clients)
    socket.emit("joinChat", {
      sessionID: socket.sessionID,
      userID: socket.userID,
      username:socket.username,
      email: socket.email,
      avatarImage:socket.avatarImage
    });
    socket.on("upload", (file, callback) => {
      // save the content to the disk, for example
      writeFile("/tmp/upload", file, (err) => {
        callback({ message: err ? "failure" : "success" });
      });
    });
    socket.on("new friend", () => {
      socket.emit("user count",clients)
      socket.broadcast.emit("new friend",true);
    });
    socket.on("new friend channel", () => {
      socket.emit("user count",clients)
      socket.broadcast.emit("new friend channel",true);
    });
    socket.on("read message", (data) => {
      socket.broadcast.emit("read-sender",data);
    });
    socket.broadcast.emit("info_join_user", {
      sessionID: socket.sessionID,
      userID: socket.userID,
      username:socket.username,
      email: socket.email,
      avatarImage:socket.avatarImage
    });
    socket.join(socket.userID);
    
    socket.on('disconnect', () => {
      clients--;
      socket.broadcast.emit("user_disconnected", socket.userID);
    });
    socket.on("send-msg", ({ id, from, to, message, image, createdAt, senderName,senderPicture,toType}) => {
      console.log("KIRIM PESAN ",to)
      socket.to(to).emit("msg-recieved", { id, from, to, message, image, createdAt, senderName,senderPicture,toType});
    });
    socket.on('isTyping', (data) => {
      socket.broadcast.emit('isTyping',data)
    })
    socket.on('stopTyping', (data) => {
      socket.broadcast.emit('stopTyping', data)
    })
  
    socket.on('room', function(room) {
      console.log("JOINING ROOM",room)
      socket.join(room);
    });
  
  });
  