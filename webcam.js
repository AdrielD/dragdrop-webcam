(function() {
	console.log("hi");

	var	width, height, container, video, canvas, context, draggables, dragging;

	function not_blank(object) {
		return !(object === null || object === undefined || object.trim() === "");
	}

	function drag(e) {
		dragging = document.getElementById(e.srcElement.id);
		var peca = document.getElementById("peca");
		dragging.style.top = (e.clientY - peca.offsetTop) + "px";
		dragging.style.left = (e.clientX - peca.offsetLeft - 16) + "px";
	}

	function release() {
		dragging = null;
	}

	document.addEventListener("mouseup", release);

	document.addEventListener("mousemove", function(e) {
		if(dragging !== null) {
			// console.log(e);
			var peca = document.getElementById("peca");
			dragging.style.top = (e.clientY - peca.offsetTop) + "px";
			dragging.style.left = (e.clientX - peca.offsetLeft - 16) + "px";
		}
	});

	function clear() {
		// context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function takePhoto() {
		clear();
		// video.style.display = "none";
		// canvas.style.display = "block";

		// context.drawImage(video, 0, 0, width, height);

		if(draggables.length !== 0) {
			for(var i in draggables) {
				var img = document.getElementById(draggables[i]);
				// console.log(img);
				console.log(is_inside(img, canvas));
				if(is_inside(img, canvas)) {
					// context.drawImage(img, 0, 0, img.offsetWidth, img.offsetHeight);
					context.drawImage(img, img.offsetLeft-canvas.offsetLeft, img.offsetTop-canvas.offsetTop, img.offsetWidth, img.offsetHeight);
				}
			}
		}
	}

	function is_inside(obj1, obj2) {
		o1x1 = obj1.offsetLeft;
		o1x2 = obj1.offsetLeft + obj1.offsetWidth;
		o2x1 = obj2.offsetLeft;
		o2x2 = obj2.offsetLeft + obj2.offsetWidth;

		console.log("obj1: ", obj1.id);
		console.log("o1x1: ", o1x1);
		console.log("o1x2: ", o1x2);
		console.log("o2x1: ", o2x1);
		console.log("o2x2: ", o2x2);

		o1y1 = obj1.offsetTop;
		o1y2 = obj1.offsetTop + obj1.offsetHeight;
		o2y1 = obj2.offsetTop;	
		o2y2 = obj2.offsetTop + obj2.offsetHeight;
		
		return ((o1x2 > o2x1 && o1x2 < o2x2) || (o1x1 > o2x1 && o1x1 < o2x2)) &&
					((o1y2 > o2y1 && o1y2 < o2y2) || (o1y1 > o2y1 && o1y1 < o2y2));
	}
	
	function start(container, options) {
		container = document.getElementById(not_blank(container) ? container : "webcam");
		width = container.offsetWidth;
		height = container.offsetHeight;
		// height = width / (4 / 3);

		video = document.createElement("video");
		video.id = "webcam-video";
		video.style.width = width + "px";
		video.style.height = height + "px";
		video.style.display = "none";
		container.appendChild(video);

		canvas = document.createElement("canvas");
		canvas.id = "webcam-canvas";
		canvas.width = width;
		canvas.height = height;
		canvas.style.display = "block";
		container.appendChild(canvas);

		context = canvas.getContext("2d");

		draggables = options.draggables;
		dragging = null;

		if(draggables.length !== 0) {
			for(var i in draggables) {
				document.getElementById(draggables[i]).addEventListener("mousedown", drag);
			}
		}
	}

	window.webcam = {};
	window.webcam.start = start;
	window.webcam.takePhoto = takePhoto;

})();