// https://developers.facebook.com/docs/graph-api/reference/v2.6/user/photos
(function() {
	var	width, height, container, video, canvas, context, draggables, dragging, user, 
	redo_button, takePhoto_button, share_button, logout_button, upload_button,
	camera_enabled;

	function not_blank(object) {
		return !(object === null || object === undefined || object.trim() === "");
	}

	function drag(e) {
		dragging = document.getElementById(e.target.id);
	}

	function release(e) {
		moveImage(e);
		dragging = null;
	}

	function moveImage(e) {
		if(dragging !== null) {
			dragging.style.top = (e.clientY - dragging.parentElement.offsetTop - dragging.offsetHeight/2) + "px";
			dragging.style.left = (e.clientX - dragging.parentElement.offsetLeft - dragging.offsetWidth/2) + "px";
		}
	}

	function logoutUser() {
		FB.logout(function(response) {
			user = "";
			console.log(response);
			logout_button.style.display = "none";
		});
	}

	function doShare() {
		preparePhoto();

		var data = canvas.toDataURL('image/png');
		var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
		var decodedPng = Base64Binary.decode(encodedPng);

		FB.login(function(response) {
			if (response.status === "connected") {
				var auth = response.authResponse.accessToken;
				postImageToFacebook(auth, "photo", "image/png", decodedPng, "");
				logout_button.style.display = "block";
		  }
		}, {scope: "publish_actions"});
	}

	// https://gist.github.com/andyburke/1498758
	function postImageToFacebook(authToken, filename, mimeType, imageData, message ) {

		if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
		  XMLHttpRequest.prototype.sendAsBinary = function(string) {
		    var bytes = Array.prototype.map.call(string, function(c) {
		        return c.charCodeAt(0) & 0xff;
		    });
		    this.send(new Uint8Array(bytes).buffer);
		  };
		}

    // this is the multipart/form-data boundary we'll use
    var boundary = '----Img';
    // let's encode our image file, which is contained in the var
    var formData = '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n';
    formData += 'Content-Type: ' + mimeType + '\r\n\r\n';
    for ( var i = 0; i < imageData.length; ++i ) {
        formData += String.fromCharCode( imageData[ i ] & 0xff );
    }
    formData += '\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="message"\r\n\r\n';
    formData += message + '\r\n';
    formData += '--' + boundary + '--\r\n';

    var xhr = new XMLHttpRequest();
    xhr.open( 'POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true );
    xhr.onerror = xhr.onload = function() {
      console.log( xhr.responseText );
    };
    xhr.setRequestHeader( "Content-Type", "multipart/form-data; boundary=" + boundary );
    xhr.sendAsBinary(formData);
	}

	function clear() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function handleImage(e) {
		var reader = new FileReader();
    
    reader.onload = function(event){
      var up_img = new Image();
      up_img.onload = function(){
        context.drawImage(up_img, 0, 0, canvas.width, canvas.height);
      };
      up_img.src = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
    
    canvas.style.display = "block";
    video.style.display = "none";

    takePhoto_button.style.display = "none";
		upload_button.style.display = "none";
		redo_button.style.display = "block";
		share_button.style.display = "block";
	}

	function preparePhoto() {
		if(draggables.length !== 0) {
			for(var i in draggables) {
				var img = document.getElementById(draggables[i]);
				if(isInside(img, canvas)) {
					context.drawImage(img, img.offsetLeft-canvas.offsetLeft, img.offsetTop-canvas.offsetTop, img.offsetWidth, img.offsetHeight);
				}
				// img.style.display = "none";
			}
		}
	}

	function takePhoto() {
		clear();
		canvas.style.display = "block";

		context.drawImage(video, ((width - video.offsetWidth) / 2), 0, video.offsetWidth, height);
		video.style.display = "none";

		takePhoto_button.style.display = "none";
		upload_button.style.display = "none";
		redo_button.style.display = "block";
		share_button.style.display = "block";
	}

	function redo() {
		clear();

		if(draggables.length !== 0) {
			for(var i in draggables) {
				document.getElementById(draggables[i]).style.display = "block";
			}
		}
		upload_button.style.display = "block";
		upload_button.value = "";
		redo_button.style.display = "none";
		share_button.style.display = "none";

		if(camera_enabled) {
			takePhoto_button.style.display = "block";
			video.style.display = "block";
			canvas.style.display = "none";
		}
	}

	function isInside(obj1, obj2) {
		o1x1 = obj1.offsetLeft;
		o1x2 = obj1.offsetLeft + obj1.offsetWidth;
		o2x1 = obj2.offsetLeft;
		o2x2 = obj2.offsetLeft + obj2.offsetWidth;

		o1y1 = obj1.offsetTop;
		o1y2 = obj1.offsetTop + obj1.offsetHeight;
		o2y1 = obj2.offsetTop;	
		o2y2 = obj2.offsetTop + obj2.offsetHeight;
		
		return ((o1x2 > o2x1 && o1x2 < o2x2) || (o1x1 > o2x1 && o1x1 < o2x2)) &&
					((o1y2 > o2y1 && o1y2 < o2y2) || (o1y1 > o2y1 && o1y1 < o2y2));
	}
	
	function start(container, options) {
		container = document.getElementById(not_blank(container) ? container : "webcam");
		container.style.overflow = "hidden";
		width = container.offsetWidth;
		height = container.offsetHeight;

		video = document.createElement("video");
		container.appendChild(video);
		video.id = "webcam-video";
		video.style.width = (height / (3 / 4)) + "px";
		video.style.height = height + "px";
		video.style.display = "block";
		video.style.position = "relative";
		video.style.marginLeft = ((width - video.offsetWidth) / 2) + "px";

		canvas = document.createElement("canvas");
		container.appendChild(canvas);
		canvas.id = "webcam-canvas";
		canvas.width = width;
		canvas.height = height;
		canvas.style.display = "none";
		canvas.style.position = "relative";

		context = canvas.getContext("2d");

		draggables = options.draggables;
		dragging = null;

		redo_button = document.getElementById(not_blank(options.redo) ? options.redo : "redo");
		takePhoto_button = document.getElementById(not_blank(options.takePhoto) ? options.takePhoto : "takePhoto");
		share_button = document.getElementById(not_blank(options.share) ? options.share : "share");
		logout_button = document.getElementById(not_blank(options.logout) ? options.logout : "logout");
		upload_button = document.getElementById(not_blank(options.upload) ? options.upload : "upload");
		
		redo_button.addEventListener("click", redo);
		takePhoto_button.addEventListener("click", takePhoto);
		share_button.addEventListener("click", doShare);
		logout_button.addEventListener("click", logoutUser);
		upload_button.addEventListener('change', handleImage, false);

		document.addEventListener("mousemove", moveImage);
		document.addEventListener("mouseup", release);

		if(draggables.length !== 0) {
			for(var i in draggables) {
				var item = document.getElementById(draggables[i]);
				item.setAttribute("draggable", false);
				item.addEventListener("mousedown", drag);
			}
		}

		navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		navigator.getUserMedia({ video: true }, function(stream) {
			console.log("streaming...");
			camera_enabled = true;
			video.src = window.URL.createObjectURL(stream);
			video.addEventListener("canplaythrough", function() {
				video.play();
			});
		}, function(error) {
			console.error(error);
			console.error("Could not find camera... Upload a photo instead...");
			camera_enabled = false;
			video.style.display = "none";
			takePhoto_button.style.display = "none";
			canvas.style.display = "block";
		});
	}

	window.webcam = {};
	window.webcam.start = start;
})();

// Add later:
// function startStream(stream) {
// 		console.log("streaming...");
// 		camera_enabled = true;
// 		video.src = window.URL.createObjectURL(stream);
// 		video.addEventListener("canplaythrough", function() {
// 			video.play();
// 		});
// 		video.play();
// 	}

// 	function notStreaming(error) {
// 		console.error(error);
// 		console.error("Could not find camera... Upload a photo instead...");
// 		camera_enabled = false;
// 		video.style.display = "none";
// 		takePhoto_button.style.display = "none";
// 		canvas.style.display = "block";
// 	}
	
// 	function start(container, options) {
// 		container = document.getElementById(not_blank(container) ? container : "webcam");
// 		container.style.overflow = "hidden";
// 		width = container.offsetWidth;
// 		height = container.offsetHeight;

// 		video = document.createElement("video");
// 		container.appendChild(video);
// 		video.id = "webcam-video";
// 		video.style.width = (height / (3 / 4)) + "px";
// 		video.style.height = height + "px";
// 		video.style.display = "block";
// 		video.style.position = "relative";
// 		video.style.marginLeft = ((width - video.offsetWidth) / 2) + "px";

// 		canvas = document.createElement("canvas");
// 		container.appendChild(canvas);
// 		canvas.id = "webcam-canvas";
// 		canvas.width = width;
// 		canvas.height = height;
// 		canvas.style.display = "none";
// 		canvas.style.position = "relative";

// 		context = canvas.getContext("2d");

// 		draggables = options.draggables;
// 		dragging = null;

// 		redo_button = document.getElementById(not_blank(options.redo) ? options.redo : "redo");
// 		takePhoto_button = document.getElementById(not_blank(options.takePhoto) ? options.takePhoto : "takePhoto");
// 		share_button = document.getElementById(not_blank(options.share) ? options.share : "share");
// 		logout_button = document.getElementById(not_blank(options.logout) ? options.logout : "logout");
// 		upload_button = document.getElementById(not_blank(options.upload) ? options.upload : "upload");
		
// 		var upload = document.createElement("input");
// 		upload.type = "file";
// 		upload.accept = "image/*";
// 		upload.style.visibility = "hidden";
		
// 		share_button.style.display = "none";
// 		logout_button.style.display = "none";

// 		redo_button.addEventListener("click", redo);
// 		takePhoto_button.addEventListener("click", takePhoto);
// 		share_button.addEventListener("click", doShare);
// 		logout_button.addEventListener("click", logoutUser);
// 		// upload_button.addEventListener('change', handleImage, false);
// 		upload_button.addEventListener('click', function() { upload.click(); });
// 		upload.addEventListener('change', handleImage, false);

// 		document.addEventListener("mousemove", moveImage);
// 		document.addEventListener("mouseup", release);

// 		if(draggables.length !== 0) {
// 			for(var i in draggables) {
// 				var item = document.getElementById(draggables[i]);
// 				item.setAttribute("draggable", false);
// 				item.addEventListener("mousedown", drag);
// 			}
// 		}

// 		if (navigator.mediaDevices.getUserMedia) {
// 			navigator.mediaDevices.getUserMedia({ video: true }).then(startStream).catch(notStreaming);
// 		} else {
// 			navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
// 			navigator.getUserMedia({ video: true }, startStream, notStreaming);			
// 		}
// 	}