function createDmSettings() {

    return {
        baseurl: 'https://9bzfytvwol.execute-api.us-east-1.amazonaws.com/prod',
        websiteBaseurl: 'https://darimchudo.ru',
        env: 'prod',
        bucket_uploadfiles_url: 'https://darimchudo-files.s3.amazonaws.com'
    };
}


Dm = {};

Dm.settings = createDmSettings();

Dm.showLoader = function() {
    $('body').addClass('loaded');
};
Dm.hideLoader = function() {
    $('body').removeClass('loaded');
};