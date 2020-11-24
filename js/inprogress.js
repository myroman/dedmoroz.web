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

    function createWatchUrl(ordernumber, videotype) {
        return "watch.html?ordernumber=" + ordernumber + "&vt=" + videotype;
    }

    $(function () {
        $('#ftco-loader').addClass('show');

        let ordernumber = getURLParameter('ordernumber');
        let videotype = +getURLParameter('vt'); //1=demo,undefined=prod
        if (!videotype) videotype = 0;
        console.log('waiting order #' + ordernumber + " for video type " + videotype);
        
        if (videotype == 1) {

            let paymentPageUrl = Dm.settings.baseurl + '/pages/payment?ordernumber='+ordernumber;
            $('.link-payment').attr('href', paymentPageUrl);
            $('.demo-info-wrapper').show();
            $('.show-if-demo').show();
            $('.heading').text('Демо-видео создаётся');
        } else {
            $('.show-if-hd').show();
        }

        let statusUrl = Dm.settings.baseurl + '/orders/' + ordernumber;
        // checkAndRedirect(statusUrl, ordernumber, videotype);

        function checkAndRedirect(statusUrl, ordernumber, videotype) {
            let timeout = 15000;
            $.get(statusUrl, function (resp) {
                console.log(resp)
                if (videotype == 1) {
                    if (resp.is_demo_ready) {
                        $('.waiting-info').text('Демо видео готово. Открываем плеер...');
                        setTimeout(function () {
                            window.location.replace(createWatchUrl(ordernumber, videotype));
                        }, 300);
                    } else {
                        $('.waiting-info').text('Мы сейчас создаём демо видео, пожалуйста подождите.');
                        setTimeout(function () {
                            checkAndRedirect(statusUrl, ordernumber, videotype);
                        }, timeout);
                    }
                } else {
                    if (resp.is_hd_ready) {
                        $('.waiting-info').text('Ваше видео готово. Открываем плеер...');
                        setTimeout(function () {
                            window.location.replace(createWatchUrl(ordernumber, videotype));
                        }, 300);
                    } else {
                        $('.waiting-info').text('Мы сейчас создаём видео, пожалуйста подождите.');

                        setTimeout(function () {
                            checkAndRedirect(statusUrl, ordernumber, videotype);
                        }, timeout);
                    }
                }
            });

        }
    });

})(jQuery);