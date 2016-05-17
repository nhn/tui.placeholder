(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

tui.util.defineNamespace('tui.component.placeholder', require('./src/placeholder.js'));

},{"./src/placeholder.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var browser = tui.util.browser;
var Placeholder, sharedInstance, isSupportPlaceholder;

var KEYCODE_BACK = 8;
var KEYCODE_TAB = 9;
var INPUT_TYPES = [
    'text',
    'password',
    'email',
    'tel',
    'number',
    'url',
    'search'
];

/**
 * Placeholder Object
 * @constructor
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed 'input' elements in the current page
         * @type {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * Get all 'input' elements
     * @returns {HTMLElements} All 'input' elements
     */
    getAllInputElems: function() {
        return this._inputElems;
    },

    /**
     * Add elements in array
     * @param {HTMLElements} inputElems - Selected 'input' elements for generating placeholder
     */
    generatePlaceholders: function(inputElems) {
        this._inputElems = this._inputElems.concat(inputElems);

        tui.util.forEach(inputElems, this._attachPlaceholder, this);
    },

    /**
     * Hide placeholder on 'input' element that has already value
     * @param {HTMLElements} inputElems - Selected 'input' elements for hiding placeholder
     */
    hidePlaceholders: function(inputElems) {
        tui.util.forEach(inputElems, function(elem) {
            var placeholder = elem.parentNode.getElementsByTagName('span')[0];

            placeholder.style.display = 'none';
        });
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - 'input' element
     * @returns {Object} Style info of 'input' element
     * @private
     */
    _getInitStyle: function(target) {
        var computedObj;
        var styleInfo;

        if (window.getComputedStyle) {
            computedObj = window.getComputedStyle(target, null);

            styleInfo = {
                fontSize: computedObj.getPropertyValue('font-size'),
                paddingLeft: computedObj.getPropertyValue('padding-left')
            };
        } else {
            computedObj = target.currentStyle;

            styleInfo = {
                fontSize: computedObj.fontSize,
                paddingLeft: computedObj.paddingLeft
            };
        }

        return styleInfo;
    },

    /**
     * Attach a new virtual placeholder after a selected 'input' element and wrap this element
     * @param {HTMLElement} target - The 'input' element
     * @param {Number} index - Current item index
     * @private
     */
    _attachPlaceholder: function(target, index) {
        var initStyle = this._getInitStyle(target);
        var wrapTag = document.createElement('span');
        var placeholder = target.getAttribute('placeholder');
        var parentNode = target.parentNode;
        var cloneNode = target.cloneNode();
        var hasValue = target.value !== '';

        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, hasValue);
        wrapTag.appendChild(cloneNode);

        parentNode.insertBefore(wrapTag, target.nextSibling);
        parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._inputElems[index] = cloneNode;

        this._bindEvent(wrapTag);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The wrapper tag of the 'input' element
     * @private
     */
    _bindEvent: function(target) {
        var inputElem = target.getElementsByTagName('input')[0];
        var spanElem = target.getElementsByTagName('span')[0];
        var spanStyle = spanElem.style;

        /**
         * Event handler
         */
        function onKeyup() {
            if (inputElem.value === '') {
                spanStyle.display = 'inline-block';
            }
        }

        util.bindEvent(spanElem, 'click', function() {
            inputElem.focus();
        });

        util.bindEvent(inputElem, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB ||
                (e.shiftKey && keyCode === KEYCODE_TAB))) {
                spanStyle.display = 'none';
            }
        });

        util.bindEvent(inputElem, 'keyup', onKeyup);
        util.bindEvent(inputElem, 'blur', onKeyup);
    },

    /**
     * Generate the virtual placeholder element
     * @param {Number} paddingLeft - Current 'input' element's left padding size
     * @param {Number} fontSize - Current 'input' element's 'font-size' property value
     * @param {String} placeholderText - Current 'input' element value of placeholder property
     * @param {Boolena} hasValue - State of current 'input' element that has value
     * @returns {String} String of virtual placeholder tag
     * @private
     */
    _generateSpanTag: function(paddingLeft, fontSize, placeholderText, hasValue) {
        var html = '<span style="position:absolute;left:0;top:50%;width:90%;';

        html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';
        html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;*display:inline;zoom:1;';
        html += 'display:' + (hasValue ? 'none' : 'inline-block') + ';';
        html += 'color:#aaa;line-height:1.2;z-index:0;';
        html += 'font-size:' + fontSize + ';" UNSELECTABLE="on">' + placeholderText + '</span>';

        return html;
    }
});

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

sharedInstance = new Placeholder();

