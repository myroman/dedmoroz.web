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
        let videotype = +getURLParameter('vt') ? 1 : 0;  

        let videoUrl = null;
        if (Dm.settings.env == 'local') {
            videoUrl = Dm.settings.baseurl + '/orders/' + ordernumber + '/videos?vt=' + videotype;
        } else {
            let filename = videotype == 1 ? 'demo.mp4' : 'hd_video.mp4';
            videoUrl = Dm.settings.bucket_uploadfiles_url + '/orders/' + ordernumber + '/' + filename;
        }

        if (videotype == 1) {
            //if demo            
            $('.link-payment').attr('href', createPaymentPageUrl(ordernumber));
            $('.show-if-demo').show();            
        } else {
            $('.show-if-hd').show();
        }

        var video = document.querySelector('video');
        video.src = videoUrl;
        video.load();

        $('.js-download-video').click(function (e) {
            window.location.href = videoUrl;
            e.preventDefault();
            return false;
        });

        function createPaymentPageUrl(ordernumber) {
            return Dm.settings.baseurl + '/pages/payment?ordernumber=' + ordernumber;
        }        
    });

})(jQuery);