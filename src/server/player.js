const Player = function(id){
  const self = {
    x: Math.floor(Math.random() * 1000),
    y: Math.floor(Math.random() * 300),
    _id: id,
    right: false,
    left: false,
    up: false,
    down: false,
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
};

module.exports = {
  Player: Player
};