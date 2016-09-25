'use strict';
export default class Notification {
 /**
  * @name Notification
  *
  * @description A class used for setting notifications
  *
  * @param {string} message the message we want to pass through
  * @param {string} selector the element we want to append this message to
  *
  * @example const notification = new Notification('I am a notification', '.notification');
  */
  constructor(message, selector) {
    this.message = message;
    this.notification = document.querySelector(selector);
    if(this.message) {
      this.notification.innerHTML = this.message;
    }
  }

 /**
  * A method to show our notification
  */
  show() {
    this.notification.style.visibility = 'visible';
  }

 /**
  * A method to hide our notification
  *
  * @param {object} data an object which gets passed through from the server which, when evalutaed to true, will hide our nofitication
  */
  hide(data) {
    if(data) {
      this.notification.style.visibility = 'hidden';
    }
  }
}