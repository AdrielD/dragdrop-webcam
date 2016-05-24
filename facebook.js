window.fbAsyncInit = function() {
  FB.init({
    appId      : '[FACEBOOK APP ID HERE!!!]',
    xfbml      : true,
    version    : 'v2.6' // CHECK VERSION BEFORE DEPLOY!!!
  });
};

(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
