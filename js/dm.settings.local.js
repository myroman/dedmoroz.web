function createDmSettings() {

    return {
        baseurl: 'http://127.0.0.1:5000',
        websiteBaseurl: 'http://localhost/~roman/dedmoroz_web',
        env: 'local',
        bucket_uploadfiles_url: 'https://darimchudo-files-dev.s3.amazonaws.com'
    };
}


Dm = {};

//env can be local, test, prod
// Dm.settings = createDmSettings('local');
// Dm.settings = createDmSettings('test');
Dm.settings = createDmSettings();

Dm.showLoader = function() {
    $('#ftco-loader').addClass('show');
};
Dm.hideLoader = function() {
    $('#ftco-loader').removeClass('show');
};