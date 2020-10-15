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

 		if (!ordernumber) {
 			return;
		 }
		 console.log('ordernumber',ordernumber);

		let getScriptUrl = "http://127.0.0.1:5000/robo/paybuttonscript?ordernumber" + ordernumber;
		let source1 = "https://auth.robokassa.ru/Merchant/PaymentForm/FormMS.js?MerchantLogin=Darimchudo&InvoiceID=0&Culture=ru&Encoding=utf-8&OutSum=10&SignatureValue=76d0df39437e6d700070139528aa6017";
		 $.get(getScriptUrl, function (resp) {
			var s = document.createElement("script");
			s.type = "text/javascript";
			console.log('got script:'+resp);
			s.src = source1;
			// Use any selector
			$(".script-holder").append(s);

		 });

 		

 		
 	});

 })(jQuery);