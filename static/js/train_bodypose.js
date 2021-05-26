let poseNet;
let pose;
let skeleton;
let poses = [];
let brain;

let state = 'waiting';
let targeLabel;
let poseLabel = "";

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
    }, 1000);
  }
}

function setup() {
  select('#label1').html("Please wait for the model to load..");
  let cnv = createCanvas(640, 480);
  //let cnv = createCanvas(1280, 720);
  cnv.position(350, 150);
  /**let constraints = {
    video: {
      mandatory: {
        minWidth: 640,
        minHeight: 480
      },
      optional: [{ maxFrameRate: 10 }]
    },
    audio: false
  };
  video = createCapture(constraints, VIDEO);**/


  video = createVideo(
    ['../data/train_yoga2.mp4'],
    vidLoad
  );
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  
}

// This function is called when the video loads
function vidLoad() {
  video.volume(0);
  video.play();  
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
    poseLabel = results[0].label.toUpperCase();
  }
  classifyPose();
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


function gotPoses(poses) {
  // console.log(poses); 
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == 'collecting') {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}


function modelLoaded() {
  select('#label1').html('poseNet ready');
  console.log('poseNet ready');
}

function draw() {
  push();
  //translate(video.width, 0);
  scale(0.5, 0.4);
  if (video.loadedmetadata) {
    image(video, 0, 0, video.width, video.height);

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
    //textSize(512);
    //textAlign(CENTER, CENTER);
    //text(poseLabel, width / 2, height / 2);
  }
}