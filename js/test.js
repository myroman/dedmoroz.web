$(function(){

    setTimeout(function(){
        $('.dm-popup-overlay').addClass('dm-popup-overlay_visible');
    }, 1000);



    $('a.close').click(function(){
        hidePopup();
    });

    function showPopup() {
        $('.dm-popup-overlay').addClass('dm-popup-overlay_visible');
    }

    function hidePopup(){
        $('.dm-popup-overlay').removeClass('dm-popup-overlay_visible');
    }
});