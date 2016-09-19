'use strict';
import io from 'socket.io-client';
let socket = io.connect('https://shroom-boy.herokuapp.com/');
const song = new Audio('./app/music/theme_song.mp3');
const score = new Audio('./app/music/score.mp3');
const canvas = document.querySelector('canvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");
ctx.font = '17px Arial';
ctx.fillStyle = '#FFF';

let name;
let mushroom;

song.loop = true;
song.play();

socket.on('connect', () => {
  const name = prompt('What is your name?');
  socket.on('inBuffer', function(data) {
    const buffer = document.querySelector('.container');
    if(data.inBuffer) {
      buffer.style.visibility = 'visible';
    } else {
      buffer.style.visibility = 'hidden';
    }
  });
  socket.emit('addPlayer', {
    name: name
  });
  socket.on('error', () => {
    socket = (socket, {
      'force new connection': true
    });
  });
});

socket.on('playerCount', (data) => {
  if(data.online > 1) {
    ctx.fillText(data.online + ' players online', 20, 50);
  } else {
    ctx.fillText(data.online + ' player online', 20, 50);
  }
});

socket.on('mushroomPosition', (data) => {
  mushroom = data;
});

socket.on('newPositions', (data) => {
  ctx.clearRect(0, 0, width, height);
  const map = new Image();
  const player = new Image();
  const mushroomImage = new Image();
  mushroomImage.src = './app/images/shroom.png';
  map.src = './app/images/grass.jpg';
  ctx.drawImage(map, 0, 0, width, height);
  for (let i = 0; i < data.length; i++) {
    if(data[i].ready) {
      player.src = data[i].image;
      ctx.fillText(data[i].name + ' - ' + data[i].score, data[i].x - 10, data[i].y - 20);
      ctx.drawImage(player, data[i].x, data[i].y, data[i].width, data[i].height);
    }
  }

  socket.on('mushroomCaught', (data) => {
    if(data.caught) {
      score.play();
      mushroom.x = data.x;
      mushroom.y = data.y;
      ctx.drawImage(mushroomImage, mushroom.x, mushroom.y, mushroom.width, mushroom.height);
    }
  });
  ctx.drawImage(mushroomImage, mushroom.x, mushroom.y, mushroom.width, mushroom.height);
});

const body = document.querySelector('body');
const timer = document.createElement('div');
timer.className = 'stats';
body.appendChild(timer);
socket.on('timer', function(data) {
  timer.innerHTML = 'Time left - ' + data.timer;
});

document.onkeydown = (event) => {
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
document.onkeyup = (event) => {
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