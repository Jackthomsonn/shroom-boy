/* eslint no-console : 0 */
'use strict';
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 8080;
const Player = require('./player');
const Mushroom = require('./mushroom');
const sockets = {};
const players = {};
const mushroom = new Mushroom();

let online = 0;
let timer = 60;

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

process.on('uncaughtException', (exception) => {
  try {
    throw new Error('An uncaught exception was initiated - ' + exception);
  } catch(e) {
    console.log(e);
  }
});

server.listen(port);

console.log('Server is running on port ' + port + ' in ' + process.env.NODE_ENV + ' mode');

io.sockets.on('connection', (socket) => {
  const _id = socket.id;
  let name;
  let player;
  let created;
  let bufferName;
  const buffer = [];
  sockets[_id] = socket;

  setInterval( () => {
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
      setInterval( () => {
        if(timer === 0 || timer >= 11 && !created) {
          if(buffer.length > 0) {
            for(let i = 0; i < buffer.length; i++) {
              ++online;
              socket.broadcast.emit('justJoined', {
                name: data.name
              });
              setTimeout(function() {
                io.emit('timeout', {
                  timeout: true
                });
              },2000);
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
      socket.broadcast.emit('justJoined', {
        name: data.name
      });
      setTimeout(function() {
        io.emit('timeout', {
          timeout: true
        });
      },2000);
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
      socket.broadcast.emit('justLeft', {
        name: players[_id].name
      });
      setTimeout(function() {
        io.emit('timeout', {
          timeout: true
        });
      },2000);
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

const buffer = setInterval(checkWinner, 1000);
const loop = setInterval(gameLoop, 1000/40);

function checkWinner() {
  --timer;
  if(timer === 0) {
    timer = 60;
    let key;
    let winner;
    let winningScore;
    const winners = [];
    const playersW = new Array(players);
    for(let i = 0; i < playersW.length; i++) {
      const player = playersW[i];
      for(let key in player) {
        key = key;
        winners.push({
          name: player[key].name,
          score: player[key].score
        });
      }
      const score = [];
      for(let j = 0; j < winners.length; j++) {
        score.push(winners[j].score);
        winningScore = Math.max.apply(Math, score);
        if(winners[j].score === winningScore) {
          for(let k = 0; k < winners.length; k++) {
            if(winners[k].score === winningScore) {
              winner = winners[k].name;
            }
          }
        }
      }
    }
    io.emit('winner', {
      winner: winner
    });
    setTimeout(function() {
      io.emit('newGame', {
        newGame: true
      });
    },4000);
  }
}
function gameLoop() {
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
}