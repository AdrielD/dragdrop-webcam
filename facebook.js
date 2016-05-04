window.fbAsyncInit = function() {
  FB.init({
    // appId      : '227393377626524', // Dev 
    // appId      : '224702951228900', // Prod
    appId      : (window.location.hostname == 'localhost') ? '227393377626524' : '224702951228900',
    xfbml      : true,
    version    : 'v2.6'
  }, function(response){
  	console.log(response);
  });

 //  FB.getLoginStatus(function(response) {
 //  	if (response.status === "connected") {
	// 		FB.api('/me', function(response) {
	// 			// document.getElementById("user").innerHTML = "Logged as: " + response.name;
	// 			// document.getElementById("logout").style.display = "block";
	// 		});
 //  	}
 //  	else {
	// 		// document.getElementById("user").innerHTML = "Not logged in";
	// 		// document.getElementById("logout").style.display = "none";
	// 	}
	// });
};

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
