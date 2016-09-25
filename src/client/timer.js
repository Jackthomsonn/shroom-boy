'use strict';
export default class Timer {
 /**
  * @name Timer
  *
  * @description A class used for setting a timer in our scene
  *
  * @param {number} count the number of seconds we pass in from the server
  *
  * @example const timer = new Timer(60);
  */
  constructor(count) {
    this.timer = document.querySelector('.stats p');
    this.count = count;
  }

 /**
  * A method to start our timer
  */
  start() {
    this.timer.innerHTML = 'Time left - ' + this.count;
  }
}