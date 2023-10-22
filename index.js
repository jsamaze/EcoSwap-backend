//Don't forget to add cron job during deployment


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
import http from 'http'

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

import populateBusStop from './helper/busStop/populateBusStop.js';

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
import deleteFailChat from './routes/Chat/Entire Chat/deleteFailChat.js';
import deleteSuccessChat from './routes/Chat/Entire Chat/deleteSuccessChat.js';

//for the socket 
import retrieveChat from './helper/chat/retrieveChat.js';
import checkItemOwnership from './helper/checkItemOwnership.js';
import { ChatModel,ItemChatModel } from './model/index.js';

//for bus stop
import {BusStopModel} from './model/index.js'
import fetchNearbyBusStops from './helper/busStop/fetchNearbyBusStops.js';
import findNearbyUsers from './routes/BusStop/findNearbyUsers.js';
import findNearbyListingReccomendations from './routes/BusStop/findNearbyListingReccomendations.js';
import fetchIncompleteChatReviews from './routes/ChatReview/fetchIncompleteChatReviews.js';
import editIncompleteChatReviews from './routes/ChatReview/editIncompleteChatReviews.js';
import CreatePointReward from './routes/PointReward/CreatePointReward.js';
import fetchAvailableRewards from './routes/Reward/fetchAvailableRewards.js';
import redeemReward from './routes/Reward/redeemReward.js';
import fetchTransactions from './routes/Reward/fetchTransactions.js';
import createItemLike from './routes/ItemLike/createItemLike.js';
import deleteItemLike from './routes/ItemLike/deleteItemLike.js';
import fetchUserLikes from './routes/ItemLike/fetchUserLikes.js';
// import findNearbyListing from './routes/BusStop/findNearbyListing.js';

// access the cert
const key = fs.readFileSync('./HTTPS/key.pem'); //LOCAL
const cert = fs.readFileSync('./HTTPS/cert.pem'); //LOCAL

//create the app
const app = express();

const server = https.createServer({key: key, cert: cert }, app); //LOCAL
// const server = http.createServer(app)  //HEROKU

//integrate socket.io
export const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL,  /\.herokuapp\.com$/, /\.ecoswap\.space$/ ],
    credentials:true,
      
  }, connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
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
  
