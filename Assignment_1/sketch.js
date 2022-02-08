/*
Pix2Pix ml5js example
Based on ml56js.org pix2pix example
Code modified and expanded by Diego Pinochet for  
Design Intelligente MIT
*/

//initial parameters
const SIZE = 256;
let inputImg, inputCanvas, output, statusMsg, pix2pix, clearBtn, transferBtn, currentColor, currentStroke;

let input;
let img;

let live= false;

function setup() {
  // Create a canvas
  inputCanvas = createCanvas(SIZE, SIZE);
  inputCanvas.class('border-box').parent('input');

  // Display initial input image
  inputImg = loadImage('images/map.png', drawImage);

  // Selcect output div container
  output = select('#output');
  statusMsg = select('#status');

  //set initial color and strokeWeight
  
  currentColor = color(203, 222, 174);
  currentStroke = 17;

  // Get the buttons from html (determined in the css file)

  select('#green').mousePressed(() => currentColor = color(203, 222, 174));
  select('#grey1').mousePressed(() => currentColor = color(243, 240, 233));
  select('#grey2').mousePressed(() => currentColor = color(232, 229, 222));
  select('#white').mousePressed(() => currentColor = color(255, 255, 255));
  select('#black').mousePressed(() => currentColor = color(0, 0, 0));
  select('#red').mousePressed(() => currentColor = color(255, 0, 0));
  select('#burgundy').mousePressed(() => currentColor = color(109, 0, 0));
  select('#blue').mousePressed(() => currentColor = color(0, 0, 255));
  select('#lightBlue').mousePressed(() => currentColor = color(47, 107,154));
  select('#darkBlue').mousePressed(() => currentColor = color(16, 3, 82));
  select('#green2').mousePressed(() => currentColor = color(0, 255, 0));
  select('#lightgreen').mousePressed(() => currentColor = color(162, 255, 0));
  select('#orange').mousePressed(() => currentColor = color(255, 170, 0));
  select('#yellow').mousePressed(() => currentColor = color(255, 234, 0));


  select('#size').mouseReleased(() => currentStroke = select('#size').value());

  // Select 'transfer' button html element
  transferBtn = select('#transferBtn');

  // Select 'clear' button html element
  clearBtn = select('#clearBtn');

  // Attach a mousePressed event to the 'clear' button
  clearBtn.mousePressed(function () {
    clearCanvas();
  });


  // Select 'Live' button html element for live drawing and transferring
  LiveButton = select('#LiveMode');

  //Live button ON-OFF
  LiveButton.mousePressed(function(){
    live=!live;
    console.log(live);
  });

  // Set stroke to black
  stroke(0);
  pixelDensity(1);

  //create button for mask loading
  input = createFileInput(handleFile);
  input.position(0, 0);

  //create the dropdown for model selection 
  sel = createSelect();
  sel.option('maps');
  sel.option('shoes');
  sel.option('pikachu');
  sel.option('facades');
  sel.option('handbags');
  sel.option('cats');
  sel.option('humans');
  sel.changed(changeModel);

  // Create a pix2pix method with a pre-trained model
  pix2pix = ml5.pix2pix('model/maps.pict', modelLoaded);
}

// Draw on the canvas when mouse is pressed
function draw() {

  /////////////////////////////////
  // You can draw here
  //rect(0,0,100,100);

  //check if the left mouse button is pressed
  if (mouseIsPressed) {
    //draw with current color and current strokeWeight
    stroke(currentColor);
    strokeWeight(currentStroke)
    //create a line from cursos positions
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  //If live mode is activated, every time we draw, we will see the updated transfer version 
  if (mouseReleased && live) {
    transfer() 
  }
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Show 'Model Loaded!' message
  statusMsg.html('Model Loaded!');
  // Call transfer function after the model is loaded
  //transfer();
  // Attach a mousePressed event to the transfer button
  transferBtn.mousePressed(function () {
    transfer();
  });
}

// Draw the input image to the canvas
function drawImage() {
  image(inputImg, 0, 0, SIZE, SIZE);
}

// Clear the canvas
function clearCanvas() {
  background(255);
}

function transfer() {
  // Update status message
  statusMsg.html('Transfering...');

  // Select canvas DOM element
  const canvasElement = select('canvas').elt;

  // Apply pix2pix transformation
  pix2pix.transfer(canvasElement, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (result && result.src) {
      statusMsg.html('Done!');
      // Create an image based result
      output.elt.src = result.src;
    }
  });
}


//function called when we choose a model from the dropdown menu
function changeModel() {
  //if selects a model from our 'model´ folder according to a value in the menu 
  let val = sel.value();
  if (val == 'maps') {
    pix2pix = ml5.pix2pix('model/maps.pict', modelLoaded);
  } else if (val == 'shoes') {
    pix2pix = ml5.pix2pix('model/edges2shoes_AtoB.pict', modelLoaded);
  } else if (val == 'pikachu') {
    pix2pix = ml5.pix2pix('model/edges2pikachu_AtoB.pict', modelLoaded);
  } else if (val == 'facades') {
    pix2pix = ml5.pix2pix('model/facades_BtoA.pict', modelLoaded);
  } else if (val == 'handbags') {
    pix2pix = ml5.pix2pix('model/edges2handbags_AtoB.pict', modelLoaded);
  } else if (val == 'cats') {
    pix2pix = ml5.pix2pix('model/edges2cats_AtoB.pict', modelLoaded);
  }  else if (val == 'humans') {
    pix2pix = ml5.pix2pix('model/humanseg_BtoA.pict', modelLoaded);
  }
}

//load mask from file
function handleFile(file) {
  //print(file);

  if (file.type === 'image') {
    // Display initial input image
  inputImg = loadImage(file.data, drawImage);

  } else {
    img = null;
  }  
}

//mouse release callback function
function mouseReleased() {
  console.log('painting');
}