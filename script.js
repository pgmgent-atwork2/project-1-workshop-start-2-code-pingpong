let difficulty = "";
const gameArea = document.getElementById("game");
const startButton = document.getElementById("start");
const paddleLeft = document.querySelector(".paddle.left");
const paddleRight = document.querySelector(".paddle.right");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const ball = document.querySelector(".ball");
const info = document.querySelector(".info");
const scoreDisplay = document.createElement("div");
let keys = { ArrowUp: false, ArrowDown: false };
let aiTargetY = 0;

difficultyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    difficultyButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    setDifficulty(this.id);
    console.log(this.id);
  });
});

let scores = { player: 0, ai: 0 };
const settings = {
  Easy: { ballSpeed: 8, aiSpeed: 8.5, playerSpeed: 8.5 },
  Medium: { ballSpeed: 10, aiSpeed: 10.5, playerSpeed: 11 },
  Hard: { ballSpeed: 14, aiSpeed: 15, playerSpeed: 15 },
  Impossible: { ballSpeed: 20, aiSpeed: 1000, playerSpeed: 20 },
};
let ballVelocity = { x: 0, y: 0 };
let gameInterval;

function setDifficulty(level) {
  difficulty = level;
  startButton.disabled = false;
}

function startGame() {
  gameArea.style.display = "flex";
  document.getElementById("menu").style.display = "none";
  ballVelocity = {
    x: settings[difficulty].ballSpeed,
    y: settings[difficulty].ballSpeed,
  };
  gameInterval = setInterval(gameLoop, 20);
  scoreDisplay.textContent = `Player: ${scores.player} AI: ${scores.ai}`;
  scoreDisplay.classList.add("score");
  gameArea.appendChild(scoreDisplay);

  setInterval(() => {
    info.style.display = "none";
  }, 3000);
}

document.addEventListener("keydown", (event) => (keys[event.key] = true));
document.addEventListener("keyup", (event) => (keys[event.key] = false));

function movePaddle(paddle, change) {
  let topPosition = parseInt(
    window.getComputedStyle(paddle).getPropertyValue("top")
  );
  topPosition += change;
  if (topPosition < 0) topPosition = 0;
  if (topPosition > gameArea.offsetHeight - paddle.offsetHeight)
    topPosition = gameArea.offsetHeight - paddle.offsetHeight;
  paddle.style.top = topPosition + "px";
}

function gameLoop() {
  let paddleRightY = parseInt(
    window.getComputedStyle(paddleRight).getPropertyValue("top")
  );
  aiTargetY = ball.getBoundingClientRect().top - paddleRight.offsetHeight / 2;

  if (paddleRightY < aiTargetY) {
    movePaddle(
      paddleRight,
      Math.min(settings[difficulty].aiSpeed, aiTargetY - paddleRightY)
    );
  } else if (paddleRightY > aiTargetY) {
    movePaddle(
      paddleRight,
      -Math.min(settings[difficulty].aiSpeed, paddleRightY - aiTargetY)
    );
  }

  if (keys.ArrowUp) movePaddle(paddleLeft, -settings[difficulty].playerSpeed);
  if (keys.ArrowDown) movePaddle(paddleLeft, settings[difficulty].playerSpeed);

  let ballPos = {
    x: parseInt(window.getComputedStyle(ball).getPropertyValue("left")),
    y: parseInt(window.getComputedStyle(ball).getPropertyValue("top")),
  };

  if (
    ballPos.y <= 0 ||
    ballPos.y >= gameArea.offsetHeight - ball.offsetHeight
  ) {
    ballVelocity.y = -ballVelocity.y;
  }

  if (collision(paddleLeft, ball) || collision(paddleRight, ball)) {
    ballVelocity.x = -ballVelocity.x;
    let hitSpot =
      ballPos.y -
      (parseInt(window.getComputedStyle(paddleRight).getPropertyValue("top")) +
        paddleRight.offsetHeight / 2);

    ballVelocity.y += hitSpot / 20 + (Math.random() * 2 - 1);

    ballVelocity.y = Math.max(Math.min(ballVelocity.y, 10), -10);

    incrementBallSpeed();
  }

  ball.style.left = ballPos.x + ballVelocity.x + "px";
  ball.style.top = ballPos.y + ballVelocity.y + "px";

  if (ballPos.x <= 0) {
    scores.ai++;
    resetBall();
  } else if (ballPos.x >= gameArea.offsetWidth - ball.offsetWidth) {
    scores.player++;
    resetBall();
  }

  scoreDisplay.textContent = `Player: ${scores.player} AI: ${scores.ai}`;
  checkForWinner();
}

function incrementBallSpeed() {
  let speedIncrease = 0.1;
  ballVelocity.x *= 1 + speedIncrease;
  ballVelocity.y *= 1 + speedIncrease;
}

function resetBall() {
  ball.style.left = "50%";
  ball.style.top = "50%";
  ballVelocity = {
    x: settings[difficulty].ballSpeed,
    y: settings[difficulty].ballSpeed * (Math.random() > 0.5 ? 1 : -1),
  };
}

function checkForWinner() {
  if (scores.player >= 5) {
    alert("Player wins!");
    document.location.reload();
  } else if (scores.ai >= 5) {
    alert("AI wins!");
    document.location.reload();
  }
}

function collision(paddle, ball) {
  let paddleBounds = paddle.getBoundingClientRect();
  let ballBounds = ball.getBoundingClientRect();
  return !(
    paddleBounds.top > ballBounds.bottom ||
    paddleBounds.bottom < ballBounds.top ||
    paddleBounds.right < ballBounds.left ||
    paddleBounds.left > ballBounds.right
  );
}
