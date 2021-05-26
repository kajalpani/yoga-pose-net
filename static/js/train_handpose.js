let video;
let pose;
let brain;

let state = 'waiting';
let targeLabel;
let handpose;
let predictions = [];

function keyPressed() {
  if (key == 'T') {
    brain.normalizeData();
    brain.train({epochs: 50}, finished); 
  } else if (key == 'S') {
    brain.saveData();
  } else {
    targetLabel = key;
    select('#label1').html('Key pressed:'+targetLabel);
    console.log(targetLabel);
    setTimeout(function() {
      select('#label1').html('collecting');
      console.log('collecting');
      state = 'collecting';
      setTimeout(function() {
        select('#label1').html('not collecting');
        console.log('not collecting');
        state = 'waiting';
      }, 10000);
    }, 10000);
  }
}

function setup() {
  select('#label1').html("Please wait for the model to load..");
  let cnv = createCanvas(640, 480);
  cnv.position(100, 150);
  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
    gotPoses(predictions);
  });
  

  // Hide the video element, and just show the canvas
  video.hide();

  let options = {
    inputs: 34,
    outputs: 3,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
}

function gotPoses(predictions) {
  //console.log(predictions); 
  if (predictions.length > 0) {
    //pose = predictions[0];
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < predictions.length; i += 1) 
      {
        const prediction = predictions[i];
        for (let j = 0; j < prediction.landmarks.length; j += 1) 
        {
          const keypoint = prediction.landmarks[j];
          inputs.push(keypoint[0]);
          inputs.push(keypoint[1]);

        }
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}

function modelReady() {
  select('#label1').html('Model ready!');
  console.log("Model ready!");
}

function dataReady() {
  brain.normalizeData();
  brain.train({
    epochs: 50
  }, finished);
}

function finished() {
  select('#label1').html('model trained');
  console.log('model trained');
  brain.save();
  //classifyPose();
}


function draw() {
  push();
  translate(video.width,0);
  scale(-1, 1);
  //scale(1, 1);
  if (video.loadedmetadata) {
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
  }
  pop();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], 10, 10);
    }
  }
}