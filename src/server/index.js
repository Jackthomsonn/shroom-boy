'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 8080;
const Player = require('./player');

app.use(express.static('dist'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/dist/index.html');
});

server.listen(8080);

console.log('Server is running on port' + port + ' in ' + process.env.NODE_ENV + ' mode');

const sockets = {};
const players = {};

var io = require('socket.io')(server,{});
let online = 0;
io.sockets.on('connection', function(socket){
  const _id = socket.id;
  sockets[_id] = socket;

  let name;
  let player;
  socket.on('addPlayer', function(data) {
    ++online;
    console.log(data.name + ' just joined the game');
    console.log('Online players: ' + online);
    player = Player.Player(_id);
    if(!data.name) {
      player.name = 'Anon';
    } else {
      player.name = data.name;
    }
    players[_id] = player;
  });

  socket.on('disconnect',function(){
    --online;
    console.log(players[_id].name + ' just left the game');
    console.log('Online players: ' + online);
    delete sockets[_id];
    delete players[_id];
  });

  socket.on('keyPress',function(data){
    console.log('Pressed');
    if(data.position === 'left') {
      player.left = data.state;
    }
    else if(data.position === 'right') {
      player.right = data.state;
    }
    else if(data.position === 'up') {
      player.up = data.state;
    }
    else if(data.position === 'down') {
      player.down = data.state;
    }
  });
});

setInterval(function(){
  const allPlayers = [];
  for(var i in players){
    const player = players[i];
    player.updatePosition();
    allPlayers.push({
      x:player.x,
      y:player.y,
      id:player._id,
      name: player.name
    });
  }
  for(const i in sockets){
    const socket = sockets[i];
    socket.emit('newPositions',allPlayers);
    socket.emit('playerCount', {
      online: online
    });
  }
},1000/40);