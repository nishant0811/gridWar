const express = require('express');
const http = require('http');
const socket = require('socket.io')
const app = express()
const server = http.createServer(app);

app.use(express.static("public"))

const io = socket(server)


let users = []


io.on('connection' , socket =>{
  socket.on('joinRoom' , (data)=>{
    let user = { id : socket.id , username : data.username}
    users.push(user)
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

server.listen(3000,()=>{
  console.log("Server Up on port 3000");
})
