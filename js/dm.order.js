(function ($) {

    let letter_croppie_settings = {
        longSide: 930,
        shortSide: 600,
        reducCoef: 0.15,
        boundaryWidth: 200,
        boundaryHeight: 200,
        enableResize: true
    }
    let croppieResultLongSide = 1200;

    let photo_croppie_settings = {
        longSide: 700,
        shortSide: 600,
        reducCoef: 0.25,
        boundaryWidth: 200,
        boundaryHeight: 200,
        enableResize: true
    }

    let MaxPictures = 3;

    let orderState = null;
    let imageCache = {
        "0": {},
        "1": {},
        "2": {},
        "letter": {}
    }
    let kidtypes = {
        'boy': 0,
        'girl': 1,
        '2kids': 2,
        'group': 10
    };

    let masterData = {
        behaviors: [{
            id: 1,
            text: 'Хорошее'
        }, {
            id: 2,
            text: 'Шкодливое'
        }]
    };

    $(function () {
        $('.image-aspect').change(onImageAspectChanged);
        $('.comment-wrapper').hide();
        $('.praise-wrapper').hide();

        function matchByFilterName(params, data) {
            if ($.trim(params.term) === '') {
                return data;
            }

            if (typeof data.text === 'undefined' || typeof data.element === 'undefined') {
                return null;
            }

            let filterField = $(data.element).data('filter');
            if (!filterField) {
                return null;
            }

            if (filterField.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
                return data;
            }
            return null;
        }
        initSelect2('.ddl-names', matchByFilterName);
        initSelect2('.ddl-comment');
        initSelect2('.ddl-praise');
        initSelect2('.ddl-behavior');
        initSelect2('.ddl-gender');

        $('.js-next').click(function (e) {
            let currentStepId = $(this).parents('.content-item').attr('id');
            var that = this;

            function nextStep() {
                var id = $(that).attr('href');
                if (orderState.kidtype == kidtypes['2kids'] && (id == "#step-5")) {
                    id += "_2-kids";
                }
                if (orderState.kidtype == kidtypes['group'] && (id == "#step-5")) {
                    id += "_2-kids";
                }
                $(that).parents('.content-item').addClass('hide-item');
                $(id).removeClass('hide-item');
                scrollUp();
                
                goForward(id);
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
                let filesForUpload = []
                for (i = 0; i < chosenFiles.length; i++) {
                    if ($(chosenFiles[i]).val()) {
                        filesForUpload.push(chosenFiles[i])
                    }
                }

                let successCallbacksNumber = 0;
                for (i = 0; i < filesForUpload.length; i++) {
                    var picNo = getPicNo(filesForUpload[i]);
                    Dm.showLoader();
                    uploadFile(picNo, function (respWrap) {
                        successCallbacksNumber++;

                        console.log('uploaded OK', respWrap.picNo, respWrap.resp);
                        orderState.imageMap['pic' + respWrap.picNo] = {
                            name: respWrap.resp.filename,
                            commentid: $('#ddlCommentPic' + respWrap.picNo).val(),
                            aspect: imageCache[respWrap.picNo].aspect
                        };
                        console.log("orderstate after image upload", orderState.imageMap['pic' + respWrap.picNo])

                        if (successCallbacksNumber == filesForUpload.length) {
                            Dm.hideLoader();
                            nextStep();
                        }
                    }, function (respWrap) {
                        let resp = respWrap.resp;
                        console.log('failed to upload', resp);
                        Dm.hideLoader();
                        let msg = resp && resp.responseJSON ? resp.responseJSON.error : 'Ошибка при загрузке фотографии';
                        $('.photo-error').text(msg).show();
                        scrollUp();
                    });
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
                Dm.showLoader();
                uploadFile('letter', function (respWrap) {
                    orderState.letter = {
                        name: respWrap.resp.filename,
                        aspect: imageCache[respWrap.picNo].aspect
                    };
                    Dm.hideLoader();
                    nextStep();
                }, function (respWrap) {
                    Dm.hideLoader();
                    let resp = respWrap.resp;
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
            if (orderState.kidtype == kidtypes["2kids"] && (id == "#step-2" || id == "#step-5")) {
                id += "_2-kids";
            }

            if (orderState.kidtype == kidtypes['group']) {
                if (id == '#step-5') {
                    id += "_2-kids";
                } else if (id == '#step-2') {
                    id = '#step-1';
                }                
            }
            $(id).removeClass('hide-item');
            scrollUp();
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
                orderState.letter = null;
            }
            let $container = $(this).parents('.pic-wrapper');

            if ($container.find('input[type=hidden]').val()) {
                let $input = $('<input type="file" class="input-photo input-photo_hidden" />').attr('id', 'photo-' + picNo);
                $container.find('.photo-list__label').prepend($input);
                $input.change(function () {
                    onFileChanged(this);
                });
                $input.click();

                $container.find('input[type=hidden]').val('');
            } else if ($container.find('input[type=file]').length) {
                $container.find('input[type=file]').click();
            }

            e.preventDefault();
            return false;
        });

        $('.js-image-rotate').click(function (e) {
            let picno = getPicNo(this);
            let croppie = imageCache[picno].croppie;
            if (!croppie) {
                e.preventDefault();
                return;
            }

            croppie.rotate(parseInt($(this).data('deg')));
            croppie.setZoom(1);
        });

        //choose boy, girl
        $('.js-choose-radio .choose-radio__gender input').live('change', function () {
            let gender = $(this).data('gender');
            switch (gender) {
                case kidtypes['boy']:
                case kidtypes['girl']:
                    $("#step-2").removeClass('hide-item');
                    
                    startOrder(gender);
                    break;
                case kidtypes['2kids']:
                    $("#step-2_2-kids").removeClass('hide-item');                    
                    startOrder(gender);
                    break;
                case kidtypes['group']:
                    // $("#step-2_group").removeClass('hide-item');
                    $("#step-3").removeClass('hide-item');
                    $("#step-2_group").addClass('hide-item');

                    startOrder(gender);
                    break;
            }
            $("#step-1").addClass('hide-item');
            scrollUp();
        });

        $("#childName").validate({
            invalidHandler: function () {
                setTimeout(function () {
                    $('input, select').trigger('refresh');
                }, 1)
            },
            submitHandler: function (form) {
                $("#step-3").removeClass('hide-item');
                $("#step-2").addClass('hide-item');
                goForward('step-3');
                scrollUp();
            },
        });
        $("#twoKidsNames").validate({
            rules: {
                gender2_1: "required",
                gender2_2: "required",
                ddlName2_1: "required",
                ddlName2_2: "required",
            },
            messages: {
                gender2_1: "*Обязательное поле",
                gender2_2: "*Обязательное поле",
                ddlName2_1: "*Обязательное поле",
                ddlName2_2: "*Обязательное поле",
            },
            invalidHandler: function () {
                setTimeout(function () {
                    $('input, select').trigger('refresh');
                }, 1)
            },
            submitHandler: function (form) {
                $("#step-3").removeClass('hide-item');
                $("#step-2_2-kids").addClass('hide-item');
                goForward('step-3');
                scrollUp();
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
                goForward('step-6');
                scrollUp();
            },
        });
        $("#childOptions2").validate({
            rules: {
                mark: "required"
            },
            messages: {
                mark: "*Обязательное поле"
            },
            submitHandler: function (form) {
                $("#step-6").removeClass('hide-item');
                $("#step-5_2-kids").addClass('hide-item');
                goForward('step-6');
                scrollUp();
            },
        });

        $("#contactDetails").validate({
            rules: {
                customerName: "required",
                customerEmail: {
                    required: true,
                    email: true,
                    required: {
                        depends: function () {
                            let oldVal = $(this).val();
                            $(this).val($.trim(oldVal));
                            return true;
                        }
                    }
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
                goForward('step-7');
                scrollUp();
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

        function scrollUp(top) {
            if (!top) top = 0;
            $("html, body").animate({
                scrollTop: top
            }, 300);
        }

        function loadComments(gender) {
            masterData.comments = [];
            Dm.showLoader();
            let url = Dm.settings.baseurl + '/md/photocomments';
            if (gender != null) {
                url += '?applicable_for=' + gender;
            }
            $.get(url,
                    function (resp) {
                        var $ddl = $("select.ddl-comment");
                        $ddl.html('');
                        $ddl.append($("<option />").val('').text("-- Выберите комментарий --"));
                        let defaultValue;
                        let groups = {};
                        $.each(resp, function () {

                            if (!groups[this.category]) {
                                groups[this.category] = [];
                            }

                            groups[this.category].push(this);
                        });
                        $.each(Object.keys(groups), function () {
                            let groupName = this;
                            let groupItems = groups[this];
                            let $optGroup = $("<optgroup />").attr("label", groupName);
                            $.each(groupItems, function () {
                                $optGroup.append($("<option />").val(this.filepath).text(this.displayname));
                                if (orderState.kidtype == kidtypes['boy'] || orderState.kidtype == kidtypes['girl']) {
                                    if (this.displayname.indexOf('Твоя улыбка светится искорками счастья') > -1) {
                                        defaultValue = this.filepath;
                                    }
                                } else {
                                    if (this.displayname.indexOf('Ваши улыбки светятся искорками счастья') > -1) {
                                        defaultValue = this.filepath;
                                    }
                                }
                                
                                masterData.comments.push(this);
                            });

                            $ddl.append($optGroup);
                        });
                        if (defaultValue) {
                            $ddl.first().val(defaultValue);
                        }
                    })
                .always(function () {
                    Dm.hideLoader();
                });
        }

        function getNamesByGender(gender) {
            return Dm.masterdata.names[gender + ''];
        }

        function loadNames(ddlSelector, gender) {
            let values = Dm.masterdata.names[gender + ''];

            var $ddl = $(ddlSelector);
            $ddl.html('');
            $ddl.append($("<option />").val('').text('Выберите имя'));

            $.each(values, function () {
                $ddl.append($("<option />").val(this.id).text(this.displayname).data('filter', this
                    .filtername));
            });
        }

        function initSelect2(selector, matcher) {
            let opts = {
                matcher: matcher,
                width: '100%'
            };
            if (selector == '.ddl-comment' || selector == '.ddl-praise' || selector == '.ddl-behavior' || selector == '.ddl-gender') {
                opts.minimumResultsForSearch = Infinity;
            }
            $(selector).select2(opts);
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
                })
                .always(function () {
                    Dm.hideLoader();
                });
        }

        $("#ddlGender2_1").change(function () {
            let gender = +$(this).val();
            orderState.gender = gender;
            loadNames('#ddlName2_1', gender)
        });
        $("#ddlGender2_2").change(function () {
            let gender = +$(this).val();
            orderState.gender2 = gender;
            loadNames('#ddlName2_2', gender)
        });

        function startOrder(kidtype) {
            function initOrderState(kidtype) {
                let result = {
                    step: 0,
                    kidname: null,
                    kidname2: null,
                    gender: null,
                    gender2: null,
                    kidtype: kidtype,
                    praiseid: null,
                    behaviorid: 1,
                    customername: '',
                    customeremail: '',

                    imageMap: {}
                };
                if (kidtype == 0 || kidtype == 1) {
                    result.gender = kidtype;
                }                

                return result;
            }

            orderState = initOrderState(kidtype);
            
            $('.ddl-names').val('');

            $('.group-extra-info').hide();
            $('.photo-section__comment-info').hide();
            
            switch (kidtype) {
                case kidtypes['boy']:
                case kidtypes['girl']:
                    loadNames('#ddlName', kidtype);
                    loadPraises(kidtype);
                    loadComments(kidtype);
                    $("#childPhoto .add-pictures").text('Добавьте фотографии ребенка');
                    break;
                case kidtypes['2kids']:
                    $('.photo-section__comment-info').show();
                    $("#childPhoto .add-pictures").text('Добавьте фотографии детей')
                    $('.letter-step .content-item-choose__title').text('Добавьте письмо детей Деду Морозу');
                    $('.letter-step .general-info').text('Если дети не написали письмо, просто пропустите этот шаг');
                    loadComments(kidtypes['2kids']);
                    break;
                case kidtypes['group']:
                    $('.photo-section__comment-info').show();
                    $('.group-extra-info').show();
                    $("#childPhoto .add-pictures").text('Добавьте фотографии детей')
                    $('.letter-step .content-item-choose__title').text('Добавьте письмо детей Деду Морозу');
                    $('.letter-step .general-info').text('Если дети не написали письмо, просто пропустите этот шаг');
                    loadComments(kidtypes['2kids']);
                    orderState.kidname = '663';
                    break;
            }
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
                let $rdAspectChecked = $parent.find('.image-aspect:checked');
                let selectedAspect = 'portrait';
                if ($rdAspectChecked.length) {
                    selectedAspect = $rdAspectChecked.val();
                }
                refreshCroppieImage(holder, imageUrl, selectedAspect);
                let $hidFile = $(input).parent().find('input[type=hidden]');
                $hidFile.val(true);
                $(input).parent().addClass('active');
                console.log('removing input', input)
                $(input).remove();
            });
        }

        function uploadFile(picNo, onSuccess, onError) {
            let resultOpts = {
                type: 'base64'
            };

            if (imageCache[picNo].aspect == 'landscape') {
                resultOpts.size = {
                    width: croppieResultLongSide
                }
            } else {
                resultOpts.size = {
                    height: croppieResultLongSide
                }
            }

            let croppie = imageCache[picNo].croppie;
            croppie.result(resultOpts).then(function (imgEncoded) {
                let data = {
                    'content': imgEncoded
                }
                $.ajax({
                    type: 'POST',
                    url: Dm.settings.baseurl + '/images/base64',
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    success: function (resp) {
                        if (onSuccess) {
                            onSuccess({
                                resp: resp,
                                picNo: picNo
                            });
                        }
                    },
                    error: function (resp) {
                        if (onError) {
                            onError({
                                resp: resp,
                                picNo: picNo
                            })
                        }
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
            imageInfo.aspect = aspect;

            croppie.bind({
                url: image_url
            });
            croppie.setZoom(1);

            let $parent = $(elem).parents('.pic-wrapper');
            $parent.find('.image-aspect-wrapper').show();

            function createCroppie(elem, aspect) {
                let viewport = null;
                let boundary = {
                    width: croppieSettings.boundaryWidth,
                    height: croppieSettings.boundaryHeight
                };
                let reducCoef = croppieSettings.reducCoef;

                let long_side = croppieSettings.longSide * reducCoef,
                    short_side = croppieSettings.shortSide * reducCoef;
                if (aspect == 'landscape') {
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
                    enableOrientation: true,
                    enableResize: croppieSettings.enableResize
                });
            }
        }

        function onImageAspectChanged() {
            let picNo = getPicNo(this);
            let $parent = $(this).parents('.pic-wrapper');
            let elem = $parent.find('.photo-list__photo')[0]
            refreshCroppieImage(elem, imageCache[picNo].imageUrl, this.value);
        }

        function goForward(nextStep) {
            console.log('going forward. step:', nextStep, orderState)
            if (nextStep == 'step-7') {
                initReviewForm();
            }
        }

        $('#ddlName').change(function () {
            orderState.kidname = $(this).val();
        });
        $('#ddlName2_1').change(function () {
            orderState.kidname = $(this).val();
        });
        $('#ddlName2_2').change(function () {
            orderState.kidname2 = $(this).val();
        });
        $('#ddlPraise').change(function () {
            orderState.praiseid = $(this).val();
        });
        $('.ddl-behavior').change(function () {
            orderState.behaviorid = $(this).val();
        });
        $('#txtCustomerName').change(function () {
            orderState.customername = $(this).val();
        });
        $('#txtCustomerEmail').change(function () {
            orderState.customeremail = $(this).val();
        });

        function initReviewForm() {
            console.log('init review form & validation...')

            function getForWhom(gender) {
                switch (+gender) {
                    case 0:
                        return "Мальчик";
                    case 1:
                        return "Девочка";
                }
            }

            function validateOrder(orderState) {
                let errors = [];
                if (!orderState.kidname) {
                    errors.push('имя ребенка');
                }
                
                if (orderState.kidtype == kidtypes['boy'] || orderState.kidtype == kidtypes['girl']) {
                    if (orderState.gender >= 2) {
                        errors.push('пол ребенка');
                    }
                    //praise is mandatory for 1 kid
                    if (!orderState.praiseid) {
                        errors.push('похвала');
                    }
                }
                if (orderState.kidtype == kidtypes['2kids']) {                    
                    if (orderState.gender >= 2) {
                        errors.push('пол ребенка');
                    }
                    if (orderState.gender2 != null && !orderState.kidname2 || orderState.gender2 == null && orderState.kidname2) {
                        errors.push('пол и имя второго ребенка');
                    }
                }

                if (!orderState.imageMap) {
                    errors.push('фотографии');
                } else {
                    let i;

                    let photoKeys = Object.keys(orderState.imageMap);
                    for (i = 0; i < photoKeys.length; i++) {
                        let imageInfo = orderState.imageMap[photoKeys[i]];
                        if (imageInfo.name && !imageInfo.commentid) {
                            if (!imageInfo.commentid) {
                                errors.push('комментарий к фотографии №' + (i + 1));
                            }
                            if (!imageInfo.aspect) {
                                errors.push('формат фотографии №' + (i + 1) + ' (вертикальный или горизонтальный)');
                            }
                        }
                    }
                }
                if (orderState.letter && !orderState.letter.aspect) {
                    errors.push('формат письма (вертикальный или горизонтальный)');
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
                return;
            }

            if (orderState.kidtype == kidtypes['boy'] || orderState.kidtype == kidtypes['girl']) {
                //1 kid
                $('.review-form .gender-text').text(getForWhom(orderState.gender));

                let kidname = getNamesByGender(orderState.gender).find(x => x.id == orderState.kidname).displayname;
                $('.review-form .name-text').text(kidname);

            } else if (orderState.kidtype == kidtypes['2kids']) {
                //2 kids
                let forWhom = getForWhom(orderState.gender) + ", " + getForWhom(orderState.gender2);
                $('.review-form .gender-text').text(forWhom);

                let kidname1 = getNamesByGender(orderState.gender).find(x => x.id == orderState.kidname).displayname;
                let kidname2 = getNamesByGender(orderState.gender2).find(x => x.id == orderState.kidname2).displayname;
                $('.review-form .name-text').text(kidname1 + ", " + kidname2);
            } else if (orderState.kidtype == kidtypes['group']) {
                $('.review-form .gender-row').hide();
                $('.review-form .name-text').text('Группа детей');
            }

            $('.review-form .letter-text').text(orderState.letter && orderState.letter.name ? 'Да' : 'Нет');

            if (orderState.praiseid) {
                let praise = masterData.praises.find(x => x.id == orderState.praiseid);
                if (praise) {
                    $('.review-form .praise-text').text(praise.displayname);
                    $('.praise-wrapper').show();
                }
            }

            let behavior = masterData.behaviors.find(x => x.id == orderState.behaviorid);
            if (behavior) {
                $('.review-form .behavior-text').text(behavior.text);
            }

            $('.review-form .customer-name-text').text(orderState.customername);
            $('.review-form .customer-email-text').text(orderState.customeremail);

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

            function displayInfoAboutPhotos() {
                let photosUploaded = 0;
                let i = 0;
                for (i = 0; i < Object.keys(orderState.imageMap).length; i++) {
                    let key = "pic" + i;
                    let imageInfo = orderState.imageMap[key];
                    console.log('imageInfo', imageInfo, i);
                    if (imageInfo.name && imageInfo.commentid) {
                        photosUploaded++;

                        let commentSelector = '.review-form .comment' + i + '-text';
                        $(commentSelector).text(findCommentByFilepath(imageInfo.commentid));
                        $(commentSelector).parents('.comment-wrapper').show();
                    }
                }
                $('.review-form .photos-number-text').text(photosUploaded);
            }

            displayInfoAboutPhotos();
        }

        function submitOrder(onSuccess, onError) {
            //to avoid double submission
            $('.submit-order').prop('disabled', true);

            let orderInfo = {
                kidname: orderState.kidname,
                kidname2: orderState.kidname2,
                gender: orderState.gender,
                gender2: orderState.gender2,
                kidtype: orderState.kidtype,
                images: {},
                behaviorid: +orderState.behaviorid,
                customername: orderState.customername,
                customeremail: orderState.customeremail
            };
            if (orderState.praiseid) {
                orderInfo.praiseid = +orderState.praiseid;
            }

            orderInfo.images.content = [];
            let i = 0;
            for (i = 0; i < MaxPictures; i++) {
                let key = 'pic' + i;
                if (orderState.imageMap[key] && orderState.imageMap[key].name) {
                    orderInfo.images.content.push(orderState.imageMap[key]);
                }
            }
            if (orderState.letter && orderState.letter.name) {
                orderInfo.images.letters = [orderState.letter]
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