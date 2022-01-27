const socket = io();

let username = 'nishant'
let playerId
socket.emit('joinRoom' , {username})

socket.on('mapSize',(data)=>{
  document.getElementById('map').innerHTML= ``;
  for(let i=0; i<data*data ;i++){
    document.getElementById('map').innerHTML +=`
    <div class="square">

    </div>
    `
  }
})


socket.on('setId' , (data)=>{
  playerId = data;
  console.log(playerId);
})
