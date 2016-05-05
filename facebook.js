window.fbAsyncInit = function() {
  FB.init({
    // appId      : '227393377626524', // Dev 
    // appId      : '224702951228900', // Prod
    appId      : (window.location.hostname == 'localhost') ? '227393377626524' : '224702951228900',
    xfbml      : true,
    version    : 'v2.6'
  });

  // function checkLoginState() {

	 //  FB.getLoginStatus(function(response) {
	 //  	console.log(response);
	 //  	if (response.status === "connected") {
		// 		FB.api('/me', function(response) {
		// 			console.log("Logged as: " + response.name);
		// 			document.getElementById("logout").style.display = "block";
		// 		});
	 //  	}
	 //  	else {
		// 		console.log("Not logged in");
		// 		document.getElementById("logout").style.display = "none";
		// 	}
		// });

		// FB.api('/me', function(response) {
		// 	console.log(response);
		// 	document.getElementById("logout").style.display = "block";
		// });
  // }
};

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
