'use strict';
export default class Notification {
  constructor(message, selector) {
    this.message = message;
    this.notification = document.querySelector(selector);
    if(this.message) {
      this.notification.innerHTML = this.message;
    }
  }
  show() {
    this.notification.style.visibility = 'visible';
  }
  hide(data) {
    if(data) {
      this.notification.style.visibility = 'hidden';
    }
  }
}