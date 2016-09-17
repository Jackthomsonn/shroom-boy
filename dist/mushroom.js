function Mushroom() {
  const self = {
    width: 35,
    height: 35,
    x: Math.floor(Math.random() * (1000 - 200 + 1)) + 200,
    y: Math.floor(Math.random() * (500 - 200 + 1)) + 200,
  };
  self.respawn = () => {
    self.x = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
    self.y =  Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  };
  return self;
}

module.exports = Mushroom;