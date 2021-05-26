let video;
let poseNet;
let pose;
let skeleton;
let confidence;
let brain;
let poseLabel = "No Pose";
let playing = false;
let button;

let width=400;
let height=550;

function setup() {
  let cnv = createCanvas(width, height);
  cnv.position(100, 150);
  // For webcam video capture
  //video = createCapture(VIDEO);

  // For captured video (.mp4) format
  video = createVideo(
    ['../data/meditation1.mp4'],
    vidLoad
  );

  video.size(width, height);

  button = createButton('Play Video');
  button.position(650, 200);
  button.mousePressed(toggleVid);

  video.hide();

  $('.progress-bar').show();
  poseNet = ml5.poseNet(video, modelLoaded);

  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: '../bodypose/model.json',
    metadata: '../bodypose/model_meta.json',
    weights: '../bodypose/model.weights.bin',
  };
  
  brain.load(modelInfo, brainLoaded);


}

// This function is called when the video loads
function vidLoad() {
  video.volume(0);
  //video.play();  
}

// plays or pauses the video depending on current state
function toggleVid() {
  if (playing) {
    video.pause();
    button.html('play');
  } else {
    video.play();
    button.html('pause');
  }
  playing = !playing;
}

function brainLoaded() {
  select('#label1').html('pose classification ready');
  console.log('pose classification ready!');
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
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
    select('#label1').html(poseLabel);
    select('#accuracy').html(`Accuracy: <div class="progress">
              <div class="progress-bar" role="progressbar" style="width:${percent}%" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">${percent} %</div>
            </div>`);
  }
  //console.log(results[0].confidence);
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  select('#label1').html('poseNet ready');
  console.log('poseNet ready');
  $('.progress-bar').hide();
}

function draw() {
  push();
  //translate(video.width, 0);
  //scale(-1, 1);
  scale(1, 1);
  if (video.loadedmetadata) {
    image(video, 0, 0, width, height);

    if (pose) {
      for (let i = 0; i < skeleton.length; i++) {
        let a = skeleton[i][0];
        let b = skeleton[i][1];
        strokeWeight(2);
        stroke(0);

        line(a.position.x, a.position.y, b.position.x, b.position.y);
      }
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        fill(0);
        stroke(255);
        ellipse(x, y, 16, 16);
      }
    }
    pop();

    fill(255, 0, 255);
    noStroke();
  }
}
