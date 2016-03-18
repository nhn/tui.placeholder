var webpack = require('webpack');

module.exports = function(config) {
    config.set({
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            'bower_components/json2/json2.js',
            'bower_components/jquery/jquery.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
            'lib/code-snippet.min.js',
            //'src/*.js',
            //'test/*.spec.js',
            'tests.webpack.js',
            {
                pattern: 'test/fixture/*.html',
                included: true
            },
            {
                pattern: 'test/fixture/*.css',
                included: true
            }
        ],

        exclude: [
        ],

        preprocessors: {
            //'src/*.js': ['webpack'],
            //'test/*.spec.js': ['webpack']
            'tests.webpack.js': ['webpack', 'sourcemap']
        },

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: false,

        concurrency: Infinity
    });
};
