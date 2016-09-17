'use strict';
import io from 'socket.io-client';
const socket = io.connect('http://192.168.0.13:8080');
const song = new Audio('./app/music/song_song.mp3');
const score = new Audio('./app/music/score.mp3');
const canvas = document.querySelector('canvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.font = '17px Arial';
ctx.fillStyle = '#FFF';

let name;
let mushroom;

song.addEventListener('ended', function() {
  this.currentTime = 0;
  this.play();
}, false);
song.play();

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

socket.on('mushroomPosition', function(data) {
  mushroom = data;
});

socket.on('newPositions', function(data) {
  ctx.clearRect(0, 0, width, height);
  const map = new Image();
  const player = new Image();
  const mushroomImage = new Image();
  mushroomImage.src = './app/images/shroom.png';
  map.src = './app/images/grass.jpg';
  ctx.drawImage(map, 0, 0, width, height);
  for (let i = 0; i < data.length; i++) {
    player.src = data[i].image;
    ctx.fillText(data[i].name + ' - ' + data[i].score, data[i].x - 10, data[i].y - 20);
    ctx.drawImage(player, data[i].x, data[i].y, data[i].width, data[i].height);
  }

  socket.on('mushroomCaught', function(data) {
    if(data.caught) {
      score.play();
      mushroom.x = data.x;
      mushroom.y = data.y;
      ctx.drawImage(mushroomImage, mushroom.x, mushroom.y, mushroom.width, mushroom.height);
    }
  });
  ctx.drawImage(mushroomImage, mushroom.x, mushroom.y, mushroom.width, mushroom.height);
});

document.onkeydown = function(event) {
  switch(event.keyCode) {
  case 68 :
    socket.emit('keyPress', {
      position: 'right',
      state: true,
      image: './app/images/character_right.png'
    });
    break;
  case 83 :
    socket.emit('keyPress', {
      position: 'down',
      state: true,
      image: './app/images/character_down.png'
    });
    break;
  case 65 :
    socket.emit('keyPress', {
      position: 'left',
      state: true,
      image: './app/images/character_left.png'
    });
    break;
  case 87 :
    socket.emit('keyPress', {
      position: 'up',
      state: true,
      image: './app/images/character_up.png'
    });
    break;
  }
};
document.onkeyup = function(event) {
  switch(event.keyCode) {
  case 68 :
    socket.emit('keyPress', {
      position: 'right',
      state: false,
      image: './app/images/character_right.png'
    });
    break;
  case 83 :
    socket.emit('keyPress', {
      position: 'down',
      state: false,
      image: './app/images/character_down.png'
    });
    break;
  case 65 :
    socket.emit('keyPress', {
      position: 'left',
      state: false,
      image: './app/images/character_left.png'
    });
    break;
  case 87 :
    socket.emit('keyPress', {
      position: 'up',
      state: false,
      image: './app/images/character_up.png'
    });
    break;
  }
};