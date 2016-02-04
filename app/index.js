/**
 * @fileoverview FE Development team's project scaffold for javascript components.
 * @author NHNEnt FE Development team <e0242@nhnent.com>
 */

'use strict';

var _ = require('underscore');
var str = require('string');
var yeoman = require('yeoman-generator');

/**********
 * inquires
 **********/
var inqProjectName = {
    type: 'input',
    name: 'projectName',
    message: 'Your project name',
    sotre: true
};

var inqEnvironment = {
    type: 'checkbox',
    name: 'environment',
    message: 'select project\'s work environments',
    choices: [{
        name: 'desktop',
        value: 'includeDesktop',
        checked: true
    }, {
        name: 'mobile',
        value: 'includeMobile',
        checked: false
    }]
};

var inqDesktopEnv = {
    type: 'checkbox',
    name: 'desktopEnv',
    message: 'select desktop browser environments',
    choices: [{
        name: 'IE7 - WinXP',
        value: 'IE7',
        checked: false
    }, {
        name: 'IE8 - WinXP',
        value: 'IE8',
        checked: true
    }, {
        name: 'IE9 - Win7',
        value: 'IE9',
        checked: true
    }, {
        name: 'IE10 - Win7',
        value: 'IE10',
        checked: true
    }, {
        name: 'IE11 - Win10',
        value: 'IE11',
        checked: true
    }, {
        name: 'Edge - Win10',
        value: 'Edge',
        checked: true
    }, {
        name: 'Chrome - Win7',
        value: 'Chrome',
        checked: true
    }, {
        name: 'Firefox - Win7',
        value: 'Firefox',
        checked: true
    }],
    when: function(answers) {
        return answers.environment.indexOf('includeDesktop') > -1;
    }
};

var inqMobileEnv = {
    type: 'checkbox',
    name: 'mobileEnv',
    message: 'select mobile browser environments',
    choices: [{
        name: 'Android 5.1.1 (Mobile Chrome 39)',
        value: 'Android',
        checked: true
    }, {
        name: 'iOS 8.3 (Mobile Safari 8.0)',
        value: 'iOS',
        checked: true
    }],
    when: function(answers) {
        return answers.environment.indexOf('includeMobile') > -1;
    }
};

var inqFiles = {
    type: 'input',
    name: 'sourcePath',
    message: 'path for source files',
    'default': 'src/**/*.js'
};

var inqTestFiles = {
    type: 'input',
    name: 'testSourcePath',
    message: 'path for test files',
    'default': 'test/**/*.spec.js'
};

var browserMatcher = {
    'IE7': 'IE7',
    'IE8': 'IE8',
    'IE9': 'IE9',
    'IE10': 'IE10',
    'IE11': 'IE11',
    'Edge': 'Edge',
    'Chrome': 'Chrome-WebDriver',
    'Firefox': 'Firefox-WebDriver',
    'Android': 'Android',
    'iOS': 'iOS'
};

var webdriverConfig = null;

var launcherMatcher = {
    'IE7': {
        _launcherName: 'IE7',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 7
    },
    'IE8': {
        _launcherName: 'IE8',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 8
    },
    'IE9': {
        _launcherName: 'IE9',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 9
    },
    'IE10': {
        _launcherName: 'IE10',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 10
    },
    'IE11': {
        _launcherName: 'IE11',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: 11
    },
    'Edge': {
        _launcherName: 'Edge',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'MicrosoftEdge'
    },
    'Chrome': {
        _launcherName: 'Chrome-WebDriver',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'chrome'
    },
    'Firefox': {
        _launcherName: 'Firefox-WebDriver',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'firefox'
    },
    'Android': {
        _launcherName: 'Android',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'Browser',
        platformName: 'Android',
        platformVersion: '5.1.1',
        deviceName: 'emulator-5554'
    },
    'iOS': {
        _launcherName: 'iOS',
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'Safari',
        platformName: 'iOS',
        platformVersion: '8.3',
        deviceName: 'iPhone 4s'
    }
};

function isModernEnv(env) {
    var isIE7 = env.indexOf('IE7') > -1,
        isIE8 = env.indexOf('IE8') > -1;

    return !isIE7 && !isIE8;
}


module.exports = yeoman.generators.Base.extend({
    _comma: function(arr, index) {
        var commaChar = '';
        if (index + 1 < arr.length) {
            commaChar = ',';
        }
        return commaChar;
    },

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);

        this.option('no-livereload', {
            desc: 'Skip livereload setting to gulp connect task',
            type: Boolean,
            defaults: false
        });

        this.nolivereload = this.options['no-livereload'];
    },

    /**
     * inquire user's answers that related with scaffolds.
     */
    prompting: function() {
        var done = this.async();

        this.prompt([
            inqProjectName,
            inqEnvironment,
            inqDesktopEnv,
            inqMobileEnv,
            inqFiles,
            inqTestFiles
        ], (function(answers) {
            answers.projectName = str(answers.projectName).trim().dasherize().s;

            _.extend(this, answers);

            done();
        }).bind(this));
    },

    /**
     * write scaffold files to project root directory.
     */
    writing: function() {
        var browsers = [],
            launchers = [],
            envs;

        /**********
         * configration
         **********/
        // for add bower dependencies old borwsers.
        this.modern = isModernEnv(this.desktopEnv);

        this.useWebDriver = true;
        this.usePhantomJS = false;

        envs = _.filter(this.desktopEnv.concat(this.mobileEnv), _.existy);
        _.each(envs, function(env) {
            browsers.push(browserMatcher[env]);
            launchers.push(launcherMatcher[env]);
        });

        this.browsers = browsers;
        this.launchers = launchers;

        /**********
         * install
         **********/

        /**********
         * writing
         **********/

        this.copy('eslintrc', '.eslintrc');
        this.copy('gitignore', '.gitignore');

        this.template('jsdoc', 'jsdoc-conf.json');
        this.template('_package.json', 'package.json');
        this.template('_bower.json', 'bower.json');
        this.template('README.md');
        this.template('gulpfile.js');
        this.template('karma.conf.js.ejs', 'karma.conf.js');

        if (!this.options['skip-install']) {
            this.installDependencies();
        }
    }
});
