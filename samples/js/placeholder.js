(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/** @namespace tui.component.placeholder */
tui.util.defineNamespace('tui.component.placeholder', require('./src/placeholder.js'));

},{"./src/placeholder.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var Placeholder, sharedInstance;
var browser = tui.util.browser;
var isSupportPlaceholder = 'placeholder' in document.createElement('input') &&
                        !(browser.msie && browser.version <= 11);

var KEYCODE_BACK = 8;
var KEYCODE_TAB = 9;
var TARGET_TAGS = [
    'input',
    'textarea'
];
var INPUT_TYPES = [
    'text',
    'password',
    'email',
    'tel',
    'number',
    'url',
    'search'
];
var WRAPPER_STYLE = util.makeStyleText({
    'position': 'relative',
    'display': 'inline-block',
    'overflow': 'hidden'
});
var DEFAULT_STYLE = util.makeStyleText({
    'position': 'absolute',
    'overflow': 'hidden',
    'color': '#999',
    'z-index': '0'
});
var TEMPLATE = '<span style="{{style}}" UNSELECTABLE="on">{{placeholderText}}</span>';

/**
 * Placeholder Object
 * @constructor
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed 'input' and 'textarea' elements on page
         * @type {Array}
         * @private
         */
        this.targets = [];
    },

    /**
     * Generate placeholders
     * @param {HTMLElements} selectedTargets - Selected elements for generating placeholder
     */
    generateOnTargets: function(selectedTargets) {
        this.targets = this.targets.concat(selectedTargets);

        tui.util.forEach(this.targets, function(target) {
            var placeholder = this._getPlaceholderHtml(target);

            this._attachPlaceholder(target, placeholder);
            this._bindEvent(target, target.previousSibling);
        }, this);
    },

    /**
     * Hide placeholders on 'input' or 'textarea' element that already has value
     * @param {HTMLElements} selectedTargets - Selected elements to hide placeholder
     */
    hideOnTargets: function(selectedTargets) {
        tui.util.forEach(selectedTargets, function(target) {
            target.previousSibling.style.display = 'none';
        });
    },

    /**
     * Attach a new virtual placeholder after a selected 'input' element and wrap this element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {string} placeholder - HTML string of the virtual placeholder
     * @private
     */
    _attachPlaceholder: function(target, placeholder) {
        var wrapper = document.createElement('span');
        var parentNode = target.parentNode;

        wrapper.innerHTML = placeholder;
        wrapper.style.cssText = WRAPPER_STYLE;

        parentNode.insertBefore(wrapper, target);

        wrapper.appendChild(target);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {HTMLElement} placeholder - The virtual placeholder element
     * @private
     */
    _bindEvent: function(target, placeholder) {
        var placeholderStyle = placeholder.style;

        /**
         * Event handler
         */
        function onKeyup() {
            if (target.value === '') {
                placeholderStyle.display = 'inline-block';
            }
        }

        util.bindEvent(placeholder, 'click', function() {
            target.focus();
        });

        util.bindEvent(target, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB ||
                (e.shiftKey && keyCode === KEYCODE_TAB))) {
                placeholderStyle.display = 'none';
            }
        });

        util.bindEvent(target, 'keyup', onKeyup);
        util.bindEvent(target, 'blur', onKeyup);
    },

    /**
     * Get the virtual placeholder's html
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @returns {string} String of virtual placeholder tag
     * @private
     */
    _getPlaceholderHtml: function(target) {
        var initStyle = util.getStyle(target);
        var placeholderText = target.getAttribute('placeholder');
        var hasValue = target.value !== '';
        var isInput = target.nodeName.toLowerCase() === 'input';
        var styleObj = {
            'display': hasValue ? 'none' : 'inline-block',
            'top': parseInt(initStyle.paddingTop, 10) +
                    parseInt(initStyle.borderTopWidth, 10) + 'px',
            'left': parseInt(initStyle.paddingLeft, 10) +
                    parseInt(initStyle.borderLeftWidth, 10) + 'px',
            'font-size': initStyle.fontSize,
            'font-family': initStyle.fontFamily
        };
        var addStyle = !isInput ? {'width': '90%'} : {'white-space': 'nowrap'};

        tui.util.extend(styleObj, addStyle);

        return util.applyTemplate(TEMPLATE, {
            style: DEFAULT_STYLE + util.makeStyleText(styleObj),
            placeholderText: placeholderText
        });
    }
});

