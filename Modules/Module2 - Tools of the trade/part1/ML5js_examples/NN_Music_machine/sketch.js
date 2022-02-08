/*
Regression Example for Design Intelligence at MIT
Based on ML5 regression examples 
Code modified by Diego Pinochet
*/
//#####Parameters#######

// The brain - a.k.a the model
let pixelBrain;

// The video and pixel scale
let video;
let ready = false;
const videoSize = 10;

// For sound synthesis
const playing = false;
let frequency;
let osc;

// Going to normalize the data myself here
const freqMax = 800;

//#####Initial setup#######
function setup() {
  createCanvas(200, 200);

  
  // Create the video and set resolution
  video = createCapture(VIDEO, videoReady);
  video.size(videoSize, videoSize);
  video.hide();

  // Inputs are total pixels times 3 (RGB)
  const totalPixels = videoSize * videoSize * 3;
  const options = {
    inputs: totalPixels,
    outputs: 1,
    learningRate: 0.01,
    task: "regression",
    debug: true,
  };
  // Create the model
  pixelBrain = ml5.neuralNetwork(options);
  
  freqSlider = createSlider(0, 800, 200);
  freqSlider.input(updateFreqText)
  
  //frequency label 
  labelF = createP('Freq: ' + freqSlider.value());


  // Buttons add trainin data and train model
  select("#addExample").mousePressed(addExample);
  select("#train").mousePressed(trainModel);
}

// Video callback
function videoReady() {
  ready = true;
}


//#####Loop function#######
function draw() {
  //background color 
  background(0);
  if (ready) {
    //Downsample the video as a low res image
    const w = width / videoSize;
    video.loadPixels();
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

//Add example based on the frequency 
function addExample() {
  //get the frequency from the frequency input 
  // const freq = parseFloat(select("#frequency").value());
  const freq = parseFloat(freqSlider.value());
  video.loadPixels();
  const inputs = getInputs();
  // Manual normalization of frequency
  pixelBrain.addData(inputs, [freq / freqMax]);
}

//Training function
function trainModel() {
  // Manually normalizing here!
  // pixelBrain.normalizeData();
  pixelBrain.train({ epochs: 50 }, finishedTraining);
}

//Training callback (starts the sound and the prediction)
function finishedTraining() {
  console.log("done");

  //Sound on 
  osc = new p5.Oscillator();
  osc.setType("sine");
  osc.amp(0.5);
  osc.freq(440);
  osc.start();
  osc.amp(0.5);

  //Start the prediction (returns single value)
  predict();
}

//prediction function
function predict() {
  const inputs = getInputs();
  pixelBrain.predict(inputs, gotFrequency);
}

//frequency callback
function gotFrequency(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // Manual "un-normalization"
  frequency = parseFloat(results[0].value) * freqMax;

  // Display frequency
  select("#prediction").html(frequency.toFixed(2));
  // Set frequency
  osc.freq(parseFloat(frequency));
  // Predict again
  predict();
}

function updateFreqText(){
  labelF.html(`Freq:${freqSlider.value()}`);
}