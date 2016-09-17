'use strict';
export default class Ambience {
  constructor(src, loop) {
    this.audio = new Audio();
    this.audio.src = src;
    this.audio.loop = loop;
  }
  play() {
    this.audio.play();
  }
}