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

	/* tabs*/
	$('.js-next').click(function() {
		$(this).parents('.content-item').addClass('hide-item');
		var id = $(this).attr('href');
		$(id).removeClass('hide-item');
		return false;
	});
	$('.js-prev').click(function() {
		$(this).parents('.content-item').addClass('hide-item');
		var id = $(this).attr('href');
		$(id).removeClass('hide-item');
		return false;
	});
	/* tabs*/

	$('.js-choose-radio input').live('change', function() {
        $(this).parents('.content-item').addClass('hide-item');
        $(this).parents('.content-item').next().removeClass('hide-item');
	});
	

	/*upload image on background*/
	function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		console.log();
		
		reader.onload = function(e) {
			$('#'+input.id).parents('label').addClass('active');
			$('#'+input.id).parents('label').find('.photo-list__photo').css('background-image', "url(" + e.target.result + ")");
		}
		
		reader.readAsDataURL(input.files[0]);
	}
	}
	$(".input-photo").change(function() {
		readURL(this);
	});	

	if($('.js-styled').length) {
		$('.js-styled').styler({
			selectSearch: true,
		});
	};

	$("#childName").validate({
		invalidHandler: function() {
			setTimeout(function() {
				$('input, select').trigger('refresh');
			}, 1)
		},
		submitHandler: function (form) {
			$("#step-3").removeClass('hide-item');
			$("#step-2").addClass('hide-item');
        	
		},
	});
	$("#childPhoto").validate({
		invalidHandler: function() {
			setTimeout(function() {
				$('input, select').trigger('refresh');
			}, 1)
		},
		submitHandler: function (form) {
			$("#step-4").removeClass('hide-item');
			$("#step-3").addClass('hide-item');
        	
		},
	});

	$("#childHobi").validate({
		rules: {
			mark: "required",
			achievements: "required",
		},
		messages: {
			mark: "*Обязательное поле",
			achievements: "*Обязательное поле",
		},
		submitHandler: function (form) {
			$("#step-6").removeClass('hide-item');
			$("#step-5").addClass('hide-item');
        	
		},
	});

	$("#contactDetails").validate({
		rules: {
			name: "required",
			email: "required",
		},
		messages: {
			name: "*Обязательное поле",
			msg: "*Обязательное поле",
		}
	});
});



