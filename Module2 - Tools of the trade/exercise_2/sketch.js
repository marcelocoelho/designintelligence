/*/////////////////////////////////////////////////////

Exercise 2 code sample for Design Intelligence 

/////////////////////////////////////////////////////*/


let featureExtractor;
let classifier;
let video;
let loss;

// training classes
let class1 = 0;
let class2 = 0;
let class3 = 0;
let noclass = 0;


let poseNet;
let poses = [];


// colors used for drawing
let currentcolor= {r:0, g:0, b: 0};
let color1= {r:255, g:0, b: 0};
let color2= {r:0, g:255, b: 0};
let color3= {r:0, g:0, b: 255};

let lastColor;
let isdrawing=false;



function setup() {

  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);    // video for PoseNet

  // Initialize PoseNet
  poseNet = ml5.poseNet(video, modelReady );

  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });

  // Hide the video element, and just show the canvas
  // video.hide();

  // Extract the already learned features from MobileNet
  // https://learn.ml5js.org/#/reference/feature-extractor
  featureExtractor = ml5.featureExtractor("MobileNet", modelReady);

  // Create a new classifier for 4 labels using those features and pass the video we want to use
  const options = { numLabels: 4 };
  classifier = featureExtractor.classification(video, options);

  // Set up the UI buttons
  setupButtons();
}



function draw() {

  // draw circles based on hand position
  if (isdrawing){
    tint(255,0)
    paintCircles();
  } 
  
  // draw keypoints and skeleton
  if(!isdrawing){
    image(video, 0, 0, width, height);
    background(0);
    drawKeypoints();  // draws key points of the skeleton
    drawSkeleton();   // draws stick figure
  }

console.log(poses);

  // Note: you can call both if statements to draw all keypoints and the skeletons
  }


// This function gets called when the model has been loaded
function modelReady() {
  select("#modelStatus").html("MobileNet Loaded!");

  // If you want to load a pre-trained model at the start
  // classifier.load('./model/model.json', function() {
  //   select('#modelStatus').html('Custom Model Loaded!');
  // });
}

// Classify the current frame to decide what color to paint with
function classify() {

  classifier.classify(gotResults);
}

// Start drawing when button pressed
function startDrawing(){

  isdrawing=!isdrawing;
}


// A util function to create UI buttons
function setupButtons() {
  
  // When the button is pressed, add the current frame
  buttonA = select("#class1");
  buttonA.mousePressed(function() {
    classifier.addImage("class 1");
    select("#amountOfClass1Images").html((class1 += 1));
  });

  // same as above, but now add it to a different class
  buttonB = select("#class2");
  buttonB.mousePressed(function() {
    classifier.addImage("class 2");
    select("#amountOfClass2Images").html((class2 += 1));
  });

  // And so it goes.
  buttonC = select("#class3");
  buttonC.mousePressed(function() {
    classifier.addImage("class 3");
    select("#amountOfClass3Images").html((class3 += 1));
  });

  //
  buttonD = select("#NoClass");
  buttonD.mousePressed(function() {
    classifier.addImage("no class");
    select("#amountOfneutral").html((noclass += 1));
  });

  // Train Button
  train = select("#train");
  train.mousePressed(function() {
    classifier.train(function(lossValue) {
      if (lossValue) {
        loss = lossValue;
        select("#loss").html(`Loss: ${loss}`);
      } else {
        select("#loss").html(`Done Training! Final Loss: ${loss}`);
      }
    });
  });

  // Predict Button
  buttonPredict = select("#buttonPredict");
  buttonPredict.mousePressed(classify);

  // start Drawing
  buttonPredict = select("#buttonDraw");
  buttonPredict.mousePressed(startDrawing);

  // Save model
  saveBtn = select("#save");
  saveBtn.mousePressed(function() {
    classifier.save();
  });

  // Load model
  loadBtn = select("#load");
  loadBtn.changed(function() {
    classifier.load(loadBtn.elt.files, function() {
      select("#modelStatus").html("Custom Model Loaded!");
    });
  });
}


// Show the results
function gotResults(err, results) {

  // Display any error
  if (err) {
    console.error(err);
  }

  // according to prediction results change color of brush
  if (results && results[0]) {
    select("#result").html(results[0].label);
    select("#confidence").html(`${results[0].confidence.toFixed(2) * 100  }%`);
    classify();                       // go classify the input again
    changeColor(results[0].label);    // go change brush color 
  }
}


// Use predicted color to change the color of hand brush
function changeColor(prediction){

  if (prediction == 'class 1')
  {
    currentcolor = color1;
    lastColor = currentcolor;
  }
  if (prediction == 'class 2')
  {
    currentcolor = color2;
    lastColor= currentcolor;

  }
  if (prediction == 'class 3')
  {
    currentcolor = color3;
    lastColor= currentcolor;

  }
  if (prediction == 'no class')
  {
    currentcolor = lastColor;
  }
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  //let nose = pose['hand'];
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    //console.log(pose);
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        if(!isdrawing){
          ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        }
      }
    }
  }
}



// A function to draw ellipses over the detected keypoints
function paintCircles()  {
  //let nose = pose['hand'];
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    //console.log(pose);
    for (let j = 0; j < pose.keypoints.length; j++) {

      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let leftHand = pose.keypoints[10];

      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (leftHand.score > 0.2) {
        noStroke();       
        fill(currentcolor.r,currentcolor.g,currentcolor.b);
        ellipse(leftHand.position.x, leftHand.position.y, 50, 50);
      }
    }
  }
}


// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      if(!isdrawing){
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
      }
    }
  }
}


// Press key to turn fullscreen mode on/off 
function keyPressed() {
  if (key == "f") {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

