function Player(id){
  const self = {
    x: Math.floor(Math.random() * (1000 - 200 + 1)) + 200,
    y: Math.floor(Math.random() * (500 - 200 + 1)) + 200,
    _id: id,
    right: false,
    left: false,
    up: false,
    down: false,
    width: 30,
    height: 30,
    maxSpd: 10
  };
  self.updatePosition = function(){
    if(self.right) {
      self.x += self.maxSpd;
    }
    if(self.left) {
      self.x -= self.maxSpd;
    }
    if(self.up) {
      self.y -= self.maxSpd;
    }
    if(self.down) {
      self.y += self.maxSpd;
    }
  };
  return self;
}

module.exports = Player;