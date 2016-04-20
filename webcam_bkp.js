(function() {

	var width = 400;
	var height = width / (4 / 3);
	var video;
	var canvas;
	var context;
	var text;
	var share;
	var cancel;
	var user;
	var logout;
	var postDone;
	var photoTaken = false;

	// https://gist.github.com/andyburke/1498758
	if ( XMLHttpRequest.prototype.sendAsBinary === undefined ) {
    XMLHttpRequest.prototype.sendAsBinary = function(string) {
      var bytes = Array.prototype.map.call(string, function(c) {
          return c.charCodeAt(0) & 0xff;
      });
      this.send(new Uint8Array(bytes).buffer);
    };
	}

	function start() {
		console.log("hi!");

		video = document.getElementById("video");
		video.width = width;
		video.height = height;
		video.style.backgroundColor = "#000";

		canvas = document.getElementById("canvas");
		canvas.width = width;
		canvas.height = height;
		context = canvas.getContext("2d");

		text = document.getElementById("text");
		share = document.getElementById("share");
		cancel = document.getElementById("cancel");
		logout = document.getElementById("logout");
		user = document.getElementById("user");
		postDone = document.getElementById("post-done");

		mask = document.createElement("img");
		mask.src = "scary.png";

		frame = document.createElement("img");
		frame.src = "frame.png";

		button = document.getElementById("button");
		button.addEventListener("click", takePhoto);
		share.addEventListener("click", doShare);
		cancel.addEventListener("click", cancelShare);
		logout.addEventListener("click", logoutUser);

		navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
		navigator.getUserMedia({ video: true }, function(stream) {
			console.log("streaming...");
			video.src = window.URL.createObjectURL(stream);
			video.addEventListener("canplaythrough", function() {
				video.play();
			});
		}, function(error) {
			console.error(error.name);
		});

	}

	function logoutUser() {
		FB.logout(function(response) {
			console.log(response);
  		user.innerHTML = "Not logged in";
			logout.style.display = "none";
			cancelShare();
		});
	}

	function cancelShare() {
		button.style.display = "block";
		video.style.display = "block";
		canvas.style.display = "none";
		share.style.display = "none";
		cancel.style.display = "none";
		text.style.display = "none";
		postDone.style.display = "none";
		text.value = "";
	}

	function takePhoto() {
		clear();
		context.drawImage(video, 0, 0, width, height);
		context.globalCompositeOperation = "lighter";
		context.drawImage(mask, 40, height/4, width/3, height/2);
		context.globalCompositeOperation = "multiply";
		context.drawImage(frame, 0, 0, width, height);

		video.style.display = "none";
		canvas.style.display = "block";
		text.style.display = "block";
		share.style.display = "block";
		cancel.style.display = "block";
		button.style.display = "none";
	}

	function doShare() {
		var data = canvas.toDataURL('image/png');
		var encodedPng = data.substring(data.indexOf(',') + 1, data.length);
		var decodedPng = Base64Binary.decode(encodedPng);

		FB.login(function(response) {
			if (response.status === "connected") {
				var auth = response.authResponse.accessToken;
				FB.api('/me', function(response) {
				  user.innerHTML = "Logged as: " + response.name;
				  logout.style.display = "block";
				  console.log(response);
					postImageToFacebook(auth, "scary-photo", "image/png", decodedPng, text.value);
					postDone.style.display = "block";
					setTimeout(function() {
						postDone.style.display = "none";
					}, 3000);
				});
		  }
		  else {
		  	console.log("not logged");
		  }
		}, {scope: "publish_actions"});
	}

	// https://gist.github.com/andyburke/1498758
	function postImageToFacebook(authToken, filename, mimeType, imageData, message ) {
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
		context.globalCompositeOperation = "source-over";
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	window.addEventListener("DOMContentLoaded", start);
})();