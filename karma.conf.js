module.exports = function(config) {
    var webdriverConfig = {
        hostname: 'fe.nhnent.com',
        port: 4444,
        remoteHost: true
    };

    config.set({
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            'bower_components/json2/json2.js',
            'bower_components/jquery/jquery.js',
            'src/js/*.js',
            'test/*.spec.js'
        ],

        exclude: [
        ],

        preprocessors: {
            'src/js/*.js': ['coverage']
        },

        reporters: [
            'mocha',
            'coverage',
            'junit'
        ],

        coverageReporter: {
            type: 'html',
            dir: 'report/coverage'
        },

        junitReporter: {
            outputDir: 'report/junit',
            suite: ''
        },

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: false,

        browsers: [
            'IE7',
            'IE8',
            'IE9',
            'IE10',
            'IE11',
            'Edge',
            'Chrome-WebDriver',
            'Firefox-WebDriver',
            'Android',
            'iOS'
        ],

        customLaunchers: {
            'IE7': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 7
            },
            'IE8': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 8
            },
            'IE9': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 9
            },
            'IE10': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 10
            },
            'IE11': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'internet explorer',
                version: 11
            },
            'Edge': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'MicrosoftEdge'
            },
            'Chrome-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'chrome'
            },
            'Firefox-WebDriver': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'firefox'
            },
            'Android': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'Browser',
                platformName: 'Android',
                platformVersion: '5.1.1',
                deviceName: 'emulator-5554'
            },
            'iOS': {
                base: 'WebDriver',
                config: webdriverConfig,
                browserName: 'Safari',
                platformName: 'iOS',
                platformVersion: '8.3',
                deviceName: 'iPhone 4s'
            }
        },

        singleRun: true,

        browserNoActivityTimeout: 30000
    });
};
