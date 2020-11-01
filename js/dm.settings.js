function createDmSettings(env) {
    let local = {
        baseurl: 'http://127.0.0.1:5000',
        websiteBaseurl: 'http://localhost/~roman/dedmoroz_web',
        env: 'local'
    };

    let test = {
        baseurl: 'https://p3r5o5x4x2.execute-api.us-east-1.amazonaws.com/dev',
        websiteBaseurl: 'http://darimchudo-test.ru.s3-website.us-east-1.amazonaws.com',
        env: 'test'
    };


    var mappings = {
        local: local,
        test: test
    }

    return mappings[env];
}


Dm = {};

//env can be local, test, prod
// Dm.settings = createDmSettings('local');
Dm.settings = createDmSettings('test');

Dm.showLoader = function() {
    $('#ftco-loader').addClass('show');
};
Dm.hideLoader = function() {
    $('#ftco-loader').removeClass('show');
};