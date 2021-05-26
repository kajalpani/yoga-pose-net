let video;
let pose;
let confidence;
let predictions = [];
let brain;
let poseLabel = "No Pose";

function setup() {
  let cnv = createCanvas(640, 480);
  cnv.position(100, 150);
  video = createCapture(VIDEO);

  $('.progress-bar').show();
  handpose = ml5.handpose(video, modelReady);
  
  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });

  // Hide the video element, and just show the canvas
  video.hide();

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: 'handmodel/model.json',
    metadata: 'handmodel/model_meta.json',
    weights: 'handmodel/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  select('#label1').html('pose classification ready! <br> Wait for the model to load');
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (predictions.length > 0) {
    //console.log(predictions);
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
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  
  if (results[0].confidence > 0.75) {
    confidence = results[0].confidence;
    poseLabel = results[0].label.toUpperCase();
    percent = parseInt(Math.trunc(confidence * 100));
    console.log(poseLabel);
    select('#label1').html(poseLabel);
    select('#accuracy').html(`Accuracy: <div class="progress">
              <div class="progress-bar" role="progressbar" style="width:${percent}%" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent} %</div>
            </div>`);
  }
  //console.log(results[0].confidence);
  classifyPose();
}

function modelReady() {
  select('#label1').html('Model ready!');
  console.log('Model ready!');
  $('.progress-bar').hide();
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
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