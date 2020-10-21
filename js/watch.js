 (function ($) {

	 "use strict";
	 
	 var settings = {
		baseurl: 'http://localhost:5000'
	};

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
 		let videoUrl = Dm.settings.baseurl + '/orders/'+ordernumber+'/videos?vt='+videotype;
 		if (ordernumber) {
 			$.ajax({
 				method: 'GET',
 				url: videoUrl,
 				contentType: 'application/json',
 				mimeType: "video/mp4",
 				success: function (response) {
 					loadVideo(videoUrl);
 				},
 				error: function (jqXHR, textStatus, errorThrown) {
 					console.log("request for secure stream failed: ", textStatus, errorThrown, jqXHR);
 				}
 			})
 		}

 		function loadVideo(videoUrl) {
 			const NUM_CHUNKS = 5;

 			var video = document.querySelector('video');
 			video.src = videoUrl;
 			//  video.src = video.webkitMediaSourceURL;

 			video.addEventListener('webkitsourceopen', function (e) {
 				var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

 				console.log('on webkitsourceopen');

 				// Slice the video into NUM_CHUNKS and append each to the media element.
 				for (var i = 0; i < NUM_CHUNKS; ++i) {
 					var startByte = chunkSize * i;

 					// file is a video file.
 					var chunk = file.slice(startByte, startByte + chunkSize);

 					var reader = new FileReader();
 					reader.onload = (function (idx) {
 						console.log('reader ' + idx);

 						return function (e) {
 							video.webkitSourceAppend(new Uint8Array(e.target.result));
 							logger.log('appending chunk:' + idx);
 							if (idx == NUM_CHUNKS - 1) {
 								video.webkitSourceEndOfStream(HTMLMediaElement.EOS_NO_ERROR);
 							}
 						};
 					})(i);

 					reader.readAsArrayBuffer(chunk);
 				}
 			}, false);
 		}
 	});

 })(jQuery);