'use strict';
import io from 'socket.io-client';
import Notification from './notification';
import Settings from './settings';
import Timer from './timer';

export default class Game {
 /**
  * @name Game
  *
  * @description A class used to instantiate the game
  *
  * @example new Game();
  */
  constructor() {
    this.settings = new Settings();
    this.socket = io.connect(this.settings.connection);
    this.socket.on('connect', () => {
      this.settings.song.play();
      name = prompt('Give your character a name');
      this.socket.on('inBuffer', (data) => {
        this.settings.notification = new Notification(null, '.container');
        data.inBuffer ? this.settings.notification.show() : this.settings.notification.hide(!data.inBuffer);
      });
      this.socket.emit('addPlayer', {
        name: name
      });

      this.socket.on('justJoined', (data) => {
        this.settings.notification = new Notification(data.name + ' just joined', '.notification');
        this.settings.notification.show();
        setTimeout( () => {
          this.settings.notification.hide();
        },2000);
      });

      this.socket.on('justLeft', (data) => {
        this.settings.notification = new Notification(data.name + ' just left', '.notification');
        this.settings.notification.show();
        setTimeout( () => {
          this.settings.notification.hide();
        },2000);
      });

      this.socket.on('winner', (data) => {
        this.settings.notification = new Notification(data.winner + ' was victorious', '.notification');
        this.settings.notification.show();
        setTimeout( () => {
          this.settings.notification.hide();
        },2000);
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
        this.settings.timer = new Timer(data.timer);
        this.settings.timer.start();
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