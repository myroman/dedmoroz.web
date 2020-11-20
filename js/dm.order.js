(function ($) {
    let steps = {
        kidname: 0,
        photos: 1,
        letter: 2,
        additionalOptions: 3,
        customerDetails: 4,
        review: 5,

        finished: 10
    }

    let letter_croppie_settings = {
        longSide: 550,
        shortSide: 400,
        reducCoef: 0.25,
        boundaryWidth: 200,
        boundaryHeight: 200
    }

    let photo_croppie_settings = {
        // longSide: 700,
        // shortSide: 660,
        // reducCoef: 0.15,
        longSide: 400,
        shortSide: 300,
        reducCoef: 0.5,
        boundaryWidth: 200,
        boundaryHeight: 200
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
            customername: '',
            customeremail: '',

            imageMap: {}
        };
        $('#ddlName').val(result.kidname)

        return result;
    }

    let orderState = null;
    let imageCache = {
        "0": {},
        "1": {},
        "2": {},
        "letter": {}
    }

    let masterData = {};

    $(function () {
        $('.image-aspect').change(onImageAspectChanged);

        $('.js-next').click(function (e) {
            let currentStepId = $(this).parents('.content-item').attr('id');
            var that = this;

            function nextStep() {
                var id = $(that).attr('href');
                $(that).parents('.content-item').addClass('hide-item');
                $(id).removeClass('hide-item');
                goForward();
            }
            if (currentStepId == 'step-3') {
                //validate photo

                let chosenFiles = $('.kids-photo-list input[type=hidden]');
                let i, uploadedFilesNumber = 0;
                let errors = [];
                for (i = 0; i < chosenFiles.length; i++) {
                    if ($(chosenFiles[i]).val()) {
                        uploadedFilesNumber++;
                    }
                }

                if (!uploadedFilesNumber) {
                    errors.push('Необходимо выбрать хотя бы одну фотографию');
                }
                (function validateCommentsAreEnteredForChosenPics() {
                    let i = 0;
                    for (i = 0; i < MaxPictures; i++) {
                        let hiddenInput = chosenFiles[i];
                        var picNo = getPicNo(hiddenInput);
                        let $ddlComment = $('#ddlCommentPic' + picNo);
                        if ($(hiddenInput).val() && !$ddlComment.val()) {
                            errors.push('Выберите комментарий для фотографии #' + (i + 1));
                        }
                    }
                })();

                let err = errors.join(". ");
                if (err) {
                    console.error(err);
                    $('.photo-error').text(err).show();
                    scrollUp();
                    e.preventDefault()
                    return;
                }

                //now upload photos
                for (i = 0; i < chosenFiles.length; i++) {
                    if ($(chosenFiles[i]).val()) {
                        var picNo = getPicNo(chosenFiles[i]);
                        uploadFile(chosenFiles[i], function (resp) {
                            console.log('uploaded OK', resp);
                            orderState.imageMap['pic' + picNo] = {
                                name: resp.filename,
                                commentid: $('#ddlCommentPic' + picNo).val()
                            };

                            nextStep();
                        }, function (resp) {
                            console.log('failed to upload', resp);
                            let msg = resp && resp.responseJSON ? resp.responseJSON.error : 'Ошибка при загрузке фотографии';
                            $('.photo-error').text(msg).show();
                            scrollUp();
                        });
                    }
                }
                e.preventDefault();
                return false;
            }

            //letter
            if (currentStepId == 'step-4') {
                let chosenFile = $('.pic-wrapper_letter input[type=hidden]')[0];
                if (!$(chosenFile).val()) {
                    nextStep();
                    e.preventDefault();
                    return false;
                }

                uploadFile(chosenFile, function (resp) {
                    orderState.letter_filename = resp.filename;
                    nextStep();
                }, function (resp) {
                    let msg = resp && resp.responseJSON ? resp.responseJSON.error : 'Ошибка при загрузке письма';
                    $('.letter-error').text(msg).show();
                    scrollUp();
                });
                e.preventDefault();
                return false;
            }

            nextStep();
        });
        $('.js-prev').click(function (e) {
            $(this).parents('.content-item').addClass('hide-item');
            var id = $(this).attr('href');
            $(id).removeClass('hide-item');
            goBack();
            e.preventDefault();
            return false;
        });

        $('.js-delete-photo').click(function (e) {
            let picNo = getPicNo(this);
            let imageInfo = imageCache[picNo];
            //cleanup
            if (imageInfo.croppie) {
                imageInfo.croppie.destroy();
                imageInfo.croppie = null;
            }
            //TODO: delete image from server
            imageCache[picNo] = {};
            if (picNo == 'letter') {
                orderState.letter_filename = null;
            }
            let $container = $(this).parents('.pic-wrapper');

            if ($container.find('input[type=hidden]').val()) {
                let $input = $('<input type="file" class="input-photo input-photo_hidden" />').attr('id', 'photo-' + picNo);
                $container.find('.photo-list__label').prepend($input);
                $input.change(function () {
                    onFileChanged(this);
                });

                $container.find('input[type=hidden]').val('');
            }

            e.preventDefault();
            return false;
        });

        //choose boy, girl
        $('.js-choose-radio .choose-radio__gender input').live('change', function () {
            $(this).parents('.content-item').addClass('hide-item');
            $(this).parents('.content-item').next().removeClass('hide-item');
            let gender = $(this).data('gender');
            startOrder(gender);
        });

        function refreshElement(selector) {
            setTimeout(function () {
                $(selector).trigger('refresh');
            }, 1)
        }

        if ($('.js-styled').length) {
            $('.js-styled').styler({
                selectSearch: true
            });
        };

        $("#childName").validate({
            invalidHandler: function () {
                setTimeout(function () {
                    $('input, select').trigger('refresh');
                }, 1)
            },
            submitHandler: function (form) {
                $("#step-3").removeClass('hide-item');
                $("#step-2").addClass('hide-item');
                goForward();
            },
        });

        $("#childOptions").validate({
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
                goForward();
            },
        });

        $("#contactDetails").validate({
            rules: {
                customerName: "required",
                customerEmail: {
                    required: true,
                    email: true
                }
            },
            messages: {
                customerName: "*Обязательное поле",
                customerEmail: {
                    required: "*Обязательное поле",
                    email: "Введите корректный email"
                },
            },
            submitHandler: function (form) {
                $("#step-7").removeClass('hide-item');
                $("#step-6").addClass('hide-item');
                goForward();
            }
        });

        $('.submit-order').click(function () {
            submitOrder(function (data) {
                console.log('success, redirecting to wait page', data);
                let ordernumber = data.ordernumber;
                if (ordernumber) {
                    setTimeout(function () {
                        window.location.replace("in-progress.html?ordernumber=" + ordernumber + "&vt=1");
                    }, 1000);
                } else {
                    showReviewError("Произошла какая-то ошибка. Пожалуйста, обратитесь в службу поддержки.");
                    $('.submit-order').prop('disabled', false);
                    scrollUp();
                }
                // $("#step-7").addClass('hide-item');
            }, function (resp) {
                console.log('some error during submitting order', resp);
                if (resp.responseJSON && resp.responseJSON.error) {
                    showReviewError(resp.responseJSON.error);
                } else {
                    showReviewError("Произошла какая-то ошибка. Пожалуйста, обратитесь в службу поддержки.");
                }
                scrollUp();

                $('.submit-order').prop('disabled', false);

                Dm.hideLoader();
            });
        });

        function showReviewError(message) {
            $('.review-form .error-block').text(message).show();
        }

        function clearReviewError() {
            $('.review-form .error-block').hide();
        }

        function scrollUp() {
            $("html, body").animate({
                scrollTop: 0
            }, 300);
        }

        function loadComments(gender) {
            masterData.comments = [];
            // Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/photocomments?applicable_for=' + gender,
                    function (resp) {
                        var $ddl = $("select.ddl-comment");
                        $ddl.html('');
                        $ddl.append($("<option />").val('').text("-- Выберите комментарий --"));
                        let defaultValue;
                        $.each(resp, function () {
                            $ddl.append($("<option />").val(this.filepath).text(this.category + ' - ' + this.displayname));
                            masterData.comments.push(this);
                            if (this.displayname.indexOf('чудесная фотография') > -1) {
                                defaultValue = this.filepath;
                            }
                        });
                        if (defaultValue) {
                            $ddl.first().val(defaultValue);
                        }

                        refreshElement('select.ddl-comment');
                    })
                .always(function () {
                    // Dm.hideLoader();
                });
        }

        function loadNames(gender) {
            masterData.names = Dm.masterdata.names[gender + ''];

            var $ddl = $("select.ddl-names");
            $ddl.html('');
            $ddl.append($("<option />").val('').text('Выберите имя'));

            $.each(masterData.names, function () {
                $ddl.append($("<option />").val(this.id).text(this.displayname));
                masterData.names.push(this);
            });
            refreshElement('select.ddl-names');
        }

        function loadPraises(gender) {
            masterData.praises = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/praises?applicable_for=' + gender, function (resp) {
                    var $ddl = $("#ddlPraise");
                    $ddl.html('');
                    $ddl.append($("<option />").val('').text('-- Выберите похвалу --'));

                    let defaultValue;
                    $.each(resp, function () {
                        $ddl.append($("<option />").val(this.id).text(this.displayname));
                        masterData.praises.push(this);
                        if (this.displayname.indexOf('Разные увлечения') > -1) {
                            defaultValue = this.id;
                        }
                    });
                    if (defaultValue) {
                        $ddl.val(defaultValue);
                        orderState.praiseid = defaultValue;
                    }

                    refreshElement('#ddlPraise');
                })
                .always(function () {
                    Dm.hideLoader();
                });
        }

        function startOrder(gender) {
            orderState = initOrderState(gender);

            loadNames(gender);

            function loadMasterdata() {

                masterData.behaviors = [{
                    id: 1,
                    text: 'Хорошее'
                }, {
                    id: 2,
                    text: 'Шкодливое'
                }];
            }

            loadMasterdata();

            $('.order-dlg').show();
        }

        function getPicNo(elem) {
            let $parent = $(elem).parents('.pic-wrapper');
            return $parent.data('picno');
        }

        $(".input-photo").change(function () {
            onFileChanged(this);
        });

        function onFileChanged(input) {
            function readFile(input, holder, success) {
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        success(e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                } else {
                    console.error("Ваш браузер не поддерживает загрузку фотографий, пожалуйста используйте последнюю версию для браузеров Google Chrome, Mozilla Firefox или Safari");
                }
            }

            let $parent = $(input).parents('.pic-wrapper');

            let holder = $parent.find('.photo-list__photo')[0];
            readFile(input, holder, function (imageUrl) {
                let picNo = getPicNo(input);
                console.log('refreshing image for', picNo)
                imageCache[picNo].imageUrl = imageUrl;
                if (picNo == 'letter') {
                    imageCache[picNo].croppieSettings = letter_croppie_settings
                } else {
                    imageCache[picNo].croppieSettings = photo_croppie_settings
                }
                refreshCroppieImage(holder, imageUrl, null);
                let $hidFile = $(input).parent().find('input[type=hidden]');
                $hidFile.val(true);
                console.log('removing input', input)
                $(input).remove();
            });
        }

        function uploadFile(fileElem, onSuccess, onError) {
            let picno = getPicNo(fileElem);

            Dm.showLoader();

            let resultOpts = {
                type: 'base64',
                size: 'original'
            };
            let croppie = imageCache[picno].croppie;
            croppie.result(resultOpts).then(function (imgEncoded) {
                let data = {
                    'content': imgEncoded
                }
                $.ajax({
                    type: 'POST',
                    url: Dm.settings.baseurl + '/images/base64',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    success: onSuccess,
                    error: onError,
                    complete: function () {
                        Dm.hideLoader();
                    }
                });
            });
        }

        function refreshCroppieImage(elem, image_url, aspect) {
            let imageInfo = imageCache[getPicNo(elem)];
            if (imageInfo.croppie) {
                imageInfo.croppie.destroy();
                imageInfo.croppie = null;
            }

            let croppieSettings = imageInfo.croppieSettings;
            if (!croppieSettings) return;

            let croppie;
            croppie = imageInfo.croppie = createCroppie(elem, aspect);

            croppie.bind({
                url: image_url
            });

            let $parent = $(elem).parents('.pic-wrapper');
            $parent.find('.image-aspect-wrapper').show();

            function createCroppie(elem, ratio) {
                let viewport = null;
                let boundary = {
                    width: croppieSettings.boundaryWidth,
                    height: croppieSettings.boundaryHeight
                };
                let reducCoef = croppieSettings.reducCoef;

                let long_side = croppieSettings.longSide * reducCoef,
                    short_side = croppieSettings.shortSide * reducCoef;
                if (ratio == 'landscape') {
                    viewport = {
                        width: long_side,
                        height: short_side
                    }
                } else {
                    viewport = {
                        width: short_side,
                        height: long_side
                    }
                }
                return new Croppie(elem, {
                    viewport: viewport,
                    // boundary: boundary,
                    enableOrientation: true
                });
            }
        }

        function onImageAspectChanged() {
            let picNo = getPicNo(this);
            let loadedImageUrl = imageCache[picNo].imageUrl;
            let $parent = $(this).parents('.pic-wrapper');
            let elem = $parent.find('.photo-list__photo')[0]
            refreshCroppieImage(elem, loadedImageUrl, this.value);
        }

        function goBack() {
            orderState.step--;
        }

        function goForward() {
            saveDataToOrder(orderState.step);

            console.log('Order state:', orderState);

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

        $('#ddlName').change(function () {
            orderState.kidname = $(this).val();
        });
        $('#ddlPraise').change(function () {
            orderState.praiseid = $(this).val();
        });
        $('#ddlBehavior').change(function () {
            orderState.behaviorid = $(this).val();
        });
        $('#txtCustomerName').change(function () {
            orderState.customername = $(this).val();
        });
        $('#txtCustomerEmail').change(function () {
            orderState.customeremail = $(this).val();
        });

        function saveDataToOrder(step) {
            switch (step) {
                case steps.kidname:
                    loadComments(orderState.gender);
                    break;
                case steps.letter:
                    loadPraises(orderState.gender);
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

            function validateOrder(orderState) {
                let errors = [];
                if (!orderState.kidname) {
                    errors.push('имя ребенка');
                }
                if (orderState.gender >= 2) {
                    errors.push('пол ребенка');
                }
                if (!orderState.imageMap) {
                    errors.push('фотографии');
                } else {
                    let i;

                    let photoKeys = Object.keys(orderState.imageMap);
                    for (i = 0; i < photoKeys.length; i++) {
                        let imageInfo = orderState.imageMap[photoKeys[i]];
                        if (imageInfo.name && !imageInfo.commentid) {
                            errors.push('комментарий к фотографии №' + (i + 1));
                        }
                    }
                }


                if (!orderState.praiseid) {
                    errors.push('похвала');
                }
                if (!orderState.behaviorid) {
                    errors.push('поведение');
                }
                if (!orderState.customername) {
                    errors.push('ваше имя');
                }
                if (!orderState.customeremail) {
                    errors.push('ваш email');
                }

                if (errors.length) {
                    return 'Кажется, некоторые данные не были введены, пожалуйста введите: ' + errors.join(', ');
                }
            }
            clearReviewError();
            $('.submit-order').prop('disabled', false);
            let validationMsg = validateOrder(orderState);
            if (validationMsg) {
                showReviewError(validationMsg);
                $('.submit-order').prop('disabled', true);
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

        function submitOrder(onSuccess, onError) {
            //to avoid double submission
            $('.submit-order').prop('disabled', true);

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
                success: onSuccess,
                error: onError
            });
        }
    });
})(jQuery);