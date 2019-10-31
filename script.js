"use strict"
let canvasX = 10;
let canvasY = 10;

function draw(marker, context) {
  context.beginPath();
  
	context.arc(marker.x-canvasX, marker.y-canvasY, 10, 0, 2 * Math.PI);
	context.fill();
}

function drawAll(markers, context) {
  for (let i=0; i < markers.length; i++) {
    draw(markers[i], context);
  }
}

function Marker(x, y) {
  this.x = x;
  this.y = y;
}

function WalkingMarker(x, y) {
  this.x = x;
  this.y = y;

  this.move = (dx, dy) => {
    this.x = this.x + dx;
    this.y = this.y + dy;
  }
}

function next(walkerDirection, markerCount) {
  if (walkerDirection < markerCount - 1) {
    return walkerDirection + 1;
  } else {
    return 0;
  }
}


function Plot(width, height, id) {
  if ((width <= 0) || (height <= 0)) {
    throw new Exception("Sizes of plot must be positive.");
  }

  let canvas = document.getElementById(id);
  this.width  = width;
  this.height = height;
  
  canvasX=canvas.clientLeft;
  canvasY=canvas.clientTop;

  canvas.width  = this.width;
  canvas.height = this.height;

  const context = canvas.getContext("2d");

  let markers = [];

  let walker = new WalkingMarker(0, 0);  
  let walkerDirection = 0;
  let dx = 0;
  let dy = 0;
  let step = 0;

  this.setMarkers = (markers_) => {
    markers = marker_;
  }

  canvas.onclick = function(event) {
    let marker = new Marker(event.offsetX, event.offsetY);
    markers.push(marker);
    context.clearRect(0, 0, width, height);
    drawAll(markers, context);

    if (markers.length >= 2) {
      walker.x=markers[0].x;
      walker.y=markers[0].y;
      step=0;
      walkerDirection=0;
    }
    addLog("PutMarker("+marker.x.toString()+", "+marker.y.toString()+")");
  }

  this.lookAfterSignal = () => {
    if (signal == "Undo") {
      signal = "No_Signal";
      markers.pop();      
      walker.x = markers.length > 0 ? markers[0].x : 0;
      walker.y = markers.length > 0 ? markers[0].y : 0;
      step=0;
      walkerDirection=0;     
      if (markers.length <= 2) {
        context.clearRect(0, 0, width, height);
        drawAll(markers, context);
      } 
      addLog("Undo");
    }
    if (signal == "Clear") {
      signal = "No_Signal";
      markers = [];
      walker.x = 0;
      walker.y = 0;
      step=0;
      walkerDirection=0;
      context.clearRect(0, 0, width, height);
      drawAll(markers, context);
      addLog("Clear");
    }
  }

  this.play = () => {
    if (markers.length >= 2) {
      if (step >= 100) {
        walkerDirection = next(walkerDirection, markers.length);
        step = 0;
      }
      dx = (markers[next(walkerDirection, markers.length)].x-markers[walkerDirection].x)/100.0;
      dy = (markers[next(walkerDirection, markers.length)].y-markers[walkerDirection].y)/100.0;
      
      walker.move(dx, dy);

      context.clearRect(0, 0, width, height);
      drawAll(markers, context);
      draw(walker, context);
      step++;
    }
  }
}

let signal = "No_Signal";

function signalUndo() {
  signal = "Undo";
}

function signalClear() {
  signal = "Clear";
}

let log = [];

function addLog(message) {
  if (log.length < 20) {
    log.push(message);
  } else {
    log.shift();
    log.push(message);
  }
}

function logShow() {
  alert(log);
}


function main() {
  let plot = new Plot(800, 600, "plot")

  setInterval(() => {
		plot.play();
    plot.lookAfterSignal();
	}, 0);
}
