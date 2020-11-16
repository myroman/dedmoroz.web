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
    let imageCache = {
        "0": {},
        "1": {},
        "2": {},
        "letter": {}
    }

    let masterData = {};

    $(function () {
        // $('.order-dlg .goto-payment-btn').click(gotoPayment);
        // $('.order-dlg .close-btn').click(closeDlg);

        // $('.prev-btn').click(goBack);
        // $('.submit-order').click(submitOrder);
        $('.image-aspect').change(onImageAspectChanged);

        // stepper back,forward between dialog screens
        $('.js-next').click(function () {
            let currentStepId = $(this).parents('.content-item').attr('id');
            if (currentStepId == 'step-3') {
                //validate photo

                let chosenFiles = $('.pic-wrapper input[type=hidden]');
                let i, uploadedFilesNumber = 0;
                let errors = [];
                for (i = 0; i < chosenFiles.length; i++) {
                    if ($(chosenFiles[i]).val()) {
                        uploadedFilesNumber++;
                    }
                }

                if (!uploadedFilesNumber) {
                    errors.push('Необходимо загрузить хотя бы одну фотографию');
                }
                (function validateCommentsAreEnteredForChosenPics() {
                    let i = 0;
                    for (i = 0; i < MaxPictures; i++) {
                        let hiddenInput = chosenFiles[i];
                        let picNo = getPicNo(hiddenInput);
                        let $ddlComment = $('#ddlCommentPic' + picNo);
                        if ($(hiddenInput).val() && !$ddlComment.val()) {
                            errors.push('Выберите комментарий для фотографии #' + (i + 1));
                        }
                    }
                })();

                let err = errors.join(". ");

                if (err) {
                    console.error(err);
                    // setTimeout(function () {
                    //     $('input, select').trigger('refresh');
                    // }, 1)
                    // $('.photo-error').text(err).show();
                    return;
                }

                for (i = 0; i < chosenFiles.length; i++) {
                    if ($(chosenFiles[i]).val()) {
                        uploadFile(chosenFiles[i]);
                    }
                }
            }
            var id = $(this).attr('href');

            // debugger;
            $(this).parents('.content-item').addClass('hide-item');
            $(id).removeClass('hide-item');
            goForward();
            return false;
        });
        $('.js-prev').click(function () {
            $(this).parents('.content-item').addClass('hide-item');
            var id = $(this).attr('href');
            $(id).removeClass('hide-item');
            goBack();
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
                selectSearch: true,
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
                name: "required",
                email: "required",
            },
            messages: {
                name: "*Обязательное поле",
                msg: "*Обязательное поле",
            },
            submitHandler: function (form) {
                $("#step-7").removeClass('hide-item');
                $("#step-6").addClass('hide-item');
                goForward();
            }
        });

        $('.submit-order').click(function () {
            submitOrder(function () {
                $("#step-7").addClass('hide-item');
            });
        });


        function showError(message) {
            $('.wizard-warning').show();
            $('.wizard-warning p').text(message)
        }

        function hideError() {
            $('.wizard-warning').hide();
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
            masterData.names = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/names?gender=' + gender,
                    function (resp) {
                        var $ddl = $("select.ddl-names");
                        $ddl.html('');
                        $ddl.append($("<option />").val('').text('Выберите имя'));

                        $.each(resp, function () {
                            $ddl.append($("<option />").val(this.id).text(this.displayname));
                            masterData.names.push(this);
                        });

                        $ddl.val('617');

                        refreshElement('select.ddl-names');
                    })
                .always(function () {
                    Dm.hideLoader();
                });;
        }

        function loadPraises(gender) {
            masterData.praises = [];
            Dm.showLoader();
            $.get(Dm.settings.baseurl + '/md/praises?applicable_for=' + gender, function (resp) {
                    var $ddl = $("select.ddl-praise");
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
                    }

                    refreshElement('select.ddl-praise');
                })
                .always(function () {
                    Dm.hideLoader();
                });;
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
                    text: 'Плохое или неоднозначное'
                }];
            }

            loadMasterdata();

            $('.order-dlg').show();
        }

        function getPicNo(elem) {
            let $parent = $(elem).parents('.pic-wrapper');
            return $parent.data('picno');
        }

        /*upload image on background*/
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                console.log();

                reader.onload = function (e) {
                    $('#' + input.id).parents('label').addClass('active');
                    $('#' + input.id).parents('label').find('.photo-list__photo').css('background-image', "url(" + e.target.result + ")");
                }

                reader.readAsDataURL(input.files[0]);
            }
        }

        // $(".input-photo").change(function () {
        //     readURL(this);
        // });
        $(".input-photo").change(function () {
            onFileChanged(this);
        });

        // $('.file-picture').change(onFileChanged);
        // $(".btn-upload-file").click(uploadFile);

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

            // $('#btnUploadFile' + picNo).removeAttr('disabled');
            // let $btnUpload = $parent.find('.btn-upload-file');
            // $btnUpload.removeAttr('disabled');

            // $parent.find('.croppie-container').show();
            let holder = $parent.find('.photo-list__photo')[0];
            readFile(input, holder, function (imageUrl) {
                let picNo = getPicNo(input);
                console.log('refreshing image for', picNo)
                imageCache[picNo].imageUrl = imageUrl;
                if (picNo == 'letter') {
                    imageCache[picNo].croppieSettings = {
                        longSide: 550,
                        shortSide: 400,
                        reducCoef: 0.25,
                        boundaryWidth: 200,
                        boundaryHeight: 200
                    }
                } else {
                    imageCache[picNo].croppieSettings = {
                        // longSide: 700,
                        // shortSide: 660,
                        // reducCoef: 0.15,
                        longSide: 400,
                        shortSide: 300,
                        reducCoef: 0.5,
                        boundaryWidth: 200,
                        boundaryHeight: 200
                    }
                }
                refreshCroppieImage(holder, imageUrl, null);
                // $(input).parents('.pic-wrapper').find('.aspect-container').show();
                // $(input).parents('.photo-list__label').addClass('photo-list__label_extra-bottom-space');
                let $hidFile = $(input).parent().find('input[type=hidden]');
                $hidFile.val(1);

                $(input).remove();
            });
        }

        function uploadFile(fileElem) {
            let picno = getPicNo(fileElem);
            let successHandler;
            let isLetter = $(fileElem).attr('id') == 'hidLetter';
            if (isLetter) {
                successHandler = function (data) {
                    // $('#letter-uploaded').show();
                    orderState.letter_filename = data.filename;
                };
            } else {
                successHandler = function (data) {
                    // $('#photo-uploaded-' + picno).show();
                    orderState.imageMap['pic' + picno] = {
                        name: data.filename,
                        commentid: $('#ddlCommentPic' + picno).val()
                    };
                }
            }
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
                    success: successHandler,
                    complete: function () {
                        Dm.hideLoader();
                    },
                    error: function (resp) {
                        let selector = isLetter ? '.letter-error' : '.photo-error';
                        $(selector).text('Ошибка при загрузке фотографии. Мы поддерживаем изображения форматов JPG и PNG. Если же расширение верное, то обратитесь в службу техю поддержки.').show();
                    }
                });
            });
        }

        function refreshCroppieImage(elem, image_url, aspect) {
            let imageInfo = imageCache[getPicNo(elem)];
            if (imageInfo.croppie) {
                imageInfo.croppie.destroy();
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
            // let errors = validateInput(orderState.step);
            // if (errors.length) {
            //     showError(errors.join('. '));
            //     return;
            // }
            saveDataToOrder(orderState.step);

            console.log('Order state:', orderState);

            hideError();
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
                    // case steps.photos:
                    //     let i = 0;
                    //     for (i = 0; i < MaxPictures; i++) {
                    //         let picId = 'pic' + i;
                    //         if (orderState.imageMap[picId]) {
                    //             orderState.imageMap[picId].commentid = $('#ddlCommentPic' + i).val();
                    //         }
                    //     }
                    //     break;
                case steps.letter:
                    loadPraises(orderState.gender);
                    break;
                case steps.additionalOptions:
                    orderState.praiseid = $('#ddlPraise').val();
                    orderState.behaviorid = $('#ddlBehavior').val();
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

        function submitOrder(onSuccess) {
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

                    if (onSuccess) {
                        onSuccess(data);
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
    });
})(jQuery);