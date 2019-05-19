/*
This is the websocket library which will allow us to send messages
back to the web server
*/

var socket = io('http://10.225.161.133:8000');

var imgs = [];
var canv;
var img;
var w;
var h;
var width;
var height;
var filterIndex = 0;
var filterIntensity = 1;
var filterNameDiv;
var filterIntensityDiv;
var imageIndex = 0;

function f1() {
	var indexOffset = {
		first: 11*filterIntensity,
		second: 8*filterIntensity,
		third: 16*filterIntensity
	};
	var colorOffset = {
		red: 0.02*filterIntensity,
		blue: 0.04/filterIntensity,
		green: 1+filterIntensity
	};
	var stepSize = 2;
	for (var x = 0; x < video.width; x += stepSize) {
	  for (var y = 0; y < video.height; y += stepSize) {
	    var index = ((y*video.width) + x) * 4;
			var redVal = video.pixels[(index + indexOffset.first) % video.pixels.length];
			redVal /= colorOffset.red;
			var greenVal = video.pixels[(index + indexOffset.second) % video.pixels.length];
			greenVal /= colorOffset.green;
			var blueVal = video.pixels[(index + indexOffset.third) % video.pixels.length];
			blueVal /= colorOffset.blue;
			set(x,y, color(redVal, greenVal, blueVal));
			img.set(x,y, color(redVal, greenVal, blueVal));
	  }
	}
	updatePixels();
	img.updatePixels();
}

function f2() {
	var indexOffset = {
		first: 3*filterIntensity,
		second: 19*filterIntensity,
		third: 28*filterIntensity
	};

	var colorOffset = {
		red: 0.1*filterIntensity,
		blue: 0.7*filterIntensity,
		green: 0.3*filterIntensity
	};

	var stepSize = 2;
	for (var x = 0; x < video.width; x += stepSize) {
	  for (var y = 0; y < video.height; y += stepSize) {
	    var index = ((y*video.width) + x) * 8;
			var redVal = video.pixels[((video.pixels.length - indexOffset.second) + index) % video.pixels.length];
			redVal /= colorOffset.red;
			var greenVal = video.pixels[((video.pixels.length - indexOffset.first) + index) % video.pixels.length];
			greenVal /= colorOffset.green;
			var blueVal = video.pixels[((video.pixels.length - indexOffset.third) + index) % video.pixels.length];
			blueVal /= colorOffset.blue;
			set(x,y, color(redVal, greenVal, blueVal));
			img.set(x,y, color(redVal, greenVal, blueVal));
	  }
	}
	updatePixels();
	img.updatePixels();
}

function f3() {
	var indexOffset = {
		first: 37*filterIntensity,
		second: (2-filterIntensity)%filterIntensity,
		third: (3/filterIntensity)-filterIntensity/2
	};

	var colorOffset = {
		red: 0.1*filterIntensity,
		blue: 0.7*filterIntensity,
		green: 0.3*filterIntensity
	};

	var stepSize = 2;
	for (var x = 0; x < video.width; x += stepSize) {
	  for (var y = 0; y < video.height; y += stepSize) {
	    var index = ((y*video.width) + x) * 4;
			var redVal = video.pixels[index+indexOffset.second];
			redVal /= colorOffset.red;
			var greenVal = video.pixels[index+indexOffset.first];
			greenVal -= colorOffset.green;
			var blueVal = video.pixels[index+indexOffset.third];
			blueVal *= colorOffset.blue;
			set(x,y, color(redVal, greenVal, blueVal));
			img.set(x,y, color(redVal, greenVal, blueVal));
	  }
	}
	updatePixels();
	img.updatePixels();
}

var filterFunctions = [
	f1,
	f2,
	f3
];

function setup() {
	width = windowWidth;
	height = windowHeight - 20;
	w = (width-height)/3;
	h = height/4;
	canv = createCanvas(width, height);
	video = createCapture(VIDEO);
	video.size(height, height);
	img = createImage(video.width, video.height);
	filterNameDiv = createDiv("Filter: "+(filterIndex+1)+"/"+filterFunctions.length);
	filterNameDiv.style('font-size', '18px');
	filterNameDiv.style('color', '#ffffff');
	filterNameDiv.position(height/2-200, height-20);
	filterIntensityDiv = createDiv("Intensity: "+filterIntensity);
	filterIntensityDiv.style('font-size', '18px');
	filterIntensityDiv.style('color', '#ffffff');
	filterIntensityDiv.position(height/2, height-20);
	video.hide();
}

function takeSnap() {
	console.log("taking a picture");
	imgs.push(img.get());
}

// change the filter if we receive a message to change from server
socket.on("changeFilter", (data) => {
	console.log("got a changeFilter request " + data);
	filterIndex = data % filterFunctions.length; // (filterIndex + 1) % filterFunctions.length;
	filterNameDiv.html("Filter: "+(filterIndex+1)+"/"+filterFunctions.length);
});

socket.on("changeIntensity", (data) => {
	console.log("got a changeIntensity request " + data);
	filterIntensity = data % 6;
	filterIntensityDiv.html("Intensity: "+filterIntensity);
})

socket.on("takeSnap", takeSnap);

function draw() {
	background(51, 200);
	video.loadPixels();

	var x = height, y = 0;
	for(var i=0;i<imgs.length;i++) {
		image(imgs[i], x,y,w,h);
		x += w;
		if(x >= canv.width) {
			x = height;
			y += h;
			if(y >= canv.height) {
				y = 0;
			}
		}
	}

	noFill();
	strokeWeight(4);
	stroke(0, 255, 0);
	rect(x,y,w,h); // draws bounding box around image slot
	noStroke();
	filterFunctions[filterIndex]();
	// image(img, 0, 0, height, height);
}
