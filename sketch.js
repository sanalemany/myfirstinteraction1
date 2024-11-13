let font;
let tSize = 130;  // Text size
let tposX = 30;   // X position of text 
let tposY = 150;  // Y position of text
let pointCount = 0.35;  // Sampling density, between 0 to 1

let speed = 8;    // Particle speed, lower for slower
let comebackSpeed = 50;  // Speed of return after interaction
let dia = 40;     // Interaction diameter around the mouse
let randomPos = true;  // Random starting points
let pointsDirection = "right-down";  // Direction of movement (from right and down)
let interactionDirection = 0.6;  // -1 to 1, attraction to mouse

let textPoints = [];

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(700, 700);
  textFont(font);

  let points = font.textToPoints("hello!!", tposX, tposY, tSize, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < points.length; i++) {
    let pt = points[i];
    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );
    textPoints.push(textPoint);
  }
}

function draw() {
  background(0);

  for (let i = 0; i < textPoints.length; i++) {
    let v = textPoints[i];
    v.update();
    v.show();
    v.behaviors();
  }
}

function Interact(x, y, m, d, t, s, di, p) {
  // Set home position
  this.home = t ? createVector(random(width), random(height)) : createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  // Set initial velocity based on right-down direction
  if (di === "right-down") {
    this.vel = createVector(1, 1).normalize().mult(m);  // Diagonal from right and down
  } else {
    this.vel = createVector(0, 0); // Default
  }

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxForce = 0.6;
  this.dia = d;
  this.come = s;
  this.dir = p;
  this.color = color(255, 0, 0); // Initial color red
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
}

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
}

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  steer.limit(this.maxForce);
  return steer;
}

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    this.color = color(255, 105, 180);  // Change color to pink when close to mouse
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    this.color = color(255, 0, 0);  // Revert to red when not interacting
    return createVector(0, 0);
  }
}

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
}

Interact.prototype.show = function () {
  stroke(this.color);
  strokeWeight(4);
  point(this.pos.x, this.pos.y);
}
