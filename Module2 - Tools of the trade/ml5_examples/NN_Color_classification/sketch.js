/*///////////////////////////////

Simple Color Classifier

//////////////////////////////*/

// Main neural network object
let neuralNetwork;

// UI elements
let labelP;
let lossP;
let submitButton;
let rSlider, gSlider, bSlider;


function setup() {

  // Creates a <p></p> element in the DOM with given inner HTML
  // this displays training epoch and loss
  lossP = createP('loss');

  // color is displayed here
  createCanvas(100, 100);

  // displays color label
  labelP = createP('label');

  // The RGB sliders for manipulating input colors
  rSlider = createSlider(0, 255, 255);
  gSlider = createSlider(0, 255, 0);
  bSlider = createSlider(0, 255, 255);

  // configuring the neural network
  const nnOptions = {
    dataUrl: 'data/colorData.json',   // data source
    inputs: ['r', 'g', 'b'],          // network inputs 
    outputs: ['label'],               // network output
    task: 'classification',           // what we want it to do
    debug: true                       // show debugging window so we can see how training is performing   
  };
  
  // Instantiate it and setup callback
  neuralNetwork = ml5.neuralNetwork(nnOptions, modelReady);
}

// Once NN is ready, normalize data and configure training
function modelReady() {
  
  // Normalize input data
  neuralNetwork.normalizeData();
  // console.log(neuralNetwork.neuralNetworkData.data.raw) // output raw data pre normalization
  // console.log(neuralNetwork.data.training) // output normalized data xs: {r: 0.3176470588235294, g: 0.7176470588235294, b: 0.6078431372549019}
  // In this example, pre-normalized it looks like this: xs: {r: 81, g: 183, b: 155}
  // Post-normalized it looks like this: xs: {r: 0.3176470588235294, g: 0.7176470588235294, b: 0.6078431372549019}
     

  // Configure training parameters
  const trainingOptions = {
    epochs: 20,               // epoch = number of times that the learning algorithm will work through the entire training dataset. 
    batchSize: 64             // data samples are split into batches. batchSize = number of images in each batch that are processed before model is updated
                              // weights are updated after each batch is processed
  }

  // Start training                   // two different callbacks here
  neuralNetwork.train(trainingOptions, whileTraining, finishedTraining);
  
  // Start guessing while training!
  classify();

}
        // this is callback is called after each epoch
function whileTraining(epoch, logs) {
  lossP.html(`Epoch: ${epoch} - loss: ${logs.loss.toFixed(2)}`);
}

        // this callback is called when done training. 
function finishedTraining(anything) {
  console.log('done!');
}

// go make a prediction based on current slider values
function classify() {
  
  // put slides values into a single javascript data object
  const inputs = {
    r: rSlider.value(),
    g: gSlider.value(),
    b: bSlider.value()
  }

  // pass input to neural network and set callback for results when done making prediction
  neuralNetwork.classify([inputs.r, inputs.g, inputs.b], gotResults);
}

function gotResults(error, results) {

  // print error if any
  if (error) {
    console.error(error);
  
  } else {
    
    // display results on web page
    labelP.html(`label:${results[0].label}, confidence: ${results[0].confidence.toFixed(2)}`);
    // now that we are done classifying, go do it again
    classify();
  }
}

function draw() {
  background(rSlider.value(), gSlider.value(), bSlider.value());
}