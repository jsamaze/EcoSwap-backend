//import important dependencies
import express from 'express'
import session from 'express-session';
import https from 'https';
import connect_mongodb_session from 'connect-mongodb-session';
import 'dotenv/config';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

//import router function
import Register from "./routes/User/Register.js"
import Logout from "./routes/User/Logout.js";
import Login from "./routes/User/Login.js";

import NeedAuthenticate from "./custom_middleware/NeedAuth.js";
import AlreadyAuthenticate from './custom_middleware/AlwaysAuth.js';

import insertUserPhoto from './routes/UserPhoto/insertUserPhoto.js';

import generateOTP from './helper/generateOTP.js';
import ConfirmEmail from './routes/User/ConfirmEmail.js';
import ConfirmPassword from './routes/User/ConfirmPassword.js';
import FetchUser from './routes/User/FetchUser.js';
import UpdateUser from './routes/User/UpdateUser.js';

import populateBusStop from './helper/populateBusStop.js';

import CreateItem from './routes/Item/CreateItem.js';
import ReadItem from './routes/Item/ReadItem.js';
import DeleteItem from './routes/Item/DeleteItem.js';
import UpdateItem from './routes/Item/UpdateItem.js';
import InsertItemPhoto from './routes/ItemPhoto/InsertItemPhoto.js';
import DeleteItemPhoto from './routes/ItemPhoto/DeleteItemPhoto.js';
import fetchOneChat from './routes/Chat/Entire Chat/fetchOneChat.js';
import fetchChats from './routes/Chat/Entire Chat/fetchChats.js';
import addMessage from './routes/Chat/Message/addMessage.js';
import addItem from './routes/Chat/Items/addItem.js';
import removeItem from './routes/Chat/Items/removeItem.js';
import createChat from './routes/Chat/Entire Chat/createChat.js';
import SearchItems from './routes/Items/SearchItems.js';
import PopularItems from './routes/Items/PopularItems.js';

// access the cert
const key = fs.readFileSync('./HTTPS/key.pem');
const cert = fs.readFileSync('./HTTPS/cert.pem');

//create the app
const app = express();
const server = https.createServer({key: key, cert: cert }, app);

//integrate socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials:true
  }});

//configure sessions
var MongoDBStore = connect_mongodb_session(session);

var store = new MongoDBStore({
    uri: process.env.MONGODB_CONNECTION,
    collection: 'mySessions'
  });
  
store.on('error', function(error) {
  console.log(error);
});
  
var sessionMiddleware= session({
  secret: process.env.SECRET_SESSION,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    // exposedHeaders: ['set-cookie']
    domain:`localhost`,
    sameSite:'none',
    secure:true,
  },
  store: store,
  resave: false,
  saveUninitialized: false,
  unset:"destroy",
})
app.use(sessionMiddleware);

//let socket use session
io.engine.use(sessionMiddleware);

// configure middleware
app.use(express.json());
app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL, // must be same as frontend
  exposedHeaders: ['set-cookie']
}));

//configure multer - to store files
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  }, 
});

// configure mongoose
async function main() {
  await mongoose.connect(process.env.MONGODB_CONNECTION);
}
main().catch(err => console.log(err));
mongoose.connection.on("connected", () => {
  console.log("Connected to database");
});
mongoose.connection.on("error", (err) => {
console.log("Database error:" + err);
});

// start the server
server.listen(process.env.PORT,() => {
    console.log(`Listening at localhost:${process.env.PORT}`)
});

// the routes the server have
app.get("/test", (req,res)=>{
  console.log(req.query); //passed as array, received as array
  res.send()
})

//A. User
app.post("/user/register", Register)
app.post("/user/login", AlreadyAuthenticate,Login)
app.get('/user/logout',NeedAuthenticate, Logout)
app.get('/user/generateOTP',(req,res)=>{
  if (!( req.session.username ?? req.query.username)){
    res.status(400).send({
      status : "Not logged in and not passed in the username in query"
    })
  }
  generateOTP(req.session.username ?? req.query.username )
  res.send({
    status:"Success - check your email"
  })
})
app.post('/user/confirmPassword',NeedAuthenticate,ConfirmPassword)
app.post("/user/confirmEmail",NeedAuthenticate,ConfirmEmail)

