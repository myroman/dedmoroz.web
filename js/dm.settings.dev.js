function createDmSettings() {

    return {
        // baseurl: 'https://p3r5o5x4x2.execute-api.us-east-1.amazonaws.com/dev',
        baseurl: 'http://46.182.24.76/api',
        websiteBaseurl: 'http://darimchudo-test.ru.s3-website.us-east-1.amazonaws.com',
        env: 'test',
        bucket_uploadfiles_url: 'https://darimchudo-files-dev.s3.amazonaws.com'
    };
}


Dm = {};
Dm.mockApiRequests = false;

Dm.settings = createDmSettings();

Dm.showLoader = function() {
    $('body').addClass('loaded');
};
Dm.hideLoader = function() {
    $('body').removeClass('loaded');
};