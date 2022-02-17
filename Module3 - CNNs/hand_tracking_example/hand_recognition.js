//variables 

let handpose; //hand model 
let video;
let predictions = [];

let brain;
let state = 'waiting';
let label;
let isPredicting = false;

let labelPrediction;

function setup() {

    //initial setttings for canvas and video 
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);

    //create label with prediction 
    labelPrediction= createP('label');

    //create the model for hand detection 
    handpose = ml5.handpose(video, modelReady);

    //start detecting hands
    handpose.on("predict", results => {
        predictions = results;
    });

    //set model options 
    const options = {
        inputs: 21,
        outputs: 3,
        task: 'classification',
        debug: true
    };

    //create model for gesture classification
    brain = ml5.neuralNetwork(options, modelReady);

    video.hide();
}


//runs every frame and draw things on screen 
function draw() {
    image(video, 0, 0, width, height); 

    if(isPredicting){
        classify();
    }

    drawHand();
}

function keyPressed() {
    if (key == 't') {
        train();
    } else {
        label = key;
        console.log(label);
        setTimeout(function () {
            console.log('getting samples');
            state = 'collecting';
            setTimeout(function () {
                console.log('not getting more samples');
                state = 'waiting';
            }, 10000)
        }, 3000);
    }
}

//training function 
function train() {
    const training_options = {
        epochs: 100,
        batchSize: 64
    }
    //we train the model and call the finished training function 
    brain.train(training_options, finishTraining);
}

function finishTraining() {
    console.log('finished training');
    classify(); //this will start classifying our gestures
    isPredicting = !isPredicting;
}


function classify() {
    let inputs = [];
    for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j++) {
            const keypoint = prediction.landmarks[j];
            let x = keypoint[0];
            let y = keypoint[1];

            //calculate the centroid of the hand's bounding box 
            let vec1 = createVector(prediction.boundingBox.bottomRight[0], prediction.boundingBox.bottomRight[1]);
            let vec2 = createVector(prediction.boundingBox.topLeft[0], prediction.boundingBox.topLeft[1]);

            //centroid 
            let centroid = midPoint(vec1.x, vec1.y, vec2.x, vec2.y);

            //we calculate the distances dfrom each keyppoint to that reference centroid 
            let distance = dist(x, y, centroid[0], centroid[1]);

            //now we add the values to our training inputs list 
            inputs.push(1.0 / distance);
        }
    }

    //if we have enough keypoints detected .... perform the classification
    if (inputs.length >20){
        brain.classify(inputs, handleResults);
        state=='predicting';
    }
}

function handleResults(error, result){
    if (error){
        console.error(error);
        return;
    }
    console.log(result[0]); //the element with the highest prob. will be always the first element in the list.
    labelPrediction.html(`label:${result[0].label}, confidence: ${result[0].confidence.toFixed(2)}`); //we change the text according to the prediction
}

function modelReady() {
    console.log('model loaded');
}

function drawHand() {
    if (state == 'collecting') {
        addSample();
    }

    for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j++) {
            const keypoint = prediction.landmarks[j];
            fill(255, 0, 0);
            noStroke();
            ellipse(keypoint[0], keypoint[1], 10, 10);
        }
    }
}

function addSample() {
    let target = [label];
    let training_inputs = [];

    for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j++) {
            const keypoint = prediction.landmarks[j];
            let x = keypoint[0];
            let y = keypoint[1];
            let z = keypoint[2];
            console.log(z);

            //calculate the centroid of the hand's bounding box 
            let vec1 = createVector(prediction.boundingBox.bottomRight[0], prediction.boundingBox.bottomRight[1]);
            let vec2 = createVector(prediction.boundingBox.topLeft[0], prediction.boundingBox.topLeft[1]);

            //centroid 
            let centroid = midPoint(vec1.x, vec1.y, vec2.x, vec2.y);

            //we calculate the distances dfrom each keyppoint to that reference centroid 
            let distance = dist(x, y, centroid[0], centroid[1]);

            //now we add the values to our training inputs list 
            training_inputs.push(1.0 / distance);
        }
        console.log('adding samples to class: ' + label);
        //we add the data to our brain 
        brain.addData(training_inputs, target);
    }
}


function midPoint(x1, y1, x2, y2) {
    return [(x1 + x2) / 2, (y1 + y2) / 2];
}