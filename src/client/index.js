'use strict';
import io from 'socket.io-client';
const socket = io.connect('http://192.168.0.13:8080');
const audio = new Audio('./app/music/theme_song.mp3');
const canvas = document.querySelector('canvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.font = '20px Open Sans';

let name;

audio.play();

socket.on('connect', function() {
  const name = prompt('What is your name?');
  socket.emit('addPlayer', {
    name: name
  });
});

socket.on('playerCount', function(data) {
  if(data.online > 1) {
    ctx.fillText(data.online + ' players online', 20, 50);
  } else {
    ctx.fillText(data.online + ' player online', 20, 50);
  }
});

socket.on('newPositions', function(data) {
  ctx.clearRect(0, 0, width, height);
  const map = new Image();
  const player = new Image();
  map.src = './app/images/grass.jpg';
  player.src = './app/images/player.jpg';
  ctx.drawImage(map, 0, 0, width, height);
  for (var i = 0; i < data.length; i++) {
    ctx.fillText(data[i].name, data[i].x, data[i].y - 20);
    ctx.drawImage(player, data[i].x, data[i].y, 30, 30);
  }
});

document.onkeydown = function(event) {
  switch(event.keyCode) {
  case 68 :
    socket.emit('keyPress', {
      position: 'right',
      state: true
    });
    break;
  case 83 :
    socket.emit('keyPress', {
      position: 'down',
      state: true
    });
    break;
  case 65 :
    socket.emit('keyPress', {
      position: 'left',
      state: true
    });
    break;
  case 87 :
    socket.emit('keyPress', {
      position: 'up',
      state: true
    });
    break;
  }
};
document.onkeyup = function(event) {
  switch(event.keyCode) {
  case 68 :
    socket.emit('keyPress', {
      position: 'right',
      state: false
    });
    break;
  case 83 :
    socket.emit('keyPress', {
      position: 'down',
      state: false
    });
    break;
  case 65 :
    socket.emit('keyPress', {
      position: 'left',
      state: false
    });
    break;
  case 87 :
    socket.emit('keyPress', {
      position: 'up',
      state: false
    });
    break;
  }
};