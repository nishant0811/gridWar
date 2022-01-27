const socket = io();

let username = 'nishant'

socket.emit('joinRoom' , {username})

for(let i=0; i<400 ;i++){
  document.getElementById('map').innerHTML +=`
  <div class="square">

  </div>
  `
}
