function createDmSettings() {

    return {
        baseurl: 'http://192.168.64.10/api',
        websiteBaseurl: 'http://localhost/~roman/dedmoroz_web',
        env: 'local',
        bucket_uploadfiles_url: 'https://darimchudo-files-dev.s3.amazonaws.com'
    };
}


Dm = {};
Dm.mockApiRequests = false;

//env can be local, test, prod
// Dm.settings = createDmSettings('local');
// Dm.settings = createDmSettings('test');
Dm.settings = createDmSettings();

Dm.showLoader = function() {
    $('body').addClass('loaded');
};
Dm.hideLoader = function() {
    $('body').removeClass('loaded');
};