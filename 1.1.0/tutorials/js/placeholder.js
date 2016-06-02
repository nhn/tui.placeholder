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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8qKiBAbmFtZXNwYWNlIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIgKi9cbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcicsIHJlcXVpcmUoJy4vc3JjL3BsYWNlaG9sZGVyLmpzJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdlbmVyYXRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIG9uIGJyb3dzZXJzIGlzbid0IHN1cHBvcnRlZCBwbGFjZWhvbGRlciBmZWF0dXJlXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIGRldiB0ZWFtLjxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxudmFyIFBsYWNlaG9sZGVyLCBzaGFyZWRJbnN0YW5jZTtcbnZhciBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcjtcbnZhciBpc1N1cHBvcnRQbGFjZWhvbGRlciA9ICdwbGFjZWhvbGRlcicgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxudmFyIEtFWUNPREVfQkFDSyA9IDg7XG52YXIgS0VZQ09ERV9UQUIgPSA5O1xudmFyIFRBUkdFVF9UQUdTID0gW1xuICAgICdpbnB1dCcsXG4gICAgJ3RleHRhcmVhJ1xuXTtcbnZhciBJTlBVVF9UWVBFUyA9IFtcbiAgICAndGV4dCcsXG4gICAgJ3Bhc3N3b3JkJyxcbiAgICAnZW1haWwnLFxuICAgICd0ZWwnLFxuICAgICdudW1iZXInLFxuICAgICd1cmwnLFxuICAgICdzZWFyY2gnXG5dO1xudmFyIFdSQVBQRVJfU1RZTEUgPSB1dGlsLm1ha2VTdHlsZVRleHQoe1xuICAgICdwb3NpdGlvbic6ICdyZWxhdGl2ZScsXG4gICAgJ2Rpc3BsYXknOiAnaW5saW5lLWJsb2NrJyxcbiAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xufSk7XG52YXIgREVGQVVMVF9TVFlMRSA9IHV0aWwubWFrZVN0eWxlVGV4dCh7XG4gICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcbiAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJyxcbiAgICAnY29sb3InOiAnIzk5OScsXG4gICAgJ3otaW5kZXgnOiAnMCdcbn0pO1xudmFyIFRFTVBMQVRFID0gJzxzcGFuIHN0eWxlPVwie3tzdHlsZX19XCIgVU5TRUxFQ1RBQkxFPVwib25cIj57e3BsYWNlaG9sZGVyVGV4dH19PC9zcGFuPic7XG5cbi8qKlxuICogUGxhY2Vob2xkZXIgT2JqZWN0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuUGxhY2Vob2xkZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsYWNlaG9sZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHB1c2hlZCAnaW5wdXQnIGFuZCAndGV4dGFyZWEnIGVsZW1lbnRzIG9uIHBhZ2VcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy50YXJnZXRzID0gW107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHBsYWNlaG9sZGVyc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzfSBzZWxlY3RlZFRhcmdldHMgLSBTZWxlY3RlZCBlbGVtZW50cyBmb3IgZ2VuZXJhdGluZyBwbGFjZWhvbGRlclxuICAgICAqL1xuICAgIGdlbmVyYXRlT25UYXJnZXRzOiBmdW5jdGlvbihzZWxlY3RlZFRhcmdldHMpIHtcbiAgICAgICAgdGhpcy50YXJnZXRzID0gdGhpcy50YXJnZXRzLmNvbmNhdChzZWxlY3RlZFRhcmdldHMpO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy50YXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHZhciBwbGFjZWhvbGRlciA9IHRoaXMuX2dldFBsYWNlaG9sZGVySHRtbCh0YXJnZXQpO1xuXG4gICAgICAgICAgICB0aGlzLl9hdHRhY2hQbGFjZWhvbGRlcih0YXJnZXQsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgICAgIHRoaXMuX2JpbmRFdmVudCh0YXJnZXQsIHRhcmdldC5wcmV2aW91c1NpYmxpbmcpO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGlkZSBwbGFjZWhvbGRlcnMgb24gJ2lucHV0JyBvciAndGV4dGFyZWEnIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyB2YWx1ZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzfSBzZWxlY3RlZFRhcmdldHMgLSBTZWxlY3RlZCBlbGVtZW50cyB0byBoaWRlIHBsYWNlaG9sZGVyXG4gICAgICovXG4gICAgaGlkZU9uVGFyZ2V0czogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc2VsZWN0ZWRUYXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldC5wcmV2aW91c1NpYmxpbmcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhIG5ldyB2aXJ0dWFsIHBsYWNlaG9sZGVyIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50IGFuZCB3cmFwIHRoaXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbGFjZWhvbGRlciAtIEhUTUwgc3RyaW5nIG9mIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCwgcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gdGFyZ2V0LnBhcmVudE5vZGU7XG5cbiAgICAgICAgd3JhcHBlci5pbm5lckhUTUwgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgd3JhcHBlci5zdHlsZS5jc3NUZXh0ID0gV1JBUFBFUl9TVFlMRTtcblxuICAgICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwcGVyLCB0YXJnZXQpO1xuXG4gICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudHMgb24gdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyBvciAndGV4dGFyZWEnIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwbGFjZWhvbGRlciAtIFRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgdmFyIHBsYWNlaG9sZGVyU3R5bGUgPSBwbGFjZWhvbGRlci5zdHlsZTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogRXZlbnQgaGFuZGxlclxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gb25LZXl1cCgpIHtcbiAgICAgICAgICAgIGlmICh0YXJnZXQudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXJTdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1dGlsLmJpbmRFdmVudChwbGFjZWhvbGRlciwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQodGFyZ2V0LCAna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IEtFWUNPREVfQkFDSyB8fCBrZXlDb2RlID09PSBLRVlDT0RFX1RBQiB8fFxuICAgICAgICAgICAgICAgIChlLnNoaWZ0S2V5ICYmIGtleUNvZGUgPT09IEtFWUNPREVfVEFCKSkpIHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlclN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHRhcmdldCwgJ2tleXVwJywgb25LZXl1cCk7XG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHRhcmdldCwgJ2JsdXInLCBvbktleXVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyJ3MgaHRtbFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFN0cmluZyBvZiB2aXJ0dWFsIHBsYWNlaG9sZGVyIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBsYWNlaG9sZGVySHRtbDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciBpbml0U3R5bGUgPSB1dGlsLmdldFN0eWxlKHRhcmdldCk7XG4gICAgICAgIHZhciBwbGFjZWhvbGRlclRleHQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpO1xuICAgICAgICB2YXIgaGFzVmFsdWUgPSB0YXJnZXQudmFsdWUgIT09ICcnO1xuICAgICAgICB2YXIgaXNJbnB1dCA9IHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW5wdXQnO1xuICAgICAgICB2YXIgc3R5bGVPYmogPSB7XG4gICAgICAgICAgICAnZGlzcGxheSc6IGhhc1ZhbHVlID8gJ25vbmUnIDogJ2lubGluZS1ibG9jaycsXG4gICAgICAgICAgICAndG9wJzogcGFyc2VJbnQoaW5pdFN0eWxlLnBhZGRpbmdUb3AsIDEwKSArXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGluaXRTdHlsZS5ib3JkZXJUb3BXaWR0aCwgMTApICsgJ3B4JyxcbiAgICAgICAgICAgICdsZWZ0JzogcGFyc2VJbnQoaW5pdFN0eWxlLnBhZGRpbmdMZWZ0LCAxMCkgK1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChpbml0U3R5bGUuYm9yZGVyTGVmdFdpZHRoLCAxMCkgKyAncHgnLFxuICAgICAgICAgICAgJ2ZvbnQtc2l6ZSc6IGluaXRTdHlsZS5mb250U2l6ZSxcbiAgICAgICAgICAgICdmb250LWZhbWlseSc6IGluaXRTdHlsZS5mb250RmFtaWx5XG4gICAgICAgIH07XG4gICAgICAgIHZhciBhZGRTdHlsZSA9ICFpc0lucHV0ID8geyd3aWR0aCc6ICc5MCUnfSA6IHsnd2hpdGUtc3BhY2UnOiAnbm93cmFwJ307XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKHN0eWxlT2JqLCBhZGRTdHlsZSk7XG5cbiAgICAgICAgcmV0dXJuIHV0aWwuYXBwbHlUZW1wbGF0ZShURU1QTEFURSwge1xuICAgICAgICAgICAgc3R5bGU6IERFRkFVTFRfU1RZTEUgKyB1dGlsLm1ha2VTdHlsZVRleHQoc3R5bGVPYmopLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0OiBwbGFjZWhvbGRlclRleHRcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogR2V0IGFsbCAnaW5wdXQnIGFuZCAndGV4dGFyZWEnIGVsZW1lbnRzIG9uIHBhZ2VcbiAqIEByZXR1cm5zIHtBcnJheS48SFRNTEVsZW1lbnQ+fSBBbGwgZWxlbWVudHNcbiAqL1xuZnVuY3Rpb24gZ2V0QWxsVGFyZ2V0cygpIHtcbiAgICB2YXIgaW5wdXRzID0gdHVpLnV0aWwudG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgdmFyIHRleHRhcmVhcyA9IHR1aS51dGlsLnRvQXJyYXkoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3RleHRhcmVhJykpO1xuXG4gICAgcmV0dXJuIGlucHV0cy5jb25jYXQodGV4dGFyZWFzKTtcbn1cblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufVxuXG5zaGFyZWRJbnN0YW5jZSA9IG5ldyBQbGFjZWhvbGRlcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB2aXJ0dWFsIHBsYWNlaG9sZGVyc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzfSBbc2VsZWN0ZWRUYXJnZXRzXSAtIGNyZWF0ZWQgZWxlbWVudHNcbiAgICAgKiBAbWVtYmVyb2YgdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlclxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuZ2VuZXJhdGUoKTtcbiAgICAgKiB0dWkuY29tcG9uZW50LnBsYWNlaG9sZGVyLmdlbmVyYXRlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgKi9cbiAgICBnZW5lcmF0ZTogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzKSB7XG4gICAgICAgIHZhciB0YXJnZXRzO1xuXG4gICAgICAgIGlmIChpc1N1cHBvcnRQbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0cyA9IChzZWxlY3RlZFRhcmdldHMpID8gdHVpLnV0aWwudG9BcnJheShzZWxlY3RlZFRhcmdldHMpIDogZ2V0QWxsVGFyZ2V0cygpO1xuXG4gICAgICAgIHNoYXJlZEluc3RhbmNlLmdlbmVyYXRlT25UYXJnZXRzKHR1aS51dGlsLmZpbHRlcih0YXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHZhciB0YWdOYW1lID0gdGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB2YXIgaW5wdXRUeXBlID0gdGFyZ2V0LnR5cGUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHZhciBkaXNhYmxlU3RhdGUgPSB0YXJnZXQuZGlzYWJsZWQgfHwgdGFyZ2V0LnJlYWRPbmx5O1xuICAgICAgICAgICAgdmFyIGhhc1Byb3AgPSAhdHVpLnV0aWwuaXNOdWxsKHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJykpO1xuICAgICAgICAgICAgdmFyIGVuYWJsZUVsZW0gPSB0dWkudXRpbC5pbkFycmF5KHRhZ05hbWUsIFRBUkdFVF9UQUdTKSA+IC0xO1xuXG4gICAgICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2lucHV0Jykge1xuICAgICAgICAgICAgICAgIGVuYWJsZUVsZW0gPSB0dWkudXRpbC5pbkFycmF5KGlucHV0VHlwZSwgSU5QVVRfVFlQRVMpID4gLTE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBoYXNQcm9wICYmIGVuYWJsZUVsZW0gJiYgIWRpc2FibGVTdGF0ZTtcbiAgICAgICAgfSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXaGVuICdpbnB1dCcgb3IgJ3RleHRhcmVhJyBlbGVtZW50IGFscmVhZHkgaGFzIHZhbHVlLCBoaWRpbmcgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXJcbiAgICAgKiBAbWVtYmVyb2YgdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlclxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuaGlkZU9uSW5wdXRIYXZpbmdWYWx1ZSgpO1xuICAgICAqL1xuICAgIGhpZGVPbklucHV0SGF2aW5nVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNoYXJlZEluc3RhbmNlLmhpZGVPblRhcmdldHModHVpLnV0aWwuZmlsdGVyKHNoYXJlZEluc3RhbmNlLnRhcmdldHMsIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgcmV0dXJuICh0YXJnZXQudmFsdWUgIT09ICcnICYmIHRhcmdldC50eXBlICE9PSBJTlBVVF9UWVBFU1sxXSk7XG4gICAgICAgIH0pKTtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzQ29tcHV0ZWRTdHlsZSA9ICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSk7XG5cbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlICdzdHlsZScgZWxlbWVudCBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJ1bGVJbmZvIC0gVmFsdWUgb2Ygc2VsZWN0b3IgYW5kIGNzcyBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHZhciBzZWxlY3RvciA9IHJ1bGVJbmZvLnNlbGVjdG9yO1xuICAgICAgICB2YXIgY3NzID0gcnVsZUluZm8uY3NzO1xuICAgICAgICB2YXIgc3R5bGVTaGVldDtcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGFnIGZvciBiaW5kaW5nIGV2ZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0ge3JlcXVlc3RDYWxsYmFja30gY2FsbGJhY2sgLSBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WydvbicgKyBldmVudFR5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZSBDU1NUZXh0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0eWxlT2JqIC0gU3R5bGUgaW5mbyBvYmplY3RcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBDb25uZWN0ZWQgc3RyaW5nIG9mIHN0eWxlXG4gICAgICovXG4gICAgbWFrZVN0eWxlVGV4dDogZnVuY3Rpb24oc3R5bGVPYmopIHtcbiAgICAgICAgdmFyIHN0eWxlU3RyID0gJyc7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChzdHlsZU9iaiwgZnVuY3Rpb24odmFsdWUsIHByb3ApIHtcbiAgICAgICAgICAgIHN0eWxlU3RyICs9IHByb3AgKyAnOicgKyB2YWx1ZSArICc7JztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHN0eWxlU3RyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlIG1hdGNoZWQgcHJvcGVydHkgd2l0aCB0ZW1wbGF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZW1wbGF0ZSAtIFN0cmluZyBvZiB0ZW1wbGF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wT2JqIC0gUHJvcGVydGllc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJlcGxhY2VkIHRlbXBsYXRlIHN0cmluZ1xuICAgICAqL1xuICAgIGFwcGx5VGVtcGxhdGU6IGZ1bmN0aW9uKHRlbXBsYXRlLCBwcm9wT2JqKSB7XG4gICAgICAgIHZhciBuZXdUZW1wbGF0ZSA9IHRlbXBsYXRlLnJlcGxhY2UoL1xce1xceyhcXHcqKVxcfVxcfS9nLCBmdW5jdGlvbih2YWx1ZSwgcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BPYmouaGFzT3duUHJvcGVydHkocHJvcCkgPyBwcm9wT2JqW3Byb3BdIDogJyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBuZXdUZW1wbGF0ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBlbGVtZW50J3Mgc3R5bGUgdmFsdWUgZGVmaW5lZCBhdCBjc3MgZmlsZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIEN1cnJlbnQgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFN0eWxlIG9iamVjdCBvZiBlbGVtZW50XG4gICAgICovXG4gICAgZ2V0U3R5bGU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgY29tcHV0ZWRPYmo7XG5cbiAgICAgICAgaWYgKGhhc0NvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0LCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IHRhcmdldC5jdXJyZW50U3R5bGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29tcHV0ZWRPYmo7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIl19
