// https://developers.facebook.com/docs/graph-api/reference/v2.6/user/photos
(function() {
	var	width, height, container, video, canvas, context, draggables, dragging, user, 
	redo_button, takePhoto_button, share_button, logout_button, upload_button;

	function not_blank(object) {
		return !(object === null || object === undefined || object.trim() === "");
	}

	function drag(e) {
		dragging = document.getElementById(e.target.id);
	}

	function release() {
		dragging = null;
	}

	function logoutUser() {
		FB.logout(function(response) {
			user = "";
			console.log(response);
		});
	}

	function doShare() {
		var data = canvas.toDataURL('image/png');
		var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
		var decodedPng = Base64Binary.decode(encodedPng);

		FB.login(function(response) {
			if (response.status === "connected") {
				var auth = response.authResponse.accessToken;
				FB.api('/me', function(response) {
				  // user.innerHTML = "Logged as: " + response.name;
				  user = response.name;
					// postImageToFacebook(auth, "photo", "image/png", decodedPng, text.value);
					postImageToFacebook(auth, "photo", "image/png", decodedPng, "");
				});
		  }
		  else {
		  	console.log("not logged");
		  }
		}, {scope: "publish_actions"});
	}

	// https://gist.github.com/andyburke/1498758
	function postImageToFacebook(authToken, filename, mimeType, imageData, message ) {

		// https://gist.github.com/andyburke/1498758
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
      var img = new Image();
      img.onload = function(){
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
	}

	function takePhoto() {
		clear();
		canvas.style.display = "block";

		context.drawImage(video, ((width - video.offsetWidth) / 2), 0, video.offsetWidth, height);
		video.style.display = "none";

		if(draggables.length !== 0) {
			for(var i in draggables) {
				var img = document.getElementById(draggables[i]);
				if(isInside(img, canvas)) {
					context.drawImage(img, img.offsetLeft-canvas.offsetLeft, img.offsetTop-canvas.offsetTop, img.offsetWidth, img.offsetHeight);
				}
				img.style.display = "none";
			}
		}

		document.getElementById("take-photo").style.display = "none";
		document.getElementById("redo").style.display = "inline-block";
	}

	function redo() {
		clear();

		if(draggables.length !== 0) {
			for(var i in draggables) {
				document.getElementById(draggables[i]).style.display = "block";
			}
		}

		document.getElementById("take-photo").style.display = "inline-block";
		document.getElementById("redo").style.display = "none";
		showVideoHideCanvas();
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

	function showVideoHideCanvas() {
		video.style.display = "block";
		canvas.style.display = "none";
	}

	function showCanvasHideVideo() {
		video.style.display = "none";
		canvas.style.display = "block";
	}
	
	function start(container, options) {
		container = document.getElementById(not_blank(container) ? container : "webcam");
		container.style.overflow = "hidden";
		width = container.offsetWidth;
		height = container.offsetHeight;
		// height = width / (4 / 3);

		video = document.createElement("video");
		container.appendChild(video);
		video.id = "webcam-video";
		// video.style.width = "100% !important";
		video.style.width = (height / (3 / 4)) + "px";
		// video.style.width = width + "px";
		// video.style.height = "auto !important";
		video.style.height = height + "px";
		video.style.display = "block";
		video.style.position = "relative";
		video.style.marginLeft = ((width - video.offsetWidth) / 2) + "px";
		// video.style.objectFit = "none";

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
		redo_button.addEventListener("click", redo);

		takePhoto_button = document.getElementById(not_blank(options.takePhoto) ? options.takePhoto : "takePhoto");
		takePhoto_button.addEventListener("click", takePhoto_button);

		share_button = document.getElementById(not_blank(options.share) ? options.share : "share");
		share_button.addEventListener("click", doShare);

		logout_button = document.getElementById(not_blank(options.logout) ? options.logout : "logout");
		logout_button.addEventListener("click", logoutUser);

		upload_button = document.getElementById(not_blank(options.upload) ? options.upload : "upload");
		upload_button.addEventListener('change', handleImage, false);

		document.addEventListener("mouseup", release);

		document.addEventListener("mousemove", function(e) {
			if(dragging !== null) {
				dragging.style.top = (e.clientY - dragging.parentElement.offsetTop) + "px";
				dragging.style.left = (e.clientX - dragging.parentElement.offsetLeft - 16) + "px";
			}
		});

		if(draggables.length !== 0) {
			for(var i in draggables) {
				document.getElementById(draggables[i]).addEventListener("mousedown", drag);
			}
		}

		navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		navigator.getUserMedia({ video: true }, function(stream) {
			console.log("streaming...");
			video.src = window.URL.createObjectURL(stream);
			video.addEventListener("canplaythrough", function() {
				video.play();
			});
		}, function(error) {
			console.error(error);
			console.error("Could not find camera... Upload a photo instead...");
			showCanvasHideVideo();
		});
	}

	window.webcam = {};
	window.webcam.start = start;
})();
