 (function ($) {

 	"use strict";

 	function getURLParameter(sParam) {
 		var sPageURL = window.location.search.substring(1);
 		var sURLVariables = sPageURL.split('&');
 		for (var i = 0; i < sURLVariables.length; i++) {
 			var sParameterName = sURLVariables[i].split('=');
 			if (sParameterName[0] == sParam) {
 				return sParameterName[1];
 			}
 		}
 	}


 	$(function () {
 		let ordernumber = getURLParameter('ordernumber');
 		let videotype = getURLParameter('vt') ? 1 : 0;
 		let videoUrl = null;
 		if (Dm.settings.env == 'test') {
 			let filename = videotype == 1 ? 'demo.mp4' : 'hd.mp4';
 			videoUrl = 'https://darimchudo-files.s3.amazonaws.com/orders/' + ordernumber + '/' + filename;
 		} else {
			videoUrl = Dm.settings.baseurl + '/orders/' + ordernumber + '/videos?vt=' + videotype;
 		}

 		var video = document.querySelector('video');
 		video.src = videoUrl;
 		video.load();
 	});

 })(jQuery);