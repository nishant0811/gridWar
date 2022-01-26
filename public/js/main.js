const socket = io();

let username = 'nishant'

socket.emit('joinRoom' , {username})
