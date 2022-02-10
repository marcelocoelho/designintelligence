/*///////////////////////////////

Regression Example for Design Intelligence at MIT
Based on ML5 regression examples 
Code modified by Diego Pinochet

//////////////////////////////*/
//#####Parameters#######

// Main neural network object
let neuralNetwork;

// The video and downsampling size
let video;
let ready = false;
const videoSize = 10;

// For sound synthesis
const playing = false;
let frequency;
let osc;

// Normalizing frequency data by hand
const freqMax = 800;



function setup() {
  
  createCanvas(200, 200);
  
  video = createCapture(VIDEO, videoReady); // Create the video and set resolution
  video.size(videoSize, videoSize);         // downsample video feed
  video.hide();                             // and then hide it

 
  // Inputs are total pixels times 3 (RGB)
  const totalPixels = videoSize * videoSize * 3;
  
  // Configure neural network
  const options = {
    inputs: totalPixels,        
    outputs: 1,                 
    learningRate: 0.01,          
    task: "regression",
    debug: true,
  };
  // Create the model
  neuralNetwork = ml5.neuralNetwork(options);
  

  freqSlider = createSlider(0, 800, 200);
  freqSlider.input(updateFreqText)          //attach event listener so input is called when user moves slider
  
  //frequency label 
  labelF = createP('Freq: ' + freqSlider.value());


  // Attaching functions to these buttons references by # id
  select("#addExample").mousePressed(addExample);
  select("#train").mousePressed(trainModel);
}


// Video callback
function videoReady() {
  ready = true;
}



function draw() {

  //background color 
  background(0);

  // if video is ready to be displayed
  if (ready) {

    //Downsample the video as a low res image
    const w = width / videoSize;
    video.loadPixels();

    // draw the lower resolution pixels from video feed
    for (let x = 0; x < video.width; x += 1) {
      for (let y = 0; y < video.height; y += 1) {
        const index = (x + y * video.width) * 4;
        const r = video.pixels[index + 0];
        const g = video.pixels[index + 1];
        const b = video.pixels[index + 2];
        noStroke();
        fill(r, g, b);
        rect(x * w, y * w, w, w);
      }
    }
  }
}

//Get all the pixels in an image and store them in an array 
function getInputs() {

  video.loadPixels();

  // Create an array
  const inputs = [];
  for (let i = 0; i < video.width * video.height; i += 1) {
    const index = i * 4;

    //Normalize values (neural nets work better with normalized values)
    inputs.push(video.pixels[index + 0] / 255);
    inputs.push(video.pixels[index + 1] / 255);
    inputs.push(video.pixels[index + 2] / 255);
  }
  return inputs;
}

//Add data to the model. Include image pixels and frequency select by user.
function addExample() {

  //get the frequency from the frequency input 
  const freq = parseFloat(freqSlider.value());

  video.loadPixels();           // Loads the pixel data for the display window into the pixels[] array.
  const inputs = getInputs();   // This gets video input (downsampled and normalized) so we can use as input to train NN

  neuralNetwork.addData(inputs, [freq / freqMax]);    // Manual normalization of frequency
}

//Training function
function trainModel() {
 
  // train model in 50 epochs
  neuralNetwork.train({ epochs: 50 }, finishedTraining);
}

//Training callback (starts the sound and the prediction)
function finishedTraining() {

  console.log("done training");

  //Sound on 
  osc = new p5.Oscillator();
  osc.setType("sine");
  osc.amp(0.5);
  osc.freq(440);
  osc.start();
  osc.amp(0.5);

  // Start the prediction (returns single value)
  predict();
}

// prediction function
function predict() {
  const inputs = getInputs();
  neuralNetwork.predict(inputs, gotFrequency);  // feed input into neural network and capture output in 'gotFrequency' callback
}

// frequency callback --> this is the neural network output
function gotFrequency(error, results) {
  
  // if we have an error, go here
  if (error) {
    console.error(error);
    return;
  }
  
  // Manual "un-normalization"
  frequency = parseFloat(results[0].value) * freqMax;

  // Display frequency. Cap prediction value to 2 digits floating point
  select("#prediction").html(frequency.toFixed(2));

  // Set frequency
  osc.freq(parseFloat(frequency));
  
  // Predict again
  predict();
}

// Update frequency text on webpage
function updateFreqText(){
  labelF.html(`Freq:${freqSlider.value()}`);
}