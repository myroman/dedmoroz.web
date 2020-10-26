var stepper1;

(function ($) {

    //custom functionality
    var dlgControl = function () {
        console.log('here')
        this.submitOrder = function (postdata, onSuccess, onError) {
            $.post(Dm.settings.baseurl + '/videos/create', postdata, onSuccess);
        }
    };

    let steps = {
        kidname: 0,
        photos: 1,
        letter: 2,
        additionalOptions: 3,
        customerDetails: 4,
        review: 5,

        finished: 10
    }

    let MaxPictures = 2;

    function initOrderState(sex) {
        let result = {
            step: 0,
            kidname: '',
            sex: sex,
            letter_filename: null,
            praiseid: 19,
            behaviorid: 1,
            customername: 'Роман',
            customeremail: 'roman.pavlushchenko@gmail.com',

            imageMap: {}
        };
        $('#ddlName').val(result.kidname)

        return result;
    }

    let orderState = null;

    let videoProcStatuses = {
        submitted: "submitted",
        ready: "ready"
    };

    let masterData = {};

    $(function () {
        $('.start-order-btn').click(function () {
            let sex = $(this).data('sex');
            startOrder(sex);
        });
        $('.order-dlg .goto-payment-btn').click(gotoPayment);
        $('.order-dlg .close-btn').click(closeDlg);
        $(".btn-upload-file").click(onFileUploadClick);
        $('#filePicture1').change(onFileChanged);
        $('.prev-btn').click(goBack);
        $(document).on('click', '.bs-stepper-pane.active .next-btn', goForward);
        $('.submit-order').click(submitOrder);
        

        function showError(message) {
            $('.wizard-warning').show();
            $('.wizard-warning p').text(message)
        }

        function hideError() {
            $('.wizard-warning').hide();
        }

        function loadComments(sex) {
            masterData.comments = [];
            $.get(Dm.settings.baseurl + '/md/photocomments?applicable_for=' + sex, function (resp) {
                var $comments = $(".ddl-comment");
                $.each(resp, function () {
                    $comments.append($("<option />").val(this.filepath).text(this.category + ' - ' + this.displayname));
                    masterData.comments.push(this);
                });
            });
        }

        function loadNames(sex) {
            masterData.names = [];
            $.get(Dm.settings.baseurl + '/md/names?sex=' + sex, function (resp) {
                var $ddl = $(".ddl-names");
                $ddl.html('');
                $ddl.append($("<option />").val('').text('Выберите имя'));

                $.each(resp, function () {
                    $ddl.append($("<option />").val(this.id).text(this.displayname));
                    masterData.names.push(this);
                });
            });
        }

        function loadPraises(sex) {
            masterData.praises = [];
            $.get(Dm.settings.baseurl + '/md/praises?applicable_for=' + sex, function (resp) {
                var $ddl = $(".ddl-praise");
                $ddl.html('');
                $ddl.append($("<option />").val('').text('Выберите похвалу'));

                $.each(resp, function () {
                    $ddl.append($("<option />").val(this.id).text(this.displayname));
                    masterData.praises.push(this);
                });
            });
        }
        
        function closeDlg() {
            $('.order-dlg').hide();
        }

        function startOrder(sex) {
            stepper1 = new Stepper($('.bs-stepper')[0]);
            orderState = initOrderState(sex);

            loadNames(sex);

            //load static masterdata
            function loadMasterdata() {

                masterData.behaviors = [{
                    id: 1,
                    text: 'Хорошее'
                }, {
                    id: 2,
                    text: 'Плохое или неоднозначное'
                }];
            }

            loadMasterdata();

            $('.order-dlg').show();
        }

        function onFileUploadClick() {
            var formdata = new FormData($('.image-upload-form')[0]);
            let picno = $('.image-upload-form').data('picno');
            $.ajax({
                type: 'POST',
                url: Dm.settings.baseurl + '/images',
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
        }

        function onFileChanged() {
            $('.btn-upload-file').removeAttr('disabled');
        }
        function goBack() {
            stepper1.previous();
            orderState.step--;
        }
        function goForward() {
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
        }

        function validateInput(step) {
            let errors = [];
            switch (step) {
                case steps.kidname:
                    let kidname = $('#ddlName').val();
                    if (!kidname) {
                        errors.push('Введите имя');
                    }
                    return errors;
                case steps.photos:
                    if (!orderState.imageMap['pic0']) {
                        errors.push('Необходимо загрузить хотя бы одну фотографию');
                    }
                    if (!$('#ddlCommentPic0').val()) {
                        errors.push('Выберите комментарий для фотографии')
                    }
                    (function validateCommentsAreEnteredForUploadedPics() {
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
                case steps.additionalOptions:
                    let praise = $('#ddlPraise').val();
                    if (!praise) {
                        errors.push('Введите похвалу');
                    }
                    return errors;
                case steps.customerDetails:
                    if (!$('#txtCustomerName').val()) {
                        errors.push('Введите Ваше имя');
                    }
                    if (!$('#txtCustomerEmail').val()) {
                        errors.push('Введите Ваш электронный адрес');
                    }
                    return errors;
                default:
                    return [];
            }
        }

        function saveDataToOrder(step) {
            switch (step) {
                case steps.kidname:
                    orderState.kidname = $('#ddlName').val();
                    loadComments(orderState.sex);
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
                case steps.letter:
                    loadPraises(orderState.sex);
                    break;
                case steps.additionalOptions:
                    orderState.praiseid = $('#ddlPraise').val();
                    orderState.behaviorid = $('input[name="behavior"]:checked').val();
                    break;
                case steps.customerDetails:
                    orderState.customername = $('#txtCustomerName').val();
                    orderState.customeremail = $('#txtCustomerEmail').val();
                    break;
            }
        }

        function initReviewForm() {
            function getForWhom(sex) {
                switch (sex) {
                    case 0:
                        return "Мальчик";
                    case 1:
                        return "Девочка";
                    case 2:
                        return "Двое детей";
                }
            }
            $('.review-form .sex-text').text(getForWhom(orderState.sex));

            let kidname = masterData.names.find(x => x.id == orderState.kidname).displayname;
            $('.review-form .name-text').text(kidname);

            $('.review-form .letter-text').text(orderState.letter_filename ? 'Да' : 'Нет');

            let praise = masterData.praises.find(x => x.id == orderState.praiseid);
            if (praise) {
                $('.review-form .praise-text').text(praise.displayname);
            }

            let behavior = masterData.behaviors.find(x => x.id == orderState.behaviorid);
            if (behavior) {
                $('.review-form .behavior-text').text(behavior.text);
            }

            $('.review-form .customer-name-text').text(orderState.customername);
            $('.review-form .customer-email-text').text(orderState.customeremail);

            let i = 0;
            let photosUploaded = 0;
            for (i = 0; i < MaxPictures; i++) {
                let picid = 'pic' + i;
                if (orderState.imageMap[picid] && orderState.imageMap[picid].commentid) {
                    let commentSelector = '.review-form .comment' + i + '-text';
                    $(commentSelector).text(orderState.imageMap[picid].commentid).show();
                    photosUploaded++;
                }
            }

            $('.review-form .photos-number-text').text(photosUploaded);
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

        function submitOrder() {
            let orderInfo = {
                kidname: orderState.kidname,
                sex: !!orderState.sex,
                images: {
                    content: []
                },
                letter_filename: orderState.letter_filename,
                praiseid: +orderState.praiseid,
                behaviorid: +orderState.behaviorid,
                customername: orderState.customername,
                customeremail: orderState.customeremail
            };
            let i = 0;
            for (i = 0; i < MaxPictures; i++) {
                let key = 'pic' + i;
                if (orderState.imageMap[key] && orderState.imageMap[key].name) {
                    orderInfo.images.content.push(orderState.imageMap[key]);
                }
            }

            $.ajax({
                type: 'POST',
                url: Dm.settings.baseurl + '/orders',
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
        }


        $('.add-photo2-btn').click(function () {
            $('.pic-wrapper_2').show();
        });
        $('.add-photo3-btn').click(function () {
            $('.pic-wrapper_3').show();
        });

        //allows to see response data before redirect
        window.onunload = function () {
            debugger;
        }

        // $('#startOrderBtn').click();        
    });
})(jQuery);