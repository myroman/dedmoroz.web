$(window).on('load', function () {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
		$('body').addClass('ios');
	} else {
		$('body').addClass('web');
	};
	$('body').removeClass('loaded');
});

/* viewport width */
function viewport() {
	var e = window,
		a = 'inner';
	if (!('innerWidth' in window)) {
		a = 'client';
		e = document.documentElement || document.body;
	}
	return { width: e[a + 'Width'], height: e[a + 'Height'] }
};
/* viewport width */
$(function () {
	/* placeholder*/
	$('input, textarea').each(function () {
		var placeholder = $(this).attr('placeholder');
		$(this).focus(function () { $(this).attr('placeholder', ''); });
		$(this).focusout(function () {
			$(this).attr('placeholder', placeholder);
		});
	});
	/* placeholder*/
	/*button open main nav begin*/
	$('.js-button-nav').click(function () {
		$(this).toggleClass('active');
		$('.main-nav').toggleClass('show');
		$('.main-mask').toggleClass('active');
		$('body').toggleClass('noscroll');
		$('html').toggleClass('noscroll');
		return false;
	});
	$('.main-mask').click(function () {
		$('.main-nav').removeClass('show');
		$('.js-button-nav').removeClass('active');
		$('.main-mask').removeClass('active');
		$('body').removeClass('noscroll');
		$('html').removeClass('noscroll');
		return false;
	});

	/*button open main nav end*/
    /*play video*/
	$(".js-play").click(function(){
		var dataYoutube = $(this).parents('.video').find('iframe').attr('src');
		$(this).parents('.video').find('iframe').attr('src', dataYoutube +'?autoplay=1');
		$(this).parents('.video').addClass('active');
		return false;
	});
	/*play video*/

	
});



