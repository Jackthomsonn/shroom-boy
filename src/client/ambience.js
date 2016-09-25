'use strict';
export default class Ambience {
 /**
  * @name Ambience
  *
  * @description A class used for creating an ambience in our scenes
  *
  * @param {string} src the source of our audio stream
  * @param {boolean} loop defines whether the audio stream should loop or not
  * @example const ambience = new Ambience('./src/to/file.mp3', true);
  */
  constructor(src, loop) {
    this.audio = new Audio();
    this.audio.src = src;
    this.audio.loop = loop;
  }

 /**
  * A method to play our audio stream
  */
  play() {
    this.audio.play();
  }
}