/**
 * Get all 'input' and 'textarea' elements on page
 * @returns {Array.<HTMLElement>} All elements
 */
function getAllTargets() {
    var inputs = tui.util.toArray(document.getElementsByTagName('input'));
    var textareas = tui.util.toArray(document.getElementsByTagName('textarea'));

    return inputs.concat(textareas);
}

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

sharedInstance = new Placeholder();

module.exports = {
    /**
     * Generate virtual placeholders
     * @param {HTMLElements} [selectedTargets] - created elements
     * @memberof tui.component.placeholder
     * @function
     * @api
     * @example
     * tui.component.placeholder.generate();
     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
     */
    generate: function(selectedTargets) {
        var targets;

        if (isSupportPlaceholder) {
            return;
        }

        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : getAllTargets();

        sharedInstance.generateOnTargets(tui.util.filter(targets, function(target) {
            var tagName = target.nodeName.toLowerCase();
            var inputType = target.type.toLowerCase();
            var disableState = target.disabled || target.readOnly;
            var hasProp = !tui.util.isNull(target.getAttribute('placeholder'));
            var enableElem = tui.util.inArray(tagName, TARGET_TAGS) > -1;

            if (tagName === 'input') {
                enableElem = tui.util.inArray(inputType, INPUT_TYPES) > -1;
            }

            return hasProp && enableElem && !disableState;
        }));
    },

    /**
     * When 'input' or 'textarea' element already has value, hiding the virtual placeholder
     * @memberof tui.component.placeholder
     * @function
     * @api
     * @example
     * tui.component.placeholder.hideOnInputHavingValue();
     */
    hideOnInputHavingValue: function() {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.hideOnTargets(tui.util.filter(sharedInstance.targets, function(target) {
            return (target.value !== '' && target.type !== INPUT_TYPES[1]);
        }));
    }
};

},{"./util.js":3}],3:[function(require,module,exports){
'use strict';

var hasComputedStyle = (window.getComputedStyle);

var util = {
    /**
     * Generate 'style' element and add css rule
     * @param {Object} ruleInfo - Value of selector and css property
     */
    addCssRule: function(ruleInfo) {
        var styleTag = document.createElement('style');
        var selector = ruleInfo.selector;
        var css = ruleInfo.css;
        var styleSheet;

        if (document.head) {
            document.head.appendChild(styleTag);
        } else {
            document.getElementsByTagName('head')[0].appendChild(styleTag);
        }

        styleSheet = styleTag.sheet || styleTag.styleSheet;

        if (styleSheet.insertRule) {
            styleSheet.insertRule(selector + '{' + css + '}', 0);
        } else {
            styleSheet.addRule(selector, css, 0);
        }
    },

    /**
     * Bind event to element
     * @param {HTMLElement} target - Tag for binding event
     * @param {string} eventType - Event type
     * @param {requestCallback} callback - Event handler function
     */
    bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = callback;
        }
    },

    /**
     * Make CSSText
     * @param {Object} styleObj - Style info object
     * @returns {string} Connected string of style
     */
    makeStyleText: function(styleObj) {
        var styleStr = '';

        tui.util.forEach(styleObj, function(value, prop) {
            styleStr += prop + ':' + value + ';';
        });

        return styleStr;
    },

    /**
     * Replace matched property with template
     * @param {string} template - String of template
     * @param {Object} propObj - Properties
     * @returns {string} Replaced template string
     */
    applyTemplate: function(template, propObj) {
        var newTemplate = template.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
            return propObj.hasOwnProperty(prop) ? propObj[prop] : '';
        });

        return newTemplate;
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - Current element
     * @returns {Object} Style object of element
     */
    getStyle: function(target) {
        var computedObj;

        if (hasComputedStyle) {
            computedObj = window.getComputedStyle(target, '');
        } else {
            computedObj = target.currentStyle;
        }

        return computedObj;
    }
};

module.exports = util;

},{}]},{},[1]);
