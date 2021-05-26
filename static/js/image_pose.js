let img;
let model;

$("#image-selector").change(function () {
    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;
        $("#selected-image").attr("src", dataURL);
        $("#prediction-list").empty();
    }

    let file = $("#image-selector").prop('files')[0];
    reader.readAsDataURL(file);
});


$(document).ready(async function () {
    $('.progress-bar').show();
    // Initialize the Image Classifier method with MobileNet
    model = ml5.imageClassifier('../imagemodel/model.json', modelLoaded);

    // When the model is loaded
    function modelLoaded() {
      console.log('Model Loaded!');
    }

    $('.progress-bar').hide();
});

$("#predictBtn").click(async function () {
    let image = $('#selected-image').get(0);
    model.classify(image, gotResult);
        
});
// A function to run when we get any errors and the results
function gotResult(error, results) {
  // Display error in the console
  if (error) {
    console.error(error);
  }
  // The results are in an array ordered by confidence.
  console.log(results);
  let order = Array.from(results);
  $("#prediction-list").empty();
    order.forEach(function (c) {
        $("#prediction-list").append(`<li>${c.label} Pose: ${parseInt(Math.trunc(c.confidence * 100))} %</li>`);
    });
}
