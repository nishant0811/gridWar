const express = require('express');
const http = require('http');
const socket = require('socket.io')
const app = express()
const server = http.createServer(app);

app.use(express.static("public"))

const io = socket(server)


let users = []

let mapSize = 20;

io.on('connection' , socket =>{
  socket.on('joinRoom' , (data)=>{
    let user = { id : socket.id , username : data.username}
    users.push(user)
    io.to(user.id).emit('mapSize',mapSize)
    io.to(user.id).emit('setId',user.id)
    console.log(users);
  })

  socket.on('disconnect', () =>{
    let playerDisconnected = socket.id

    for(let i =0; i<users.length ; i++ ){
      if(playerDisconnected == users[i].id){
        console.log(users[i].username  + " Disconnected");
        users.splice(i,1)
        console.log(users);
      }

    }
  })
})



app.get("/users" , (req,res)=>{
  res.json(users)
})

server.listen(3000,()=>{
  console.log("Server Up on port 3000");
})
