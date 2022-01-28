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

let actionList = [];
let endTurn = 0, playing = false;

let energyCost = {
  moveCapital : 1,
  goldmine : 1,
  addTroops : 1,
  attack : 1,
  tower : 2,
  fortification : 2
}



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
          usersMap[k].map[i][j] = {
            owned : "",
            troops : "",
            goldMine : false,
            tower : false,
            fortification : false,
            capital : false,
            color : ""
          }
          usersMap[k].map[i][j].color = gameMap[i][j].color;

        }
        else{
          usersMap[k].map[i][j] = gameMap[i][j];
        }
      }
    }
  }
  for(let i=0; i<mapSize ; i++){
    for(let j=0; j<mapSize ; j++){
      for(let k=0 ;k<usersMap.length ; k++){
        if(usersMap[k].id == gameMap[i][j].owned){

          if(usersMap[k].map[i][j].tower){
            for(let aa =-1 ;aa<2 ; aa++){
              for(let bb =-1 ; bb<2 ; bb++){
                try{

                usersMap[k].map[i+aa][j+bb].troops = gameMap[i+aa][j+bb].troops
                usersMap[k].map[i+aa][j+bb].goldMine = gameMap[i+aa][j+bb].goldMine
                usersMap[k].map[i+aa][j+bb].fortification = gameMap[i+aa][j+bb].fortification
                usersMap[k].map[i+aa][j+bb].tower = gameMap[i+aa][j+bb].tower
                usersMap[k].map[i+aa][j+bb].capital = gameMap[i+aa][j+bb].capital
              }
              catch(e){

              }
              }
            }
          }
        }
      }
    }
  }


}



function play(){


  actionList.forEach((action) => {
    try{
    for(let i=0; i<gameStats.length ; i++){
      if(gameStats[i].id == action.id){
        let cords = action.from.split(",");
        let xx = parseInt(cords[0]);
        let yy = parseInt(cords[1]);

        //Add Troops
        if(action.type == 'add'){
          if(gameMap[xx][yy].owned == gameStats[i].id){

            if(gameStats[i].gold >= action.troops && gameStats[i].energy >= energyCost.addTroops){
              gameMap[xx][yy].troops += action.troops;
              gameStats[i].gold -= action.troops;
              gameStats[i].energy -= energyCost.addTroops;
            }
          }
        }


        //Build
        if(action.type == 'build'){
          if(gameMap[xx][yy].owned == gameStats[i].id){
            if(gameStats[i].gold >= 30 && gameStats[i].energy >= energyCost[action.building]){
              switch (action.building) {

                case 'goldmine':
                  gameMap[xx][yy].goldMine = true;
                  gameStats[i].goldMine +=1;
                  break;

                case 'tower':
                    gameMap[xx][yy].tower = true;
                    break;

                case 'fortification':
                  gameMap[xx][yy].fortification = true;
                  break;

              }
            }
          }
        }

        //Attack || Movement of Troops;
        if(action.type == 'attack'){
          if(gameMap[xx][yy].owned == gameStats[i].id && gameStats[i].energy >= energyCost.attack){
            let attackingTroops = Math.min(gameMap[xx][yy].troops , action.troops);

            let fcord = action.to.split(",")
            let axx = parseInt(fcord[0]);
            let ayy = parseInt(fcord[1]);

            if(gameMap[axx][ayy].owned == gameStats[i].id){
              gameMap[xx][yy].troops -= attackingTroops;
              gameMap[axx][ayy].troops += attackingTroops;
              gameStats[i].energy -= energyCost.attack
            }
            else{
              if(axx-xx<=1 && ayy-yy<=1 && axx-xx>=-1 && ayy-yy>=-1){
                gameMap[xx][yy].troops -= attackingTroops;
                if(gameMap[axx][ayy].fortification){
                  attackingTroops = parseInt(attackingTroops*0.75);
                }
                gameStats[i].energy -= energyCost.attack;

                if(attackingTroops > gameMap[axx][ayy].troops){
                  gameMap[axx][ayy].troops =  attackingTroops - gameMap[axx][ayy].troops;

                  for(let j=0; j<gameStats.length ;j++){
                    if(gameStats[j].id == gameMap[axx][ayy].owned){
                      if(gameMap[axx][ayy].goldMine){
                        gameStats[j].goldMine -=1;
                      }
                      gameStats[j].territory -=1;
                    }
                  }

                  if(gameMap[axx][ayy].owned == ""){

                    gameStats[i].gold += 10;
                  }
                  else{
                    gameStats[i].gold += 50;
                  }

                  gameMap[axx][ayy].owned = gameStats[i].id;
                  gameMap[axx][ayy].color = gameStats[i].color;
                  gameMap[axx][ayy].goldMine = false;
                  gameMap[axx][ayy].tower = false;
                  gameMap[axx][ayy].fortification = false;
                  gameMap[axx][ayy].capital = false;
                  gameStats[i].territory +=1;


                }

                else{

                  gameMap[axx][ayy].troops -= attackingTroops;
                }
              }
            }
          }
        }

      }
    }
  }
  catch(e){
    console.log(e.message);
  }

  });

  for(let i=0; i<gameStats.length ;i++){
    gameStats[i].gold = gameStats[i].gold + gameStats[i].goldMine*5;
    gameStats[i].energy = gameStats[i].energy + gameStats[i].territory;
  }

  actionList =[];

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
          troops : 0,
          goldMine : false,
          tower : false,
          fortification : false,
          color : "",
          capital: false,
        })
      }
    }
    for(let i=0; i<Math.min(maxPlayers , users.length) ; i++){
      let user = users[i];
      let position = generatePosition();
      position = i?[9,4]:[9,14]
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
            capital : false,
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
        capital : true,
        color : color[i],
      }

      gameMap[position[0]][position[1]] ={
        owned : user.id,
        troops : 500,
        goldMine : true,
        tower : true,
        fortification : true,
        capital : true,
        color : color[i],
      }

      let stats = {
        id : user.id,
        goldMine : 1,
        territory : 1,
        energy : 5,
        gold : 200,
        endTurn : 0,
        color : color[i],
        username : user.username,
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
      io.to(id).emit('stats' , gameStats[i]);
    }
  })


  socket.on('addAction', (data)=>{
    if(!playing){
      actionList.push(data);
    }

  })


  socket.on('endTurn' , (data)=>{
    for(let i=0; i<gameStats.length ; i++){
      if(gameStats[i].id == data.id){
        if(gameStats[i].endTurn == 0){
          gameStats[i].endTurn = 1;
          endTurn++;
        }
      }
    }
    console.log(endTurn , data.id , gameStats.length);

    if(endTurn == gameStats.length){
      endTurn = 0;
      for(let i=0; i<gameStats.length ; i++){
        gameStats[i].endTurn =0;
      }
      playing = true;


    play();
    playing = false;

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
      io.to(id).emit('stats' , gameStats[i]);
    }
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
