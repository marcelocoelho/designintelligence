/*
CUSTOM CNN classification with Webcam in ML5
code by Dieg Pinochet
*/

//initial parameters
let nn;
const IMAGE_WIDTH = 64;
const IMAGE_HEIGHT = 64;
const IMAGE_CHANNELS = 4;

//variables
let video;
let trainBtn;
let addDataBtn;
let labelInput;
let resultLabel;

function setup() {
  // load the pixels for each image to get a flat pixel array  
  createCanvas(400, 400);

  video = createCapture(VIDEO);
  video.size(64, 64)

  //create buttons
  trainBtn = createButton('train')
  trainBtn.mousePressed(train)
  addDataBtn = createButton('addData')
  addDataBtn.mousePressed(addData)
  resultLabel = createDiv('What I see:')

  //here you enter the label prompt for class creation on the go
  labelInput = createInput();
  labelCreation = createDiv('Before adding samples, please add a label')


  //custom network creation 
  const options = {
    task: 'imageClassification',
    debug: true,
    inputs:[IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    layers: [
        {
          type: 'conv2d',
          filters: 16,
          kernelSize: 3,
          strides: 1,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
        },
        {
          type: 'maxPooling2d',
          poolSize: [2, 2],
          strides: [2, 2],
        },
        {
          type: 'conv2d',
          filters: 32,
          kernelSize: 3,
          strides: 1,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
        },
        {
          type: 'maxPooling2d',
          poolSize: [2, 2],
          strides: [2, 2],
        }, 
        {
          type: 'conv2d',
          filters: 64,
          kernelSize: 3,
          strides: 1,
          activation: 'relu',
          kernelInitializer: 'varianceScaling',
        },
        {
          type: 'maxPooling2d',
          poolSize: [2, 2],
          strides: [2, 2],
        }, 
        {
          type: 'flatten',
        },
        {
          type: 'dense',
          units:128,
          kernelInitializer: 'varianceScaling',
          activation: 'relu',
        },
        {
          type: 'dense',
          kernelInitializer: 'varianceScaling',
          activation: 'softmax',
        },
      ]      
  }

  // construct the neural network
  nn = ml5.neuralNetwork(options);
  //nn.loadData('daytime_nightime.json', train)
}

function draw(){
  image(video, 0,0, width, height)
}

function addData(){
  console.log('adding data', labelInput.value())
  nn.addData({image:video}, {label: labelInput.value()})
}

function train(){
  // nn.normalizeData();

  const TRAINING_OPTIONS = {
    batchSize: 16,
    epochs: 100,
  }

  nn.normalizeData();
  nn.train(TRAINING_OPTIONS, finishedTraining)
}


function finishedTraining() {

  console.log("finished training");
  nn.classify([video], gotResults)

}

function gotResults(err, result) {
  if (err) {
    console.log(err);
    return
  }

  // image(video, 0,0, width, height)
  resultLabel.elt.textContent = `I see ${result[0].label}`

  nn.classify([video], gotResults);
  console.log(result[0].label);
}