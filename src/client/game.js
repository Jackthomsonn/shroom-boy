'use strict';
import io from 'socket.io-client';
import Notification from './notification';
import Settings from './settings';
import Timer from './timer';

let notification;
let timer;
let name;

export default class Game {
  constructor() {
    this.socket = io.connect('https://shroom-boy.herokuapp.com/');
    this.settings = new Settings();

    this.start();
  }
  start() {
    this.socket.on('connect', () => {
      this.settings.song.play();
      name = prompt('What is your name?');
      this.socket.on('inBuffer', (data) => {
        notification = new Notification(null, '.container');
        data.inBuffer ? notification.show() : notification.hide(!data.inBuffer);
      });
      this.socket.emit('addPlayer', {
        name: name
      });
      this.socket.on('justJoined', (data) => {
        notification = new Notification(data.name + ' just joined', '.notification');
        notification.show();
        this.socket.on('timeout', (data) => {
          notification.hide(data.timeout);
        });
      });
      this.socket.on('justLeft', (data) => {
        notification = new Notification(data.name + ' just left', '.notification');
        notification.show();
        this.socket.on('timeout', (data) => {
          notification.hide(data.timeout);
        });
      });
      this.socket.on('winner', (data) => {
        notification = new Notification(data.winner + ' was victorious', '.notification');
        notification.show();
        this.socket.on('newGame', (data) => {
          notification.hide(data.newGame);
        });
      });
      this.socket.on('error', () => {
        this.socket = (this.socket, {
          'force new connection': true
        });
      });
      this.socket.on('playerCount', (data) => {
        data.online > 1 ? this.settings.ctx.fillText(data.online + ' players online', 20, 50) : this.settings.ctx.fillText(data.online + ' player online', 20, 50);
      });
      this.socket.on('mushroomPosition', (data) => {
        this.settings.mushroom = data;
      });
      this.socket.on('newPositions', (data) => {
        this.settings.ctx.clearRect(0, 0, this.settings.width, this.settings.height);
        this.settings.ctx.drawImage(this.settings.map, 0, 0, this.settings.width, this.settings.height);
        for (let i = 0; i < data.length; i++) {
          if(data[i].ready) {
            this.settings.player.src = data[i].image;
            this.settings.ctx.fillText(data[i].name + ' - ' + data[i].score, data[i].x - 10, data[i].y - 20);
            this.settings.ctx.drawImage(this.settings.player, data[i].x, data[i].y, data[i].width, data[i].height);
          }
        }
        this.socket.on('mushroomCaught', (data) => {
          if(data.caught) {
            this.settings.collected.play();
            this.settings.mushroom.x = data.x;
            this.settings.mushroom.y = data.y;
            this.settings.ctx.drawImage(this.settings.mushroomImage, this.settings.mushroom.x, this.settings.mushroom.y, this.settings.mushroom.width, this.settings.mushroom.height);
          }
        });
        this.settings.ctx.drawImage(this.settings.mushroomImage, this.settings.mushroom.x, this.settings.mushroom.y, this.settings.mushroom.width, this.settings.mushroom.height);
      });
      this.socket.on('timer', (data) => {
        timer = new Timer(data.timer);
        timer.start();
      });
      document.onkeydown = (event) => {
        switch(event.keyCode) {
        case 68 :
          this.socket.emit('keyPress', {
            position: 'right',
            state: true,
            image: '../app/images/character_right.png'
          });
          break;
        case 83 :
          this.socket.emit('keyPress', {
            position: 'down',
            state: true,
            image: '../app/images/character_down.png'
          });
          break;
        case 65 :
          this.socket.emit('keyPress', {
            position: 'left',
            state: true,
            image: '../app/images/character_left.png'
          });
          break;
        case 87 :
          this.socket.emit('keyPress', {
            position: 'up',
            state: true,
            image: '../app/images/character_up.png'
          });
          break;
        }
      };
      document.onkeyup = (event) => {
        switch(event.keyCode) {
        case 68 :
          this.socket.emit('keyPress', {
            position: 'right',
            state: false,
            image: '../app/images/character_right.png'
          });
          break;
        case 83 :
          this.socket.emit('keyPress', {
            position: 'down',
            state: false,
            image: '../app/images/character_down.png'
          });
          break;
        case 65 :
          this.socket.emit('keyPress', {
            position: 'left',
            state: false,
            image: '../app/images/character_left.png'
          });
          break;
        case 87 :
          this.socket.emit('keyPress', {
            position: 'up',
            state: false,
            image: '../app/images/character_up.png'
          });
          break;
        }
      };
    });
  }
}