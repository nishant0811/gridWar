const socket = io();

let username = 'nishant'
let playerId
socket.emit('joinRoom' , {username})

let mapSize;
let usermap;

let energy,gold,territory;
let activeId;
let sendTo;

let energyCost = {
  moveCapital : 1,
  goldmine : 1,
  addTroops : 1,
  attack : 1,
  tower : 2,
  fortification : 2
}

function StartGame(){
  socket.emit('startGame');
}



function disableButtons(){
  document.getElementById('buildGold').classList.add('hidden');
  document.getElementById('buildFortification').classList.add('hidden');
  document.getElementById('buildTower').classList.add('hidden');
  document.getElementById('addTroops').classList.add('hidden');
  document.getElementById('moveCapital').classList.add('hidden');
}

function enableButtons(){
  document.getElementById('buildGold').classList.remove('hidden');
  document.getElementById('buildFortification').classList.remove('hidden');
  document.getElementById('buildTower').classList.remove('hidden');
  document.getElementById('addTroops').classList.remove('hidden');
  document.getElementById('moveCapital').classList.remove('hidden');
}

function updateStats(){
  document.getElementById('energy').innerText = energy;
  document.getElementById('gold').innerText = gold;
  document.getElementById('territory').innerText = territory;
}


function active(id){
  if(activeId){

    document.getElementById(`${activeId}`).classList.remove('active');
  }
  document.getElementById(`${id}`).classList.add('active');
  activeId = id;

  let actionPositon = activeId.split(",");
  if(usermap[parseInt(actionPositon[0])][parseInt(actionPositon[1])].owned == playerId){
    enableButtons();
  }
  else{
    disableButtons();
  }

}


function add(){
  let addTroops = parseInt(prompt("Enter Number of Troops you want to add"));
  if(gold < addTroops){
    alert("Not Enough Gold");
    return;
  }
  else{
    if(energy < energyCost.addTroops){
      alert("Not Enough Energy");
      return;
    }

    let payload = {
      type : "add",
      from : activeId,
      id : playerId,
      troops : addTroops
    }
    socket.emit("addAction",payload);
    gold -= addTroops
    energy -= energyCost.addTroops;
    updateStats();
  }
}

function endTurn(){
  let payload ={
    id : playerId
  }
  socket.emit('endTurn' , payload)
}



function setTo(id){
  sendTo = id;
  let troops = parseInt(prompt(`Enter the Number of Troops you want to send`));

  if(troops >0){
    if(energy < energyCost.attack){
      alert("Not Enough Energy");
      return;
    }
    let payload ={
      id : playerId,
      troops : troops,
      from : activeId,
      to : sendTo,
      type : 'attack'
    }

    socket.emit('addAction' , payload);
    energy -= energyCost.attack;
    updateStats();
  }
}


function build(building){
  building = building.toLowerCase();
  let payload = {
    type : 'build',
    building : building,
    from : activeId,
    id : playerId
  }

  if(gold < 20){
    alert("Not Enough Gold");
    return ;
  }

  if(energy < energyCost[building]){
    alert("Not Enough Energy")
    return;
  }

  let actionPositon = activeId.split(",");
  if(usermap[parseInt(actionPositon[0])][parseInt(actionPositon[1])].owned == playerId){
    socket.emit("addAction" , payload);
    gold -= 20;
    energy -= energyCost[building];
    updateStats();
  }
  else{
    alert("Invalid Build");
  }
}


socket.on('mapSize',(data)=>{
  document.getElementById('map').innerHTML= "";
  mapSize = data;
  for(let i=0; i<data ;i++){
    for(let j=0;j<data;j++){
    document.getElementById('map').innerHTML +=`<div class="square">

    </div>`;
  }
  }
})


socket.on('setId' , (data)=>{
  playerId = data;
  console.log(playerId);
})


socket.on('gameData' , (data)=>{
  document.getElementById('map').innerHTML= "";
  let map = data.map;
  usermap = map;
  for(let i=0 ; i<mapSize ; i++){
    for(let j=0; j<mapSize ; j++){
      document.getElementById('map').innerHTML +=`<div class="square ${map[i][j].color}" id="${i},${j}" onclick="active('${i},${j}')" oncontextmenu="setTo('${i},${j}');return false;">
      <div class="assets">
          ${map[i][j].capital ? "<span>C</span>" : ""}
          ${map[i][j].tower ? "<span>T</span>" : ""}
          ${map[i][j].goldMine ? "<span>G</span>" : ""}
          ${map[i][j].fortification ? "<span>F</span>" : ""}
      </div>
      <p class="troops">
      ${map[i][j].troops}
      </p>
      </div>`;
    }
  }
})


socket.on('stats', (data)=>{
  energy = data.energy;
  gold = data.gold;
  territory = data.territory;
  updateStats();

})