module.exports = {
    /**
     * Generate virtual placeholders
     * @param {HTMLElements|Undefined} inputElems - created 'input' elements
     * @api
     * @example
     * tui.component.placeholder.generate();
     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
     */
    generate: function(inputElems) {
        var selectedElems;

        if (isSupportPlaceholder) {
            return;
        }

        selectedElems = tui.util.toArray(inputElems || document.getElementsByTagName('input'));

        sharedInstance.generatePlaceholders(tui.util.filter(selectedElems, function(elem) {
            var type = elem.type.toLowerCase();
            var diableState = elem.disabled;
            var readonlyState = elem.readOnly;

            return (tui.util.inArray(type, INPUT_TYPES) > -1 &&
                    elem.getAttribute('placeholder') &&
                    !(diableState || readonlyState));
        }));
    },

    /**
     * When 'input' element already has value, hide the virtual placeholder
     * @api
     * @example
     * tui.component.placeholder.hideOnInputHavingValue();
     */
    hideOnInputHavingValue: function() {
        var inputElems;

        if (isSupportPlaceholder) {
            return;
        }

        inputElems = sharedInstance.getAllInputElems();

        sharedInstance.hidePlaceholders(tui.util.filter(inputElems, function(elem) {
            return (elem.value !== '' && elem.type !== INPUT_TYPES[1]);
        }));
    },

    /**
     * Reset 'input' elements array (method for testcase)
     * @api
     * @example
     * tui.component.placeholder.reset();
     */
    reset: function() {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.getAllInputElems().length = 0;
    }
};

},{"./util.js":3}],3:[function(require,module,exports){
'use strict';

var util = {
    /**
     * Generate <style> tag and add css rule
     * @param {Object} ruleInfo - Value of selector and css property
     */
    addCssRule: function(ruleInfo) {
        var styleTag = document.createElement('style'),
            styleSheet,
            selector = ruleInfo.selector,
            css = ruleInfo.css;

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
     * @param {String} eventType - Event type
     * @param {Function} callback - Event handler function
     */
    bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = callback;
        }
    }
};

module.exports = util;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQucGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlci5qcycpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHZW5lcmF0ZSB0aGUgdmlydHVhbCBwbGFjZWhvbGRlciBvbiBicm93c2VycyBpc24ndCBzdXBwb3J0ZWQgcGxhY2Vob2xkZXIgZmVhdHVyZVxuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbnZhciBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcjtcbnZhciBQbGFjZWhvbGRlciwgc2hhcmVkSW5zdGFuY2UsIGlzU3VwcG9ydFBsYWNlaG9sZGVyO1xuXG52YXIgS0VZQ09ERV9CQUNLID0gODtcbnZhciBLRVlDT0RFX1RBQiA9IDk7XG52YXIgSU5QVVRfVFlQRVMgPSBbXG4gICAgJ3RleHQnLFxuICAgICdwYXNzd29yZCcsXG4gICAgJ2VtYWlsJyxcbiAgICAndGVsJyxcbiAgICAnbnVtYmVyJyxcbiAgICAndXJsJyxcbiAgICAnc2VhcmNoJ1xuXTtcblxuLyoqXG4gKiBQbGFjZWhvbGRlciBPYmplY3RcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5QbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxhY2Vob2xkZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgcHVzaGVkICdpbnB1dCcgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgJ2lucHV0JyBlbGVtZW50c1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHN9IEFsbCAnaW5wdXQnIGVsZW1lbnRzXG4gICAgICovXG4gICAgZ2V0QWxsSW5wdXRFbGVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnB1dEVsZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZWxlbWVudHMgaW4gYXJyYXlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c30gaW5wdXRFbGVtcyAtIFNlbGVjdGVkICdpbnB1dCcgZWxlbWVudHMgZm9yIGdlbmVyYXRpbmcgcGxhY2Vob2xkZXJcbiAgICAgKi9cbiAgICBnZW5lcmF0ZVBsYWNlaG9sZGVyczogZnVuY3Rpb24oaW5wdXRFbGVtcykge1xuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdGhpcy5faW5wdXRFbGVtcy5jb25jYXQoaW5wdXRFbGVtcyk7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChpbnB1dEVsZW1zLCB0aGlzLl9hdHRhY2hQbGFjZWhvbGRlciwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhpZGUgcGxhY2Vob2xkZXIgb24gJ2lucHV0JyBlbGVtZW50IHRoYXQgaGFzIGFscmVhZHkgdmFsdWVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50c30gaW5wdXRFbGVtcyAtIFNlbGVjdGVkICdpbnB1dCcgZWxlbWVudHMgZm9yIGhpZGluZyBwbGFjZWhvbGRlclxuICAgICAqL1xuICAgIGhpZGVQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKGlucHV0RWxlbXMpIHtcbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaChpbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgcGxhY2Vob2xkZXIgPSBlbGVtLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcblxuICAgICAgICAgICAgcGxhY2Vob2xkZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgZWxlbWVudCdzIHN0eWxlIHZhbHVlIGRlZmluZWQgYXQgY3NzIGZpbGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvIG9mICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluaXRTdHlsZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciBjb21wdXRlZE9iajtcbiAgICAgICAgdmFyIHN0eWxlSW5mbztcblxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0LCBudWxsKTtcblxuICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0JylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IHRhcmdldC5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZm9udFNpemUsXG4gICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IGNvbXB1dGVkT2JqLnBhZGRpbmdMZWZ0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0eWxlSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgbmV3IHZpcnR1YWwgcGxhY2Vob2xkZXIgYWZ0ZXIgYSBzZWxlY3RlZCAnaW5wdXQnIGVsZW1lbnQgYW5kIHdyYXAgdGhpcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIEN1cnJlbnQgaXRlbSBpbmRleFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaFBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQsIGluZGV4KSB7XG4gICAgICAgIHZhciBpbml0U3R5bGUgPSB0aGlzLl9nZXRJbml0U3R5bGUodGFyZ2V0KTtcbiAgICAgICAgdmFyIHdyYXBUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIHZhciBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG4gICAgICAgIHZhciBwYXJlbnROb2RlID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgIHZhciBjbG9uZU5vZGUgPSB0YXJnZXQuY2xvbmVOb2RlKCk7XG4gICAgICAgIHZhciBoYXNWYWx1ZSA9IHRhcmdldC52YWx1ZSAhPT0gJyc7XG5cbiAgICAgICAgd3JhcFRhZy5pbm5lckhUTUwgPSB0aGlzLl9nZW5lcmF0ZVNwYW5UYWcoaW5pdFN0eWxlLnBhZGRpbmdMZWZ0LCBpbml0U3R5bGUuZm9udFNpemUsIHBsYWNlaG9sZGVyLCBoYXNWYWx1ZSk7XG4gICAgICAgIHdyYXBUYWcuYXBwZW5kQ2hpbGQoY2xvbmVOb2RlKTtcblxuICAgICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwVGFnLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO2xpbmUtaGVpZ2h0OjE7JztcblxuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zW2luZGV4XSA9IGNsb25lTm9kZTtcblxuICAgICAgICB0aGlzLl9iaW5kRXZlbnQod3JhcFRhZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzIG9uIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlIHdyYXBwZXIgdGFnIG9mIHRoZSAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5wdXRFbGVtID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdO1xuICAgICAgICB2YXIgc3BhbkVsZW0gPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXTtcbiAgICAgICAgdmFyIHNwYW5TdHlsZSA9IHNwYW5FbGVtLnN0eWxlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCBoYW5kbGVyXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBvbktleXVwKCkge1xuICAgICAgICAgICAgaWYgKGlucHV0RWxlbS52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoc3BhbkVsZW0sICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5wdXRFbGVtLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0RWxlbSwgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIga2V5Q29kZSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuXG4gICAgICAgICAgICBpZiAoIShrZXlDb2RlID09PSBLRVlDT0RFX0JBQ0sgfHwga2V5Q29kZSA9PT0gS0VZQ09ERV9UQUIgfHxcbiAgICAgICAgICAgICAgICAoZS5zaGlmdEtleSAmJiBrZXlDb2RlID09PSBLRVlDT0RFX1RBQikpKSB7XG4gICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0RWxlbSwgJ2tleXVwJywgb25LZXl1cCk7XG4gICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0RWxlbSwgJ2JsdXInLCBvbktleXVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWRkaW5nTGVmdCAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50J3MgbGVmdCBwYWRkaW5nIHNpemVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZm9udFNpemUgLSBDdXJyZW50ICdpbnB1dCcgZWxlbWVudCdzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYWNlaG9sZGVyVGV4dCAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50IHZhbHVlIG9mIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtCb29sZW5hfSBoYXNWYWx1ZSAtIFN0YXRlIG9mIGN1cnJlbnQgJ2lucHV0JyBlbGVtZW50IHRoYXQgaGFzIHZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ30gU3RyaW5nIG9mIHZpcnR1YWwgcGxhY2Vob2xkZXIgdGFnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihwYWRkaW5nTGVmdCwgZm9udFNpemUsIHBsYWNlaG9sZGVyVGV4dCwgaGFzVmFsdWUpIHtcbiAgICAgICAgdmFyIGh0bWwgPSAnPHNwYW4gc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt3aWR0aDo5MCU7JztcblxuICAgICAgICBodG1sICs9ICdwYWRkaW5nLWxlZnQ6JyArIHBhZGRpbmdMZWZ0ICsgJzttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyKSAtIDEpICsgJ3B4Oyc7XG4gICAgICAgIGh0bWwgKz0gJ292ZXJmbG93OmhpZGRlbjt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpczsqZGlzcGxheTppbmxpbmU7em9vbToxOyc7XG4gICAgICAgIGh0bWwgKz0gJ2Rpc3BsYXk6JyArIChoYXNWYWx1ZSA/ICdub25lJyA6ICdpbmxpbmUtYmxvY2snKSArICc7JztcbiAgICAgICAgaHRtbCArPSAnY29sb3I6I2FhYTtsaW5lLWhlaWdodDoxLjI7ei1pbmRleDowOyc7XG4gICAgICAgIGh0bWwgKz0gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnO1wiIFVOU0VMRUNUQUJMRT1cIm9uXCI+JyArIHBsYWNlaG9sZGVyVGV4dCArICc8L3NwYW4+JztcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG59KTtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufVxuXG5pc1N1cHBvcnRQbGFjZWhvbGRlciA9ICdwbGFjZWhvbGRlcicgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSAmJiAhKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpO1xuXG5zaGFyZWRJbnN0YW5jZSA9IG5ldyBQbGFjZWhvbGRlcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB2aXJ0dWFsIHBsYWNlaG9sZGVyc1xuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRzfFVuZGVmaW5lZH0gaW5wdXRFbGVtcyAtIGNyZWF0ZWQgJ2lucHV0JyBlbGVtZW50c1xuICAgICAqIEBhcGlcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuZ2VuZXJhdGUoKTtcbiAgICAgKiB0dWkuY29tcG9uZW50LnBsYWNlaG9sZGVyLmdlbmVyYXRlKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgKi9cbiAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaW5wdXRFbGVtcykge1xuICAgICAgICB2YXIgc2VsZWN0ZWRFbGVtcztcblxuICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGVjdGVkRWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGlucHV0RWxlbXMgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JykpO1xuXG4gICAgICAgIHNoYXJlZEluc3RhbmNlLmdlbmVyYXRlUGxhY2Vob2xkZXJzKHR1aS51dGlsLmZpbHRlcihzZWxlY3RlZEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW0udHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIGRpYWJsZVN0YXRlID0gZWxlbS5kaXNhYmxlZDtcbiAgICAgICAgICAgIHZhciByZWFkb25seVN0YXRlID0gZWxlbS5yZWFkT25seTtcblxuICAgICAgICAgICAgcmV0dXJuICh0dWkudXRpbC5pbkFycmF5KHR5cGUsIElOUFVUX1RZUEVTKSA+IC0xICYmXG4gICAgICAgICAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpICYmXG4gICAgICAgICAgICAgICAgICAgICEoZGlhYmxlU3RhdGUgfHwgcmVhZG9ubHlTdGF0ZSkpO1xuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gJ2lucHV0JyBlbGVtZW50IGFscmVhZHkgaGFzIHZhbHVlLCBoaWRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlci5oaWRlT25JbnB1dEhhdmluZ1ZhbHVlKCk7XG4gICAgICovXG4gICAgaGlkZU9uSW5wdXRIYXZpbmdWYWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnB1dEVsZW1zO1xuXG4gICAgICAgIGlmIChpc1N1cHBvcnRQbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaW5wdXRFbGVtcyA9IHNoYXJlZEluc3RhbmNlLmdldEFsbElucHV0RWxlbXMoKTtcblxuICAgICAgICBzaGFyZWRJbnN0YW5jZS5oaWRlUGxhY2Vob2xkZXJzKHR1aS51dGlsLmZpbHRlcihpbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gKGVsZW0udmFsdWUgIT09ICcnICYmIGVsZW0udHlwZSAhPT0gSU5QVVRfVFlQRVNbMV0pO1xuICAgICAgICB9KSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0ICdpbnB1dCcgZWxlbWVudHMgYXJyYXkgKG1ldGhvZCBmb3IgdGVzdGNhc2UpXG4gICAgICogQGFwaVxuICAgICAqIEBleGFtcGxlXG4gICAgICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlci5yZXNldCgpO1xuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzaGFyZWRJbnN0YW5jZS5nZXRBbGxJbnB1dEVsZW1zKCkubGVuZ3RoID0gMDtcbiAgICB9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSA8c3R5bGU+IHRhZyBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJ1bGVJbmZvIC0gVmFsdWUgb2Ygc2VsZWN0b3IgYW5kIGNzcyBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGFnIGZvciBiaW5kaW5nIGV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
