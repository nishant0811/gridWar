const socket = io();

let username = 'nishant'
let playerId
socket.emit('joinRoom' , {username})

let mapSize;

socket.on('mapSize',(data)=>{
  document.getElementById('map').innerHTML= "";
  mapSize = data;
  for(let i=0; i<data ;i++){
    for(let j=0;j<data;j++)
    document.getElementById('map').innerHTML +=`<div class="square" id="${i}${j}"></div>`;
  }
})


socket.on('setId' , (data)=>{
  playerId = data;
  console.log(playerId);
})


socket.on('gameData' , (data)=>{
  document.getElementById('map').innerHTML= "";
  let map = data.map;
  for(let i=0 ; i<mapSize ; i++){
    for(let j=0; j<mapSize ; j++){
      document.getElementById('map').innerHTML +=`<div class="square ${map[i][j].color}" id="${i}${j}"></div>`;
    }
  }
})
