'use strict';
import Ambience from './ambience';
export default class Settings {
 /**
  * @name Settings
  *
  * @description A class used to initialise our game with predefined settings
  *
  * @example const settings = new Settings();
  */
  constructor() {
    // Setup Local Variables
    this.connection = 'https://shroom-boy.herokuapp.com/';
    this.notification;
    this.timer;
    this.name;

    // Setup Canvas Elements
    this.canvas = document.querySelector('canvas');
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");

    // Setup Sprites
    this.map = new Image();
    this.map.src = '../app/images/grass.jpg';
    this.player = new Image();
    this.mushroom = {};
    this.mushroomImage = new Image();
    this.mushroomImage.src = '../app/images/shroom.png';

    // Setup an Ambience for the scene
    this.song = new Ambience('../app/music/theme_song_2.mp3', true);
    this.collected = new Ambience('../app/music/score.mp3', false);

    // Get Press Start 2P Font To Work On Canvas
    this.link = document.createElement('link');
    this.link.rel = 'stylesheet';
    this.link.type = 'text/css';
    this.link.href = 'https://fonts.googleapis.com/css?family=Press+Start+2P';
    document.getElementsByTagName('head')[0].appendChild(this.link);
    this.image = new Image;
    this.image.src = this.link.href;
    this.image.onerror = () => {
      this.canvas = document.querySelector('canvas');
      this.ctx = this.canvas.getContext("2d");
      this.ctx.font = '12px "Press Start 2P"';
    };
    this.ctx.fillStyle = '#FFF';
  }
}