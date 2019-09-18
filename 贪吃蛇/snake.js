var sw = 20,
  sh = 20, //宽高
  tr = 36,
  td = 40; //行列
var snake = null; //蛇的实例
var food = null; //食物的实例
var game = null; //游戏的实例

function Square(x, y, classname) {
  this.x = x * sw;
  this.y = y * sh;
  this.class = classname;

  this.viewContent = document.createElement("div");
  this.viewContent.className = this.class;
  this.parent = document.getElementById("snakeWrap");
}
Square.prototype.creat = function() {
  this.viewContent.style.position = "absolute";
  this.viewContent.style.width = sw + "px";
  this.viewContent.style.height = sh + "px";
  this.viewContent.style.left = this.x + "px";
  this.viewContent.style.top = this.y + "px";
  this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function() {
  this.parent.removeChild(this.viewContent);
};
//蛇
function Snake() {
  this.head = null;
  this.tail = null;
  this.pos = [];
  this.directionNum = {
    left: {
      x: -1,
      y: 0,
      rotate: -90
    },
    right: {
      x: 1,
      y: 0,
      rotate: 90
    },
    up: {
      x: 0,
      y: -1,
      rotate: 0
    },
    down: {
      x: 0,
      y: 1,
      rotate: 180
    }
  };
}
Snake.prototype.init = function() {
  //创建一个蛇头
  var snakeHead = new Square(3, 32, "snake-head");
  snakeHead.creat();
  this.head = snakeHead; //存储蛇头信息
  this.pos.push([3, 32]); //存储蛇头位置

  var snakeBody1 = new Square(3, 33, "snake-body");
  snakeBody1.creat();
  this.pos.push([3, 33]); //存储蛇身位置

  var snakeBody2 = new Square(3, 34, "snake-body");
  snakeBody2.creat();
  this.tail = snakeBody2;
  this.pos.push([3, 34]); //存储蛇身位置

  snakeHead.last = null;
  snakeHead.next = snakeBody1;

  snakeBody1.last = snakeHead;
  snakeBody1.next = snakeBody2;

  snakeBody2.last = snakeBody1;
  snakeBody2.next = null;

  //给蛇添加一个默认方向
  this.direction = this.directionNum.up;
};
Snake.prototype.getNextPos = function() {
  var nextPos = [
    //蛇头的下一个坐标
    this.head.x / sw + this.direction.x,
    this.head.y / sh + this.direction.y
  ];
  //下个点是自己，代表撞到了自己，游戏结束
  var self = true;
  this.pos.forEach(function(value) {
    if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
      self = false;
    }
  });
  if (!self) {
    this.strategies.die.call(this);
    return;
  }

  //下个是墙，游戏结束
  if (
    nextPos[0] < 3 ||
    nextPos[1] < 3 ||
    nextPos[0] > td + 2 ||
    nextPos[1] > tr + 2
  ) {
    this.strategies.die.call(this);
    return;
  }
  //下一个是食物，吃
  if (food && nextPos[0] == food.pos[0] && nextPos[1] == food.pos[1]) {
    this.strategies.eat.call(this);
    // food.remove();
    // creatFood();
    return;
  }
  //下一个点空，走
  this.strategies.move.call(this);
};

//处理碰撞后的代码
Snake.prototype.strategies = {
  move: function(format) {
    //创建新身体（旧蛇头位置）
    // console.log("move");
    var newBody = new Square(this.head.x / sw, this.head.y / sh, "snake-body");

    //更新链表关系
    newBody.next = this.head.next;
    newBody.next.last = newBody;
    newBody.last = null;

    this.head.remove(); //删除旧蛇头的位置
    newBody.creat();

    //创建新蛇头
    var newHead = new Square(
      this.head.x / sw + this.direction.x,
      this.head.y / sh + this.direction.y,
      "snake-head"
    );
    newHead.viewContent.style.transform =
      "rotate(" + this.direction.rotate + "deg)";
    newHead.creat();

    //更新链表关系
    newBody.last = newHead;
    newHead.next = newBody;
    newHead.last = null;

    //更新蛇身体的所有位置
    this.pos.splice(0, 0, [
      this.head.x / sw + this.direction.x,
      this.head.y / sh + this.direction.y
    ]);

    //更新newhead
    this.head = newHead;

    if (!format) {
      this.tail.remove();
      this.tail = this.tail.last;

      this.pos.pop();
    }
  },
  eat: function() {
    this.strategies.move.call(this, true);
    creatFood();
    game.score++;
  },
  die: function() {
    game.over();
  }
};

