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

    let MaxPictures = 3;

    function initOrderState(gender) {
        let result = {
            step: 0,
            kidname: '',
            gender: gender,
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
            let gender = $(this).data('gender');
            startOrder(gender);
        });
        $('.order-dlg .goto-payment-btn').click(gotoPayment);
        $('.order-dlg .close-btn').click(closeDlg);
        $('.file-picture').change(onFileChanged);
        $('.file-letter').change(onLetterFileChanged);
        $(".btn-upload-file").click(onFileUploadClick);
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

        function loadComments(gender) {
            masterData.comments = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/photocomments?applicable_for=' + gender,
                    function (resp) {
                        var $comments = $(".ddl-comment");
                        $.each(resp, function () {
                            $comments.append($("<option />").val(this.filepath).text(this.category + ' - ' + this.displayname));
                            masterData.comments.push(this);
                        });

                    })
                .always(function () {
                    Dm.hideLoader();
                });
        }

        function loadNames(gender) {
            masterData.names = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/names?gender=' + gender,
                    function (resp) {
                        var $ddl = $(".ddl-names");
                        $ddl.html('');
                        $ddl.append($("<option />").val('').text('Выберите имя'));

                        $.each(resp, function () {
                            $ddl.append($("<option />").val(this.id).text(this.displayname));
                            masterData.names.push(this);
                        });
                    })
                .always(function () {
                    Dm.hideLoader();
                });;
        }

        function loadPraises(gender) {
            masterData.praises = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/praises?applicable_for=' + gender, function (resp) {
                var $ddl = $(".ddl-praise");
                $ddl.html('');
                $ddl.append($("<option />").val('').text('Выберите похвалу'));

                $.each(resp, function () {
                    $ddl.append($("<option />").val(this.id).text(this.displayname));
                    masterData.praises.push(this);
                });
            })
            .always(function () {
                Dm.hideLoader();
            });;
        }

        function closeDlg() {
            $('.order-dlg').hide();
        }

        function startOrder(gender) {
            stepper1 = new Stepper($('.bs-stepper')[0]);
            orderState = initOrderState(gender);

            loadNames(gender);

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
            let thisId = $(this).attr('id');
            let $form = $(this).parents('.image-upload-form');
            var formdata = new FormData($form[0]);
            let picno = $form.data('picno');
            let onPhotoUploaded = function (data) {
                $('#photo-uploaded-' + picno).show();
                orderState.imageMap['pic' + picno] = {
                    name: data.filename
                };
            }
            let onLetterUploaded = function (data) {
                $('#letter-uploaded').show();
                orderState.letter_filename = data.filename;
            }
            let successHandler = thisId == 'btnUploadLetterFile' ? onLetterUploaded : onPhotoUploaded;
            Dm.showLoader();
            $.ajax({
                type: 'POST',
                url: Dm.settings.baseurl + '/images',
                data: formdata,
                contentType: false,
                cache: false,
                processData: false,
                success: successHandler,
                complete: function() {
                    Dm.hideLoader();
                }
            });
        }

        function onFileChanged() {
            let parentForm = $(this).parents('form');
            let picNo = parentForm.data('picno');
            let btnUploadId = 'btnUploadFile' + picNo;
            $('#' + btnUploadId).removeAttr('disabled');
        }

        function onLetterFileChanged() {
            let btnUploadId = 'btnUploadLetterFile';
            $('#' + btnUploadId).removeAttr('disabled');
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
                    (function validateCommentsAreEnteredForUploadedPics() {
                        let i = 0;
                        for (i = 0; i < MaxPictures; i++) {
                            let imageInfo = orderState.imageMap['pic' + i];
                            if (imageInfo && imageInfo.name) {
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
                    loadComments(orderState.gender);
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
                    loadPraises(orderState.gender);
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
            function getForWhom(gender) {
                switch (gender) {
                    case 0:
                        return "Мальчик";
                    case 1:
                        return "Девочка";
                    case 2:
                        return "Двое детей";
                }
            }
            $('.review-form .gender-text').text(getForWhom(orderState.gender));

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
                let imageInfo = orderState.imageMap[picid];
                if (imageInfo && imageInfo.commentid) {
                    let commentSelector = '.review-form .comment' + i + '-text';

                    function findCommentByFilepath(filepath) {
                        if (!filepath) return '';
                        let j;
                        for (j = 0; j < masterData.comments.length; j++) {
                            if (masterData.comments[j].filepath == filepath) {
                                return masterData.comments[j].displayname;
                            }
                        }
                        return ''
                    }
                    $(commentSelector).text(findCommentByFilepath(imageInfo.commentid));
                    $(commentSelector).parents('.comment-wrapper').show();
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
                gender: orderState.gender,
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

            Dm.showLoader();
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

                    Dm.hideLoader();
                }
            });
        }


        $('.add-photo1-btn').click(function () {
            $('.pic-wrapper_1').show();
        });
        $('.add-photo2-btn').click(function () {
            $('.pic-wrapper_2').show();
        });

        //allows to see response data before redirect
        window.onunload = function () {
            debugger;
        }

        // $('#startOrderBtn').click();        
    });
})(jQuery);