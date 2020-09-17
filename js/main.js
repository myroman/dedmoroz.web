(function ($) {
  "use strict";
  // TOP Menu Sticky
  $(window).on('scroll', function () {
    var scroll = $(window).scrollTop();
    if (scroll < 400) {
      $("#sticky-header").removeClass("sticky");
      $('#back-top').fadeIn(500);
    } else {
      $("#sticky-header").addClass("sticky");
      $('#back-top').fadeIn(500);
    }
  });

  $(document).ready(function () {

    // mobile_menu
    var menu = $('ul#navigation');
    if (menu.length) {
      menu.slicknav({
        prependTo: ".mobile_menu",
        closedSymbol: '+',
        openedSymbol: '-'
      });
    };
    // blog-menu
    // $('ul#blog-menu').slicknav({
    //   prependTo: ".blog_menu"
    // });

    // review-active
    $('.slider_active').owlCarousel({
      loop: true,
      margin: 0,
      items: 1,
      autoplay: true,
      navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
      nav: true,
      dots: false,
      autoplayHoverPause: true,
      autoplaySpeed: 800,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn',
      responsive: {
        0: {
          items: 1,
          nav: false,
        },
        767: {
          items: 1
        },
        992: {
          items: 1
        },
        1200: {
          items: 1
        },
        1600: {
          items: 1
        }
      }
    });

    // review-active
    $('.testmonial_active').owlCarousel({
      loop: true,
      margin: 0,
      items: 1,
      autoplay: true,
      navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
      nav: false,
      dots: true,
      autoplayHoverPause: true,
      autoplaySpeed: 800,
      responsive: {
        0: {
          items: 1,
        },
        767: {
          items: 1,
        },
        992: {
          items: 1,
        },
        1200: {
          items: 1,
        },
        1500: {
          items: 1
        }
      }
    });

    $(function () {
      $("#slider-range").slider({
        range: true,
        min: 0,
        max: 600,
        values: [75, 300],
        slide: function (event, ui) {
          $("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
        }
      });
      $("#amount").val("$" + $("#slider-range").slider("values", 0) +
        " - $" + $("#slider-range").slider("values", 1));
    });


    // for filter
    // init Isotope
    var $grid = $('.grid').isotope({
      itemSelector: '.grid-item',
      percentPosition: true,
      masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: 1
      }
    });

    // filter items on button click
    $('.portfolio-menu').on('click', 'button', function () {
      var filterValue = $(this).attr('data-filter');
      $grid.isotope({
        filter: filterValue
      });
    });

    //for menu active class
    $('.portfolio-menu button').on('click', function (event) {
      $(this).siblings('.active').removeClass('active');
      $(this).addClass('active');
      event.preventDefault();
    });

    // wow js
    new WOW().init();

    // counter 
    $('.counter').counterUp({
      delay: 10,
      time: 10000
    });

    /* magnificPopup img view */
    $('.popup-image').magnificPopup({
      type: 'image',
      gallery: {
        enabled: true
      }
    });

    /* magnificPopup img view */
    $('.img-pop-up').magnificPopup({
      type: 'image',
      gallery: {
        enabled: true
      }
    });

    /* magnificPopup video view */
    $('.popup-video').magnificPopup({
      type: 'iframe'
    });


    // scrollIt for smoth scroll
    $.scrollIt({
      upKey: 38, // key code to navigate to the next section
      downKey: 40, // key code to navigate to the previous section
      easing: 'linear', // the easing function for animation
      scrollTime: 600, // how long (in ms) the animation takes
      activeClass: 'active', // class given to the active nav element
      onPageChange: null, // function(pageIndex) that is called when page is changed
      topOffset: 0 // offste (in px) for fixed top navigation
    });

    // scrollup bottom to top
    $.scrollUp({
      scrollName: 'scrollUp', // Element ID
      topDistance: '4500', // Distance from top before showing element (px)
      topSpeed: 300, // Speed back to top (ms)
      animation: 'fade', // Fade, slide, none
      animationInSpeed: 200, // Animation in speed (ms)
      animationOutSpeed: 200, // Animation out speed (ms)
      scrollText: '<i class="fa fa-angle-double-up"></i>', // Text for element
      activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
    });


    // blog-page

    //brand-active
    $('.brand-active').owlCarousel({
      loop: true,
      margin: 30,
      items: 1,
      autoplay: true,
      nav: false,
      dots: false,
      autoplayHoverPause: true,
      autoplaySpeed: 800,
      responsive: {
        0: {
          items: 1,
          nav: false

        },
        767: {
          items: 4
        },
        992: {
          items: 7
        }
      }
    });

    // blog-dtails-page

    //project-active
    $('.project-active').owlCarousel({
      loop: true,
      margin: 30,
      items: 1,
      // autoplay:true,
      navText: ['<i class="Flaticon flaticon-left-arrow"></i>', '<i class="Flaticon flaticon-right-arrow"></i>'],
      nav: true,
      dots: false,
      // autoplayHoverPause: true,
      // autoplaySpeed: 800,
      responsive: {
        0: {
          items: 1,
          nav: false

        },
        767: {
          items: 1,
          nav: false
        },
        992: {
          items: 2,
          nav: false
        },
        1200: {
          items: 1,
        },
        1501: {
          items: 2,
        }
      }
    });

    if (document.getElementById('default-select')) {
      $('select').niceSelect();
    }

    //about-pro-active
    $('.details_active').owlCarousel({
      loop: true,
      margin: 0,
      items: 1,
      // autoplay:true,
      navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
      nav: true,
      dots: false,
      // autoplayHoverPause: true,
      // autoplaySpeed: 800,
      responsive: {
        0: {
          items: 1,
          nav: false

        },
        767: {
          items: 1,
          nav: false
        },
        992: {
          items: 1,
          nav: false
        },
        1200: {
          items: 1,
        }
      }
    });

  });

  // resitration_Form
  $(document).ready(function () {
    $('.popup-with-form').magnificPopup({
      type: 'inline',
      preloader: false,
      focus: '#name',

      // When elemened is focused, some mobile browsers in some cases zoom in
      // It looks not nice, so we disable it:
      callbacks: {
        beforeOpen: function () {
          if ($(window).width() < 700) {
            this.st.focus = false;
          } else {
            this.st.focus = '#name';
          }
        }
      }
    });
  });



  //------- Mailchimp js --------//  
  function mailChimp() {
    $('#mc_embed_signup').find('form').ajaxChimp();
  }
  mailChimp();



  // Search Toggle
  $("#search_input_box").hide();
  $("#search").on("click", function () {
    $("#search_input_box").slideToggle();
    $("#search_input").focus();
  });
  $("#close_search").on("click", function () {
    $('#search_input_box').slideUp(500);
  });
  // Search Toggle
  $("#search_input_box").hide();
  $("#search_1").on("click", function () {
    $("#search_input_box").slideToggle();
    $("#search_input").focus();
  });
  $(document).ready(function () {
    $('select').niceSelect();
  });

  var dlgControl = function () {
    console.log('here')
    this.submitOrder = function (postdata, onSuccess, onError) {
      $.post('http://localhost:5000/videos/create', postdata, onSuccess);
    }
  };

  let steps = {
    name: 0,
    photo1: 1,

    finished: 10
  }

  function initOrderState() {
    return {
      step: steps.name,
      name: null,
      sex: null,
      pictures: {}
    };
  }

  let orderState = initOrderState();

  let videoProcStatuses = {
    submitted: "submitted",
    ready: "ready"
  };



  //dialog order

  $(function () {
    $('.start-order-btn').click(function () {
      orderState = initOrderState();
      
      refreshControlByOrderStep();
      $('.order-dlg').show();
    })

    $('#ddlName').change(function () {
      orderState.name = $(this).val();
    });

    //place order
    $('.order-dlg .goto-payment-btn').click(gotoPayment);

    $('.order-dlg .close-btn').click(function () {
      $('.order-dlg').hide();
    });

    $(".btn-upload-file").click(function () {
      
      var formdata = new FormData($('.image-upload-form')[0]);
      let picno = $('.image-upload-form').data('picno');
      $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/filestash',
        data: formdata,
        contentType: false,
        cache: false,
        processData: false,
        success: function (data) {
          $('.photo-uploaded').show();
          orderState.pictures[picno] = data.filename;
        },
      });
    });

    $('#filePicture1').change(function(){
      $('.btn-upload-file').removeAttr('disabled');
    })

    $('.prev-btn').click(function () {
      if (orderState.step == 0) return;
      orderState.step--;
      refreshControlByOrderStep();;
    });

    $('.next-btn').click(function () {
      let errors = validateInput(orderState.step);
      if (errors.length) {
        $('.wizard-warning').show();
        $('.wizard-warning p').text(errors.join('. '))
        return;
      } else {
        $('.wizard-warning').hide();
      }

      orderState.step++;
      refreshControlByOrderStep();;
    });

    function validateInput(step) {
      let errors = [];
      switch (orderState.step) {
        case steps.name:
          let name = $('#ddlName').val();
          if (!name) {
            errors.push('Введите имя');
          }
          let sex = $('#ddlSex').val();
          if (!sex) {
            errors.push('Введите пол');
          }
          return errors;
        case steps.photo1:
          if (!orderState.pictures[0]) {
            errors.push('Загрузите как минимум 1 фотографию');
          }
          if (!$('#ddlCommentPic1').val()) {
            errors.push('Выберите комментарий для фотографии')
          }
          return errors;
        default:
          return [];
      }
    }

    function gotoPayment() {
      if (!orderState.name) {
        orderState.name = $('#ddlName').val();
      }

      new dlgControl().submitOrder(orderState, function (resp) {
        console.log('got resp', resp);
        orderState.step = steps.finished;
        refreshControlByOrderStep();;

        $('.wizard-finished').show();
        if (resp.status == videoProcStatuses.submitted) {
          $('.order-status span').text('Видео в процессе, пожалуйста подождите');
        } else if (resp.status == videoProcStatuses.ready){
          $('.order-status span').text('Видео готово, пожалуйста проверьте свою почту');
        }
        
      });
    }

    function refreshControlByOrderStep() {
      let step = orderState.step;
      switch (step) {
        case steps.name:
          $('.goto-payment-btn').hide();
          $('.next-btn').show();
          $('.prev-btn').hide();
          $('.wizard-step-panel').hide();
          $('.wizard-step-panel_step' + step).show();
          break;
        case steps.photo1:
          $('.goto-payment-btn').show();
          $('.next-btn').hide();
          $('.prev-btn').show();
          $('.wizard-step-panel').hide();
          $('.wizard-step-panel_step' + step).show();
          break;
        case steps.finished:
          $('.goto-payment-btn').hide();
          $('.next-btn').hide();
          $('.prev-btn').hide();
          $('.wizard-step-panel').hide();
          $('.wizard-step-panel_step' + step).show();
          break;
      }
    }

    refreshControlByOrderStep();
  });

})(jQuery);