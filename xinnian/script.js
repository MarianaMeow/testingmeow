const glass = document.getElementById("glass");
const claw = document.querySelector(".claw");

const minX = 12;
const maxX = 88;
const moveSpeed = 0.4;

let clawX = 50;
let movingLeft = false;
let movingRight = false;
let grabbing = false;

const clampPercent = (value) => Math.max(minX, Math.min(value, maxX));

const setClaw = () => {
  glass.style.setProperty("--claw-x", `${clampPercent(clawX)}%`);
};

const setDrop = (value) => {
  glass.style.setProperty("--claw-drop", value);
};

const getDropDistance = () => {
  const rect = glass.getBoundingClientRect();
  const drop = rect.height * 0.45;
  return Math.round(Math.max(80, Math.min(drop, 150)));
};

const grabClaw = () => {
  if (grabbing) {
    return;
  }
  grabbing = true;
  const drop = getDropDistance();

  setDrop(`${drop}px`);
  setTimeout(() => {
    claw.classList.add("grab");
  }, 180);

  setTimeout(() => {
    setDrop("0px");
  }, 650);

  setTimeout(() => {
    claw.classList.remove("grab");
    grabbing = false;
  }, 1000);
};

const step = () => {
  if (!grabbing) {
    const direction = (movingRight ? 1 : 0) - (movingLeft ? 1 : 0);
    if (direction !== 0) {
      clawX = clampPercent(clawX + direction * moveSpeed);
      setClaw();
    }
  }
  window.requestAnimationFrame(step);
};

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyA") {
    if (!grabbing) {
      movingLeft = true;
    }
    event.preventDefault();
  } else if (event.code === "KeyD") {
    if (!grabbing) {
      movingRight = true;
    }
    event.preventDefault();
  } else if (event.code === "Space") {
    grabClaw();
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "KeyA") {
    movingLeft = false;
  } else if (event.code === "KeyD") {
    movingRight = false;
  }
});

setClaw();
setDrop("0px");
window.requestAnimationFrame(step);