app.enable('trust proxy');
var sessionMiddleware= session({
  secret: process.env.SECRET_SESSION,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    // exposedHeaders: ['set-cookie']
    // domain: process.env.DOMAIN, //To enable after full deployment
    sameSite:'none',
    domain : "localhost", // enable for final deployment
    secure :true,
    proxy : true,
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
  origin: [  /\.herokuapp\.com$/,"http://www.ecoswap.space", 'http://localhost:5173','http://localhost:5174'], // must be same as frontend
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
server.listen( process.env.PORT || 1234,() => {
    console.log(`Listening at localhost:${process.env.PORT || 1234}`)
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
app.get('/user/generateOTP',async (req,res)=>{ 
  if (!( req.session.username ?? req.query.username)){
    res.status(400).send({
      status : "Not logged in and not passed in the username in query"
    })
  } 
  try {
    await generateOTP(req.session.username ?? req.query.username )
  } catch (e){ 
    res.status(500).send({
      status:"Failure",
      problem : e.message
    }) 
    return;
  }
  res.send({
    status:"Success - check your email"
  })
})
app.post('/user/confirmPassword',ConfirmPassword)
app.post("/user/confirmEmail",ConfirmEmail)

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
// find nearest bus stops
app.get("/busStop/radius",async (req,res)=>{
  try {
    var result = await fetchNearbyBusStops(req.query.latitude,req.query.longitude,req.query.radiusInKm)
    res.send(result)
  } catch (e){
    res.status(500).send(req.params)
  }
}) //latitude longitude radiusInKm
// find users near you OR a specified location
app.get("/busStop/nearbyUsers",findNearbyUsers) //radiusInKm must be specified
app.get("/busStop/nearbyListingsRecommended",NeedAuthenticate,findNearbyListingReccomendations)

// G. Chat API

// known issue - if too fast clicking the checkmark, will cause an error

app.get("/chat/user/:username",NeedAuthenticate,fetchOneChat) //one chats //tested
app.get("/chat",NeedAuthenticate,fetchChats) //recent chats
app.post("/chat/user/:username",NeedAuthenticate, createChat)  //put item in body // tested
app.patch("/chat/user/:username",NeedAuthenticate,deleteSuccessChat)

//think again
app.delete("/chat/user/:username",NeedAuthenticate,deleteFailChat)

////for socket
// app.post("/chat/user/:username/message",NeedAuthenticate,addMessage) //put textContent in body
// app.post("/chat/user/:username/item",NeedAuthenticate,addItem)
// app.delete("/chat/user/:username/item",NeedAuthenticate,removeItem)


// H. chat reviews
app.get("/chatReview",NeedAuthenticate,fetchIncompleteChatReviews)
app.post("/chatReview",NeedAuthenticate,editIncompleteChatReviews)
// need reviewId and textContent and Rating (max 5)

// I. reward
app.get("/reward",fetchAvailableRewards)
app.post("/reward/:rewardName",NeedAuthenticate,redeemReward)
app.get("/reward/transactions",NeedAuthenticate, fetchTransactions)

//for adding data temporarily
// app.post("/reward",CreatePointReward)

// J. likes

app.post("/item/like/:itemId",NeedAuthenticate,createItemLike)
app.delete("/item/like/:itemId",NeedAuthenticate,deleteItemLike)
app.get("/items/liked",NeedAuthenticate,fetchUserLikes)


//when the server is ended using CTRL+C
const cleanup = (event) => { // SIGINT is sent for example when you Ctrl+C a running process from the command line.
  mongoose.connection.close(); // Close MongodDB Connection when Process ends
  process.exit(); // Exit with default success-code '0'.
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

//Below are the socket code

io.on('connection', (socket) => {

  const username = socket.request.session.username
  if (username){
    console.log(`${username} connected`);
    socket.join(username)
  
    socket.on("sendMessage",async (message,ack) => {
      try {
          var chat = await retrieveChat(username,message.to)
          var chatDoc = await ChatModel.findById(chat._id)
          if (chat){
              chatDoc.messages.push({
                  sender : chat.seller.username == username ? "seller" : "buyer",
                  textContent: message.textContent
              })
              await chatDoc.save();
              ack ({
                  code : 200,
                  status : "success"
              })
              socket.to(message.to).emit("message",{
                sender : username,
                textContent : message.textContent,
                createdAt : chatDoc.messages[chatDoc.messages.length-1].createdAt
            })
  
          } else { 
              throw new Error ("Chat does not exist")
          }
            
      } catch (e){
          console.log(e);
          ack ({
              code : 500,
              status : "failed",
              problem : e.message
          })
      } 
  })

    socket.on("updateItemChat",async (to,items,ack) => {
      console.log(to,username,items)

      const dest = to;
      try {
          var chat = await retrieveChat(to,username)
          var chatDoc = await ChatModel.findById(chat._id)

        
          if (chat){
              var userItems = await ItemChatModel.find({chat : chat._id, user: socket.request.session.user_id})
              console.log(userItems)
              var itemIdInList = userItems.map((e)=> e.item.toString());
              console.log(itemIdInList)

              for (var itemId of items){

                  if (!itemIdInList.includes(itemId)){
                      var itemDoc = await checkItemOwnership(username,itemId)
                      if (itemDoc.itemType != "Listed"){
                          throw new Error("Item is not listed (it is wishlist)")
                      }
                      var itemChat = new ItemChatModel({
                          item: itemId,
                          chat: chat._id,
                          user: socket.request.session.user_id
                      })
                      await itemChat.save()
                    } 
              }
              for (var itemId of itemIdInList){
                if (!items.includes(itemId)){
                  await ItemChatModel.deleteOne({
                    item :itemId,
                    chat : chat._id
                  })
                }
              }
              socket.to(dest).emit("itemchat",username,items)

              ack({
                  code :200,
                  status : "Success"
              })

          } else { 
              throw new Error ("Chat does not exist")
          }
            
      } catch (e){
          console.log(e);
          ack({
              code :500,
              status : "failed to create chat",
              problem : e.message
          });
      }
  })
  
    socket.on("disconnect", () => {
      socket.leave(username)
      console.log(`${username} disconnected`);
      })
  } else {
    console.log("bad socket")
  }


});
