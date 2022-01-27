const express = require('express');
const http = require('http');
const socket = require('socket.io')
const app = express()
const server = http.createServer(app);

app.use(express.static("public"))

const io = socket(server)


let users = [];
let color = ['red', 'blue' , 'yellow' , 'green' , 'black' , 'brown' , 'orange'];
let maxPlayers = 7;
let mapSize = 20;

let gameMap =[];
let usersMap = [];
let gameStats=[];


let players = [];


let xOcc = [];
let yOcc = [];

function generatePosition(){
  let min =0;
  let max = mapSize-1;
  let x = Math.floor(Math.random() * (max - min + 1) + min);
  let y = Math.floor(Math.random() * (max - min + 1) + min);
  while(xOcc.includes(x)){
    x = Math.floor(Math.random() * (max - min + 1) + min);
  }
  xOcc.push(x);
  while(yOcc.includes(y)){
    y = Math.floor(Math.random() * (max - min + 1) + min);
  }
  yOcc.push(y);

  return([x,y]);
}



function updatePlayerMap(){
  for(let i=0; i<mapSize ; i++){
    for(let j=0; j<mapSize ; j++){
      for(let k=0 ;k<usersMap.length ; k++){
        if(usersMap[k].id != gameMap[i][j].owned){
          usersMap[k].map[i][j].color = gameMap[i][j].color;
        }
        else{
          usersMap[k].map[i][j] = gameMap[i][j];
        }
      }
    }
  }
}



io.on('connection' , socket =>{


  socket.on('joinRoom' , (data)=>{
    let user = { id : socket.id , username : data.username}
    users.push(user)
    io.to(user.id).emit('mapSize',mapSize)
    io.to(user.id).emit('setId',user.id)
    console.log(users);
  })



  socket.on('startGame', ()=>{
    for(let i=0; i<mapSize ;i++){
      gameMap.push([]);
      for(let j=0; j<mapSize ; j++){
        gameMap[i].push({
          owned : "",
          troops : "",
          goldMine : false,
          tower : false,
          fortification : false,
          color : "",
        })
      }
    }
    for(let i=0; i<Math.min(maxPlayers , users.length) ; i++){
      let user = users[i];
      let position = generatePosition();
      console.log(position);
      let userGameData ={
        id : user.id,
        map : []

      }

      players.push({
        id : user.id,
        username : user.username,
        color : color[i]
      })
      for(let k=0; k<mapSize ;k++){
        userGameData.map.push([]);
        for(let j=0; j<mapSize ; j++){
          userGameData.map[k].push({
            owned : "",
            troops : "",
            goldMine : false,
            tower : false,
            fortification : false,
            color : "",
          })
        }
      }

      userGameData.map[position[0]][position[1]] ={
        owned : user.id,
        troops : 500,
        goldMine : true,
        tower : true,
        fortification : true,
        color : color[i],
      }

      gameMap[position[0]][position[1]] ={
        owned : user.id,
        troops : 500,
        goldMine : true,
        tower : true,
        fortification : true,
        color : color[i],
      }

      let stats = {
        id : user.id,
        goldMine : 1,
        territory : 1,
        energy : 5,
        gold : 200
      }

      gameStats.push(stats);
      usersMap.push(userGameData);
    }

    updatePlayerMap();
    for(let i=0; i<Math.min(maxPlayers , usersMap.length);i++){
      let payload = {
        map : [],
        stats : gameStats[i]
      }
      let id = gameStats[i].id;
      usersMap.forEach((user, i) => {
        if(user.id == id){
          payload.map = user.map
        }
      });

      io.to(id).emit('gameData' , payload);
    }
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
