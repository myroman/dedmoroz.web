var stepper1;

(function ($) {

    //custom functionality

    var settings = {
        baseurl: 'http://localhost:5000'
    };

    var dlgControl = function () {
        console.log('here')
        this.submitOrder = function (postdata, onSuccess, onError) {
            $.post(settings.baseurl + '/videos/create', postdata, onSuccess);
        }
    };

    let steps = {
        sex: 0,
        kidname: 1,
        photos: 2,
        review: 3,

        finished: 10
    }

    let MaxPictures = 2;

    function initOrderState() {
        let result = {
            step: steps.photos,
            kidname: 'bogdan',
            sex: '0',
            letter_filename: null,
            praiseid: 19,
            behaviorid: 1,
            customername: 'Роман',
            customeremail: 'roman.pavlushchenko@gmail.com',

            imageMap: {}
        };

        $('#ddlSex').val(result.sex)
        $('#ddlName').val(result.kidname)

        return result;
    }

    let orderState = initOrderState();

    let videoProcStatuses = {
        submitted: "submitted",
        ready: "ready"
    };

    //dialog order

    $(function () {
        stepper1 = new Stepper($('.bs-stepper')[0])

        function showError(message) {
            $('.wizard-warning').show();
            $('.wizard-warning p').text(message)
        }

        function hideError() {
            $('.wizard-warning').hide();
        }

        $('.start-order-btn').click(function () {
            orderState = initOrderState();

            function loadMasterdata() {
                $.get(settings.baseurl + '/md/photocomments?applicable_for=0', function(resp) {
                    var $comments = $(".ddl-comment");
                    $.each(resp, function() {
                        $comments.append($("<option />").val(this.filepath).text(this.category + ' - ' + this.displayname));
                    });
                });

                $.get(settings.baseurl + '/md/names?sex='+orderState.sex, function(resp) {
                    var $ddl = $(".ddl-names");
                    $ddl.html('');
                    $ddl.append($("<option />").val('').text('Выберите имя'));

                    $.each(resp, function() {
                        $ddl.append($("<option />").val(this.id).text(this.displayname));
                    });
                });
            }

            loadMasterdata();

            // refreshControlByOrderStep();
            $('.order-dlg').show();
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
                url: settings.baseurl + '/filestash',
                data: formdata,
                contentType: false,
                cache: false,
                processData: false,
                success: function (data) {
                    $('.photo-uploaded').show();
                    orderState.imageMap[picno] = {
                        name: data.filename
                    };
                },
            });
        });

        $('#filePicture1').change(function () {
            $('.btn-upload-file').removeAttr('disabled');
        })

        $('.prev-btn').click(function () {
            stepper1.previous();
            orderState.step--;
        });

        $(document).on('click', '.bs-stepper-pane.active .next-btn', function () {
            let errors = validateInput(orderState.step);
            if (errors.length) {
                showError(errors.join('. '));
                return;
            }
            saveDataToOrder(orderState.step);

            hideError();
            stepper1.next();
            orderState.step++;

            if (orderState.step == steps.review) {
                initReviewForm();
            }
        });


        function validateInput(step) {
            let errors = [];
            switch (step) {
                case steps.sex:
                    let sex = $('#ddlSex').val();
                    if (!sex) {
                        errors.push('Введите пол');
                    }
                    return errors;

                case steps.kidname:
                    let kidname = $('#ddlName').val();
                    if (!kidname) {
                        errors.push('Введите имя');
                    }
                    return errors;
                case steps.photos:
                    if (!orderState.imageMap['pic0']) {
                        errors.push('Загрузите как минимум 1 фотографию');
                    }
                    if (!$('#ddlCommentPic0').val()) {
                        errors.push('Выберите комментарий для фотографии')
                    }
                    (function () {
                        let i = 0;
                        for (i = 1; i < MaxPictures; i++) {
                            if (orderState.imageMap['pic' + i] && orderState.imageMap['pic' + i].name) {
                                if (!$('#ddlCommentPic' + i).val()) {
                                    errors.push('Выберите комментарий для фотографии ' + (i + 1));
                                }
                            }
                        }
                    })();


                    return errors;
                default:
                    return [];
            }
        }


        function saveDataToOrder(step) {
            switch (step) {
                case steps.sex:
                    orderState.sex = $('#ddlSex').val();
                    break;
                case steps.kidname:
                    orderState.kidname = $('#ddlName').val();
                    break;
                case steps.photos:
                    let i = 0;
                    for (i = 0; i < MaxPictures; i++) {
                        let picId = 'pic' + i;
                        if (orderState.imageMap[picId]) {
                            orderState.imageMap[picId].commentid = $('#ddlCommentPic' + i).val();
                        }
                    }

                    break;
            }
        }

        function initReviewForm() {
            $('.review-form .sex').val(orderState.sex);
            $('.review-form .kidname').val(orderState.kidname);
            let i = 0;
            for (i = 0; i < MaxPictures; i++) {
                let picid = 'pic' + i;
                if (orderState.imageMap[picid] && orderState.imageMap[picid].commentid) {
                    let commentSelector = '.review-form .comment' + i;
                    $(commentSelector).val(orderState.imageMap[picid].commentid).show();
                }
            }
        }

        function gotoPayment() {
            if (!orderState.kidname) {
                orderState.kidname = $('#ddlName').val();
            }

            new dlgControl().submitOrder(orderState, function (resp) {
                console.log('got resp', resp);
                orderState.step = steps.finished;
                // refreshControlByOrderStep();;

                $('.wizard-finished').show();
                if (resp.status == videoProcStatuses.submitted) {
                    $('.order-status span').text('Видео в процессе, пожалуйста подождите');
                } else if (resp.status == videoProcStatuses.ready) {
                    $('.order-status span').text('Видео готово, пожалуйста проверьте свою почту');
                }

            });
        }

        $('.submit-order').click(function () {
            let orderInfo = {
                kidname: orderState.kidname,
                sex: +orderState.sex,
                images: [],
                letter_filename: orderState.letter_filename,
                praiseid: orderState.praiseid,
                behaviorid: orderState.behaviorid,
                customername: orderState.customername,
                customeremail: orderState.customeremail
            };
            let i = 0;
            for (i = 0; i < MaxPictures; i++) {
                let key = 'pic' + i;
                if (orderState.imageMap[key] && orderState.imageMap[key].name) {
                    orderInfo.images.push(orderState.imageMap[key]);
                }
            }

            $.ajax({
                type: 'POST',
                url: settings.baseurl + '/orders',
                data: JSON.stringify(orderInfo),
                contentType: 'application/json',
                success: function (data) {
                    console.log('success, redirecting to wait page', data);
                    let ordernumber = data.ordernumber;
                    if (ordernumber) {
                        setTimeout(function () {
                            window.location.replace("inprogress.html?ordernumber=" + ordernumber + "&vt=1");
                        }, 1000);
                    } else {
                        showError("Произошла какая-то ошибка. Пожалуйста, обратитесь в службу поддержки.");
                    }
                },
                error: function (resp) {
                    console.log('some error during submitting order', resp);
                    if (resp.responseJSON && resp.responseJSON.message) {
                        showError(resp.responseJSON.message);
                    } else {
                        showError("Произошла какая-то ошибка. Пожалуйста, обратитесь в службу поддержки.");
                    }
                }
            });
        });


        $('.add-photo2-btn').click(function () {
            $('.pic-wrapper_2').show();
        });
        $('.add-photo3-btn').click(function () {
            $('.pic-wrapper_3').show();
        });



        $('#startOrderBtn').click();
        stepper1.next();
        stepper1.next();
    });
})(jQuery);