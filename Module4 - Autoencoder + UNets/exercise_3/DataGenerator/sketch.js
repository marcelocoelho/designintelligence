/* ///////////////////////////////////////////
Data Generator
Code by Marcelo Coelho
Design Intelligence - MIT

Library and reference example:
https://stubborncode.com/posts/how-to-export-images-and-animations-from-p5-js/
https://github.com/spite/ccapture.js#using-the-code
////////////////////////////////////////////*/


const capturer = new CCapture( { 
  framerate: 5, 
  format: 'png'
} );

let p5Canvas;

let maxFrames = 50;

function setup() {
  p5Canvas = createCanvas(28/2, 28/2); // canvas dimensions divided by 2  
  frameRate(5);
}

function draw() {

  // start capturing frames
  if (frameCount === 1) capturer.start();

  background(0);
  
  // draw diagonal line
  stroke(255);
  let p1 = { x: 0, y: 0 };
  let p2 = { x: 6-random(4), y: 6 };
  let p3 = { x: 10-random(4), y: 10 };
  let p4 = { x: 28/2, y: 28/2 };
  noFill();
  curve(p1.x, p1.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  curve(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  curve(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y, p4.x, p4.y);

  // capture
  capturer.capture(p5Canvas.canvas);

  // if too many, then stop
  if (frameCount === maxFrames) {
    noLoop();
    capturer.stop();
    capturer.save();
    } 
    
  console.log(frameCount);


}