snake = new Snake();

//创建食物
function creatFood() {
  var x = null;
  var y = null;
  var include = true; //循环跳出的条件
  while (include) {
    x = 3 + Math.round(Math.random() * (td - 1));
    y = 3 + Math.round(Math.random() * (tr - 1));

    snake.pos.forEach(function(value) {
      if (x != value[0] && y != value[1]) {
        //表示随机生成的食物不在蛇身上
        include = false;
      }
    });
  }
  food = new Square(x, y, "snake-food");
  food.pos = [x, y];
  foodDom = document.querySelector(".snake-food");
  if (foodDom) {
    foodDom.style.left = x * sw + "px";
    foodDom.style.top = y * sh + "px";
  } else {
    food.creat();
  }
}

//控制蛇
function Game() {
  this.timer = null;
  this.score = 0;
  this.timer2 = null;
  this.time = 0;
}

Game.prototype.init = function() {
  snake.init();
  //   snake.getNextPos();
  creatFood();

  document.onkeydown = function(e) {
    if (
      // e.which == 65 ||
      e.which == 37 &&
      snake.direction != snake.directionNum.right
    ) {
      snake.direction = snake.directionNum.left;
    } else if (
      // e.which == 87 ||
      e.which == 38 &&
      snake.direction != snake.directionNum.down
    ) {
      snake.direction = snake.directionNum.up;
    } else if (
      // e.which == 68 ||
      e.which == 39 &&
      snake.direction != snake.directionNum.left
    ) {
      snake.direction = snake.directionNum.right;
    } else if (
      // e.which == 83 ||
      e.which == 40 &&
      snake.direction != snake.directionNum.up
    ) {
      snake.direction = snake.directionNum.down;
    }
  };
  this.start();
};

Game.prototype.start = function() {
  this.timer = setInterval(function() {
    snake.getNextPos();
  }, 200);

  var t = document.getElementsByClassName("time")[0];
  var s = document.getElementsByClassName("score")[0];
  this.timer2 = setInterval(function() {
    game.time++;
    t.innerHTML = game.time + " 秒";
    s.innerHTML = game.score + " 分";
  }, 1000);
};

Game.prototype.over = function() {
  clearInterval(this.timer);
  clearInterval(this.timer2);
alert("我爱风琴");
  alert("你的得分为：" + game.score);
  var s = document.getElementById("snakeWrap");
  s.innerHTML = "";

  snake = new Snake();
  game = new Game();

  var btn = document.querySelector(".startBtn button");
  btn.style.display = "block";
};

Game.prototype.pause = function() {
  clearInterval(this.timer);
  clearInterval(this.timer2);
};

//开启游戏
game = new Game();
var startBtn = document.querySelector(".startBtn button");
startBtn.onclick = function() {
  game.init();
  startBtn.style.display = "none";
  //   pauseBtn.parentNode.style.display = "block";
};

//暂停游戏
var snakeWrap = document.getElementById("snakeWrap");
// console.log(snakeWrap);
var pauseBtn = document.querySelector(".pauseBtn button");

snakeWrap.onclick = function() {
  game.pause();
  pauseBtn.parentNode.style.display = "block";
};

pauseBtn.onclick = function() {
  game.start();
  pauseBtn.parentNode.style.display = "none";
};
