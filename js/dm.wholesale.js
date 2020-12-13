(function ($) {
    $(function () {
        $('input[type=file]').change(function () {
            onFileChanged(this);
        });

        var url = Dm.settings.baseurl + '/files/base64';
        $('form[name=wholesaledetails]').attr('action', url);

        function onFileChanged(input) {
            function readFile(input, success) {
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

            readFile(input, function (fileContent) {
                console.log('uploaded', fileContent);
                let hidSelector = "#" + $(input).data('hiddenid');
                let $hidFile = $(hidSelector);


                uploadFile(fileContent, function (savedFileResp) {
                    showSuccess('Реквизиты загружены')

                    let details = {
                        'files': [{
                            'filename': savedFileResp.resp.filename
                        }]
                    }
                    $hidFile.val(JSON.stringify(details));
                }, function (resp) {
                    showError(resp.resp.responseJSON.error);
                });
            });
        }

        function uploadFile(fileEncoded, onSuccess, onError) {
            let data = {
                'content': fileEncoded
            }
            $.ajax({
                type: 'POST',
                url: Dm.settings.baseurl + '/files/base64',
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (resp) {
                    if (onSuccess) {
                        onSuccess({
                            resp: resp
                        });
                    }
                },
                error: function (resp) {
                    if (onError) {
                        onError({
                            resp: resp
                        })
                    }
                }
            });
        }

        $('#txtContactEmail').keyup(function () {
            checkAndEnableSubmitButton();
        });

        $("#wholesaledetails").validate({
            rules: {
                fileReqs: "required",
                contactemail: {
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
                fileReqs: "*Загрузите реквизиты",
                contactemail: {
                    required: "*Обязательное поле",
                    email: "Введите корректный email"
                },
            },
            submitHandler: function (form) {
                submitForm();
            }
        });

        function submitForm() {
            createWholesaleRequest(function (resp) {
                console.log('success:', resp);
                // hideError();
                showSuccess("Спасибо за предоставленную информацию. Мы напишем вам на email который вы указали.");
            }, function (resp) {
                console.log('error:', resp);
                showError('Ошибка при создании запроса! Для оперативного разрешения проблемы, пожалуйста, позвоните по +7 812 647 1856 или отправьте нам email на info@darimchudo.ru');
            });
        }

        function checkAndEnableSubmitButton() {
            //if email and file are provided
            if ($('#txtContactEmail').val() == '') {
                $('.submit-reqs').prop('disabled', true);
            }

            $('.submit-reqs').prop('disabled', false);
        }

        function createWholesaleRequest(onSuccess, onError) {
            let url = Dm.settings.baseurl + '/wholesalerequests';
            let fileValue = $('#file1Name').val();
            if (!fileValue) {
                showError('Пожалуйста, загрузите реквизиты');
            }
            let data = {
                contactname: $('input[name=contactname]').val(),
                contactemail: $('input[name=contactemail]').val(),
                details: JSON.parse(fileValue)
            };
            $.ajax({
                type: 'POST',
                url: url,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function (resp) {
                    if (onSuccess) {
                        onSuccess({
                            resp: resp
                        });
                    }
                },
                error: function (resp) {
                    if (onError) {
                        onError({
                            resp: resp
                        })
                    }
                }
            });
        };

        function showSuccess(message) {
            $('.alert').hide();
            $('.success-block .alert-text').text(message);
            $('.success-block').show();
        }

        function showError(message) {
            $('.alert').hide();
            $('.error-block .alert-text').text(message);
            $('.error-block').show();
        }
    });
})(jQuery);