app.get('/user/:username',FetchUser)
app.patch('/user/',NeedAuthenticate,UpdateUser)

//B. User Photo
app.post("/user/photo", NeedAuthenticate , upload.single("userPhoto"), insertUserPhoto)

//C.  Item - one (CRUD)
app.post("/item",NeedAuthenticate,CreateItem)
app.get("/item/:id",ReadItem)
app.delete("/item/:id",NeedAuthenticate,DeleteItem)
app.patch("/item/:id",NeedAuthenticate,UpdateItem)

//D.  Item Photo (CRUD)
app.post("/item/:id/photo",NeedAuthenticate,upload.single("itemPhoto"),InsertItemPhoto)
app.delete("/item/:id/photo",NeedAuthenticate,DeleteItemPhoto)

//E.  Item - multiple (R)
//search by user, tags
app.get("/items/search/:search?", NeedAuthenticate, SearchItems) // notice the S
app.get("/items/popular", PopularItems)

//F. Map API
//consider populating regularly using cron

// $lookup for leftjoin
// $match for where
// $ in to check in array or not

// $group -> $push  with null id -> array combination for busstop numbers


// given location - find nearest bus stops
// find listings from all nearby bus stops
// perform matching search for each item

// find nearest bus stops
app.get("/busStop/populate",async (req,res)=>{
  try {
    await populateBusStop()
    res.send({
      status:"successful"
    })
  } catch(e){
    res.status(500).send({
      status:"failure",
      problem:e.message
    })
  }
})
app.post("/busStop/radius",async (req,res)=>{
  console.log(req.body)
  var result = await BusStopModel.find({
    loc: {
       $geoWithin: {
          $centerSphere: [
             [ req.body.longitude, req.body.latitude ],
             req.body.radiusInKm / 6378.1
          ]
       }
    }
 } )

 res.send(result)
})

// G. Chat API

// exclude finished chat from belo
//  /user/ -> user recent chats
// https://www.mongodb.com/docs/v6.0/reference/operator/aggregation/last-array-element/
// /user/:userId -> chat history with person (if exists)

app.get("/chat/user/:username",NeedAuthenticate,fetchOneChat) //one chats //tested
app.get("/chat",NeedAuthenticate,fetchChats) //recent chats
app.post("/chat/user/:username",NeedAuthenticate, createChat)  //put item in body // tested

//for socket
app.post("/chat/user/:username/message",NeedAuthenticate,addMessage) //put textContent in body

app.post("/chat/user/:username/item",NeedAuthenticate,addItem)
app.delete("/chat/user/:username/item",NeedAuthenticate,removeItem)

// missing feature - rewards

// Socket.io

// sendMsg event -> receiveMsg event
// tickItem event -> itemTicked event
// done event -> done event

// prioritise emitting before updating mongoDB


//when the server is ended using CTRL+C
const cleanup = (event) => { // SIGINT is sent for example when you Ctrl+C a running process from the command line.
  mongoose.connection.close(); // Close MongodDB Connection when Process ends
  process.exit(); // Exit with default success-code '0'.
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

//Below are the socket code

io.on('connection', (socket) => {
  let username = socket.request.session.username;
  console.log('a user connected');
  console.log(socket.request.session);
  console.log(socket.request.session.username);
  console.log(socket.request.session.user_id);
  console.log('---')

  socket.on("cake",async ()=> {
    console.log(username + " wants cake")
    socket.emit("test") //reply only to the client that sent the request
    generatePrimes(1000000);
    socket.emit("done","cake baked")
  })

  // socket.on("cake",async ()=> {
  //   console.log(username + " wants cake2")
  // })
});

//simulate long database wait

const MAX_PRIME = 1000000;

function isPrime(n) {
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return n > 1;
}

const random = (max) => Math.floor(Math.random() * max);
function generatePrimes(quota) {
  const primes = [];
  while (primes.length < quota) {
    const candidate = random(MAX_PRIME);
    if (isPrime(candidate)) {
      primes.push(candidate);
    }
  }
  return primes;
}

