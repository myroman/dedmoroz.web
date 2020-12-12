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
                    hideFileError();
                    let details = {
                        'files': [{
                            'filename': savedFileResp.resp.filename
                        }]
                    }
                    $hidFile.val(JSON.stringify(details));
                }, function (resp) {
                    showFileLoadError(resp.resp.responseJSON.error);
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

        $('input[type=submit]').click(function (e) {
            submitForm();
            e.preventDefault();
            return false;
        })

        function submitForm() {
            createWholesaleRequest(function (resp) {
                console.log('success:', resp);
                hideRequestError();
            }, function (resp) {
                console.log('error:', resp);
                showRequestError('Ошибка при создании запроса! Для оперативного разрешения проблемы, пожалуйста, позвоните по +7 812 647 1856 или отправьте нам email на info@darimchudo.ru');
            });
        }

        function createWholesaleRequest(onSuccess, onError) {
            let url = Dm.settings.baseurl + '/wholesalerequests';
            let fileValue = $('#file1Name').val();
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

        function showRequestError(message) {
            $('.request-error-block').text(message).show();
        }
        function hideRequestError() {
            $('.request-error-block').hide();
        }

        function showFileLoadError(message) {
            $('.file-error-block').text(message).show();
        }
        function hideFileError() {
            $('.file-error-block').hide();
        }
    });
})(jQuery);