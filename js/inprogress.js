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
        checkAndRedirect(statusUrl, ordernumber, videotype);

        var totalTimeWaited = 0;
        var waitTimeout = 1000 * 60;
        var maxTimeWaitMs = 1000 * 60 * 60 * 3;
        var maxDemoTimeWaitMs = 1000 * 60 * 60;
        var popupShowTimeoutMs = 1000 * 5;
        var isPopupShown = false;

        let currentPromocode = "ELKA27";
        let currentDiscount = "27";
        $('#popupPromocodeText').text(currentPromocode);
        $('#popupPromocodeDiscount').text(currentDiscount);        

        function checkAndRedirect(statusUrl, ordernumber, videotype) {
            if (videotype == 1) {
                if (totalTimeWaited > maxDemoTimeWaitMs) {
                    $('.waiting-info').text('Ваше демо скоро будет приготовлено, и ссылка придет на указанный вами электронный адрес.');
                    return;
                }
            } else {
                if (totalTimeWaited > maxTimeWaitMs) {
                    $('.waiting-info').text('Ваше видеопоздравление скоро будет приготовлено, и ссылка придет на указанный вами электронный адрес.');
                    return;
                }
            }
            
            $.get(statusUrl, function (resp) {
                console.log(resp)
                if (videotype == 1) {
                    if (resp.is_demo_ready === true) {
                        $('.waiting-info').text('Демо видео готово. Открываем плеер...');
                        setTimeout(function () {
                            window.location.replace(createWatchUrl(ordernumber, videotype));
                        }, 300);
                    } else {
                        totalTimeWaited += waitTimeout;
                        console.log('wait',totalTimeWaited, videotype);
                        $('.waiting-info').text('Мы сейчас создаём ваше демо видеопоздравление, пожалуйста подождите.');
                        setTimeout(function () {
                            checkAndRedirect(statusUrl, ordernumber, videotype);
                        }, waitTimeout);

                        //just in case if localstorage doesn't catch it
                        if (!isPopupShown) {
                            isPopupShown = true;
                            setTimeout(function() {
                                showPopup();
                            }, popupShowTimeoutMs);
                        }                        
                    }
                } else {
                    if (resp.is_hd_ready === true) {
                        $('.waiting-info').text('Ваше видео готово. Открываем плеер...');
                        setTimeout(function () {
                            window.location.replace(createWatchUrl(ordernumber, videotype));
                        }, 300);
                    } else {
                        totalTimeWaited += waitTimeout;
                        console.log('wait',totalTimeWaited, videotype);
                        $('.waiting-info').text('Мы сейчас создаём ваше видео поздравление, пожалуйста подождите.');

                        setTimeout(function () {
                            checkAndRedirect(statusUrl, ordernumber, videotype);
                        }, waitTimeout);
                    }
                }
            });
    
            function showPopup() {
                $('.dm-popup-overlay').addClass('dm-popup-overlay_visible');
            }
    
            function hidePopup() {
                $('.dm-popup-overlay').removeClass('dm-popup-overlay_visible');
            }
            $('a.dm-popup__close').click(function () {
                hidePopup();
            });
        }
    });

})(jQuery);