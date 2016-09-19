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
let timer = 60;

const buffer = setInterval( () => {
  --timer;
  if(timer === 0) {
    timer = 60;
  }
},1000);

process.on('uncaughtException', function (exception) {
  console.log(exception);
});

io.sockets.on('connection', (socket) => {
  const _id = socket.id;
  let name;
  let player;
  let created;
  let bufferName;
  const buffer = [];
  sockets[_id] = socket;

  setInterval(function() {
    socket.emit('timer', {
      timer: timer
    });
  },1000);

  socket.on('addPlayer', (data) => {
    if(timer <= 10) {
      player = new Player(_id);
      player.ready = false;
      players[_id] = player;
      console.log('User added to queue');
      created = false;
      if(!data.name) {
        data.name = 'Anon';
        bufferName = data.name;
      }
      buffer.push(data);
      bufferName = data.name;
      socket.emit('inBuffer', {
        inBuffer: true
      });
      setInterval(function() {
        if(timer === 0 || timer >= 11 && !created) {
          if(buffer.length > 0) {
            for(let i = 0; i < buffer.length; i++) {
              ++online;
              console.log(data.name + ' just joined the game');
              console.log('Online players: ' + online);
              if(!buffer[i].name) {
                player.name = 'Anon';
              } else {
                player.name = buffer[i].name;
              }
              player.ready = true;
              created = true;
              socket.emit('inBuffer', {
                inBuffer: false
              });
            }
          }
        }
      },1000);
    } else {
      ++online;
      console.log(data.name + ' just joined the game');
      console.log('Online players: ' + online);
      player = new Player(_id);
      if(!data.name) {
        player.name = 'Anon';
      } else {
        player.name = data.name;
      }
      player.ready = true;
      players[_id] = player;
    }
  });

  socket.on('disconnect', () => {
    if(!player.ready) {
      console.log('User left from buffer');
      delete players[_id];
      for(let i = buffer.length - 1; i >= 0; i--) {
        if(buffer[i].name === bufferName) {
          buffer.splice(i, 1);
          online - 1;
        }
      }
    } else {
      --online;
      console.log(players[_id].name + ' just left the game');
      console.log('Online players: ' + online);
      delete sockets[_id];
      delete players[_id];
    }
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
      image: player.image,
      ready: player.ready
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