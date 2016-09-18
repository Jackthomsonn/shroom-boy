/* eslint no-console:0 */
'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 8080;
const Player = require('./player');
const Mushroom = require('./mushroom');
const mushroom = new Mushroom();

switch(process.env.NODE_ENV) {
case 'development':
  app.use(express.static('dist'));
  break;
case 'production':
  app.use(express.static(__dirname));
  break;
}

app.get('/', (req, res) => {
  res.sendFile('dist/index.html');
});

server.listen(port);

console.log('Server is running on port ' + port + ' in ' + process.env.NODE_ENV + ' mode');

const sockets = {};
const players = {};

var io = require('socket.io')(server);
let online = 0;
let name;
let player;
io.sockets.on('connection', (socket) => {
  const _id = socket.id;
  sockets[_id] = socket;
  socket.on('addPlayer', (data) => {
    ++online;
    console.log(data.name + ' just joined the game');
    console.log('Online players: ' + online);
    player = new Player(_id);
    if(!data.name) {
      player.name = 'Anon';
    } else {
      player.name = data.name;
    }
    players[_id] = player;
  });

  socket.on('disconnect', () => {
    --online;
    console.log(players[_id].name + ' just left the game');
    console.log('Online players: ' + online);
    delete sockets[_id];
    delete players[_id];
  });

  socket.on('keyPress', (data) => {
    if(data.position === 'left') {
      player.left = data.state;
      player.image = data.image;
    }
    else if(data.position === 'right') {
      player.right = data.state;
      player.image = data.image;
    }
    else if(data.position === 'up') {
      player.up = data.state;
      player.image = data.image;
    }
    else if(data.position === 'down') {
      player.down = data.state;
      player.image = data.image;
    }
  });

  socket.emit('mushroomPosition', {
    x: mushroom.x,
    y: mushroom.y,
    width: mushroom.width,
    height: mushroom.height
  });
});

setInterval( () =>{
  const allPlayers = [];
  for(var i in players){
    const player = players[i];
    player.updatePosition();
    allPlayers.push({
      x:player.x,
      y:player.y,
      width: player.width,
      height: player.height,
      id:player._id,
      name: player.name,
      score: player.score,
      image: player.image
    });
    if(player.x < mushroom.x + mushroom.width && player.x + player.width  > mushroom.x &&
		player.y < mushroom.y + mushroom.height && player.y + player.height > mushroom.y) {
      mushroom.respawn();
      ++player.score;
      io.emit('mushroomCaught', {
        caught: true,
        x: mushroom.x,
        y: mushroom.y
      });
      break;
    }
  }
  for(const i in sockets){
    const socket = sockets[i];
    socket.emit('newPositions', allPlayers);
    socket.emit('playerCount', {
      online: online
    });
  }
},1000/40);