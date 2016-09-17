'use strict';
export default class Timer {
  constructor(count) {
    this.timer = document.querySelector('.stats p');
    this.count = count;
  }
  start() {
    this.timer.innerHTML = 'Time left - ' + this.count;
  }
}