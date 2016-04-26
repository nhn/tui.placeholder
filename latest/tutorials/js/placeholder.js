(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Placeholder = require('./src/placeholder.js');
var sharedInstance = new Placeholder();
var component = tui.util.defineNamespace('tui.component');

component.placeholder = function(elements) {
    sharedInstance.add(elements);
    sharedInstance.generatePlaceholder();
};

},{"./src/placeholder.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placehoder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var Placeholder;
var isSupportPlaceholder;
var browser = tui.util.browser;

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

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

/**
 * Placeholder Object
 * @constructor
 * @param {HTMLElement} elements - Selected 'input' elements
 * @example
 * tui.component.placeholder();
 * tui.component.placeholder(document.getElementById('add-area').getElementsByTagName('input'));
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed all 'input' elements in the current page
         * @type {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * Add elements in array
     * @param {HTMLElement} elements - selected 'input' elements
     */
    add: function(elements) {
        if (isSupportPlaceholder) {
            return;
        }

        this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));
    },

    /**
     * Generate virtual placeholders for the browser isnt't supported placeholder property
     */
    generatePlaceholder: function() {
        var self = this;

        tui.util.forEach(this._inputElems, function(elem) {
            var type = elem.type;

            if (tui.util.inArray(type, INPUT_TYPES) > -1 &&
                elem.getAttribute('placeholder')) {
                self._attachCustomPlaceholder(elem);
            }
        });
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - 'input' element
     * @returns {Object} Style info of 'input' element
     * @private
     */
    _getInitStyle: function(target) {
        var computedObj,
            styleInfo;

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
     * @private
     */
    _attachCustomPlaceholder: function(target) {
        var initStyle = this._getInitStyle(target),
            wrapTag = document.createElement('span'),
            placeholder = target.getAttribute('placeholder'),
            inputValue = target.value;

        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, inputValue);
        wrapTag.appendChild(target.cloneNode());

        target.parentNode.insertBefore(wrapTag, target.nextSibling);
        target.parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._bindEventToVirtualPlaceholder(wrapTag);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The wrapper tag of the 'input' element
     * @private
     */
    _bindEventToVirtualPlaceholder: function(target) {
        var inputTag = target.getElementsByTagName('input')[0],
            spanTag = target.getElementsByTagName('span')[0],
            spanStyle = spanTag.style;

        util.bindEvent(spanTag, 'click', function() {
            inputTag.focus();
        });

        util.bindEvent(inputTag, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB)) {
                spanStyle.display = 'none';
            }
        });

        util.bindEvent(inputTag, 'keyup', function() {
            if (inputTag.value === '') {
                spanStyle.display = 'inline-block';
            }
        });
    },

    /**
     * Generate the virtual placeholder element
     * @param {Number} paddingLeft - Current 'input' element's left padding size
     * @param {Number} fontSize - Current 'input' element's 'font-size' property value
     * @param {String} placehoderText - Current 'input' element value of placeholder property
     * @param {String} inputValue - Current 'input' element value
     * @returns {String} String of virtual placehoder tag
     * @private
     */
    _generateSpanTag: function(paddingLeft, fontSize, placehoderText, inputValue) {
        var html = '<span style="position:absolute;left:0;top:50%;width:90%;';

        html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';
        html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;*display:inline;zoom:1;';
        html += 'display:' + (inputValue !== '' ? 'none' : 'inline-block') + ';';
        html += 'color:#aaa;line-height:1.2;z-index:0;';
        html += 'font-size:' + fontSize + ';" UNSELECTABLE="on">' + placehoderText + '</span>';

        return html;
    }
});

module.exports = Placeholder;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGxhY2Vob2xkZXIgPSByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlci5qcycpO1xudmFyIHNoYXJlZEluc3RhbmNlID0gbmV3IFBsYWNlaG9sZGVyKCk7XG52YXIgY29tcG9uZW50ID0gdHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50Jyk7XG5cbmNvbXBvbmVudC5wbGFjZWhvbGRlciA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgc2hhcmVkSW5zdGFuY2UuYWRkKGVsZW1lbnRzKTtcbiAgICBzaGFyZWRJbnN0YW5jZS5nZW5lcmF0ZVBsYWNlaG9sZGVyKCk7XG59O1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdlbmVyYXRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIG9uIGJyb3dzZXJzIGlzbid0IHN1cHBvcnRlZCBwbGFjZWhvZGVyIGZlYXR1cmVcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXI7XG52YXIgaXNTdXBwb3J0UGxhY2Vob2xkZXI7XG52YXIgYnJvd3NlciA9IHR1aS51dGlsLmJyb3dzZXI7XG5cbnZhciBLRVlDT0RFX0JBQ0sgPSA4O1xudmFyIEtFWUNPREVfVEFCID0gOTtcbnZhciBJTlBVVF9UWVBFUyA9IFtcbiAgICAndGV4dCcsXG4gICAgJ3Bhc3N3b3JkJyxcbiAgICAnZW1haWwnLFxuICAgICd0ZWwnLFxuICAgICdudW1iZXInLFxuICAgICd1cmwnLFxuICAgICdzZWFyY2gnXG5dO1xuXG5pZiAoYnJvd3Nlci5tc2llICYmIChicm93c2VyLnZlcnNpb24gPiA5ICYmIGJyb3dzZXIudmVyc2lvbiA8PSAxMSkpIHtcbiAgICB1dGlsLmFkZENzc1J1bGUoe1xuICAgICAgICBzZWxlY3RvcjogJzotbXMtaW5wdXQtcGxhY2Vob2xkZXInLFxuICAgICAgICBjc3M6ICdjb2xvcjojZmZmICFpbXBvcnRhbnQ7dGV4dC1pbmRlbnQ6LTk5OTlweDsnXG4gICAgfSk7XG59XG5cbmlzU3VwcG9ydFBsYWNlaG9sZGVyID0gJ3BsYWNlaG9sZGVyJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpICYmICEoYnJvd3Nlci5tc2llICYmIGJyb3dzZXIudmVyc2lvbiA8PSAxMSk7XG5cbi8qKlxuICogUGxhY2Vob2xkZXIgT2JqZWN0XG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRzIC0gU2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50c1xuICogQGV4YW1wbGVcbiAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIoKTtcbiAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZC1hcmVhJykuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JykpO1xuICovXG5QbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxhY2Vob2xkZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgcHVzaGVkIGFsbCAnaW5wdXQnIGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faW5wdXRFbGVtcyA9IFtdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGQgZWxlbWVudHMgaW4gYXJyYXlcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50cyAtIHNlbGVjdGVkICdpbnB1dCcgZWxlbWVudHNcbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgIGlmIChpc1N1cHBvcnRQbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5faW5wdXRFbGVtcyA9IHR1aS51dGlsLnRvQXJyYXkoZWxlbWVudHMgfHwgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgdGhlIGJyb3dzZXIgaXNudCd0IHN1cHBvcnRlZCBwbGFjZWhvbGRlciBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGdlbmVyYXRlUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9pbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IGVsZW0udHlwZTtcblxuICAgICAgICAgICAgaWYgKHR1aS51dGlsLmluQXJyYXkodHlwZSwgSU5QVVRfVFlQRVMpID4gLTEgJiZcbiAgICAgICAgICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBlbGVtZW50J3Mgc3R5bGUgdmFsdWUgZGVmaW5lZCBhdCBjc3MgZmlsZVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IFN0eWxlIGluZm8gb2YgJ2lucHV0JyBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkT2JqLFxuICAgICAgICAgICAgc3R5bGVJbmZvO1xuXG4gICAgICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQsIG51bGwpO1xuXG4gICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpLFxuICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gdGFyZ2V0LmN1cnJlbnRTdHlsZTtcblxuICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5mb250U2l6ZSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogY29tcHV0ZWRPYmoucGFkZGluZ0xlZnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3R5bGVJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYSBuZXcgdmlydHVhbCBwbGFjZWhvbGRlciBhZnRlciBhIHNlbGVjdGVkICdpbnB1dCcgZWxlbWVudCBhbmQgd3JhcCB0aGlzIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYXR0YWNoQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5pdFN0eWxlID0gdGhpcy5fZ2V0SW5pdFN0eWxlKHRhcmdldCksXG4gICAgICAgICAgICB3cmFwVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpLFxuICAgICAgICAgICAgaW5wdXRWYWx1ZSA9IHRhcmdldC52YWx1ZTtcblxuICAgICAgICB3cmFwVGFnLmlubmVySFRNTCA9IHRoaXMuX2dlbmVyYXRlU3BhblRhZyhpbml0U3R5bGUucGFkZGluZ0xlZnQsIGluaXRTdHlsZS5mb250U2l6ZSwgcGxhY2Vob2xkZXIsIGlucHV0VmFsdWUpO1xuICAgICAgICB3cmFwVGFnLmFwcGVuZENoaWxkKHRhcmdldC5jbG9uZU5vZGUoKSk7XG5cbiAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBUYWcsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO2xpbmUtaGVpZ2h0OjE7JztcblxuICAgICAgICB0aGlzLl9iaW5kRXZlbnRUb1ZpcnR1YWxQbGFjZWhvbGRlcih3cmFwVGFnKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudHMgb24gdGhlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgd3JhcHBlciB0YWcgb2YgdGhlICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRFdmVudFRvVmlydHVhbFBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGlucHV0VGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdLFxuICAgICAgICAgICAgc3BhblRhZyA9IHRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdLFxuICAgICAgICAgICAgc3BhblN0eWxlID0gc3BhblRhZy5zdHlsZTtcblxuICAgICAgICB1dGlsLmJpbmRFdmVudChzcGFuVGFnLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlucHV0VGFnLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IEtFWUNPREVfQkFDSyB8fCBrZXlDb2RlID09PSBLRVlDT0RFX1RBQikpIHtcbiAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXl1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGlucHV0VGFnLnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB0aGUgdmlydHVhbCBwbGFjZWhvbGRlciBlbGVtZW50XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZGRpbmdMZWZ0IC0gQ3VycmVudCAnaW5wdXQnIGVsZW1lbnQncyBsZWZ0IHBhZGRpbmcgc2l6ZVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBmb250U2l6ZSAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50J3MgJ2ZvbnQtc2l6ZScgcHJvcGVydHkgdmFsdWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGxhY2Vob2RlclRleHQgLSBDdXJyZW50ICdpbnB1dCcgZWxlbWVudCB2YWx1ZSBvZiBwbGFjZWhvbGRlciBwcm9wZXJ0eVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dFZhbHVlIC0gQ3VycmVudCAnaW5wdXQnIGVsZW1lbnQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgdmlydHVhbCBwbGFjZWhvZGVyIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dlbmVyYXRlU3BhblRhZzogZnVuY3Rpb24ocGFkZGluZ0xlZnQsIGZvbnRTaXplLCBwbGFjZWhvZGVyVGV4dCwgaW5wdXRWYWx1ZSkge1xuICAgICAgICB2YXIgaHRtbCA9ICc8c3BhbiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6NTAlO3dpZHRoOjkwJTsnO1xuXG4gICAgICAgIGh0bWwgKz0gJ3BhZGRpbmctbGVmdDonICsgcGFkZGluZ0xlZnQgKyAnO21hcmdpbi10b3A6JyArICgtKHBhcnNlRmxvYXQoZm9udFNpemUsIDEwKSAvIDIpIC0gMSkgKyAncHg7JztcbiAgICAgICAgaHRtbCArPSAnb3ZlcmZsb3c6aGlkZGVuO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzOypkaXNwbGF5OmlubGluZTt6b29tOjE7JztcbiAgICAgICAgaHRtbCArPSAnZGlzcGxheTonICsgKGlucHV0VmFsdWUgIT09ICcnID8gJ25vbmUnIDogJ2lubGluZS1ibG9jaycpICsgJzsnO1xuICAgICAgICBodG1sICs9ICdjb2xvcjojYWFhO2xpbmUtaGVpZ2h0OjEuMjt6LWluZGV4OjA7JztcbiAgICAgICAgaHRtbCArPSAnZm9udC1zaXplOicgKyBmb250U2l6ZSArICc7XCIgVU5TRUxFQ1RBQkxFPVwib25cIj4nICsgcGxhY2Vob2RlclRleHQgKyAnPC9zcGFuPic7XG5cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhY2Vob2xkZXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIDxzdHlsZT4gdGFnIGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcnVsZUluZm8gLSBWYWx1ZSBvZiBzZWxlY3RvciBhbmQgY3NzIHByb3BlcnR5XG4gICAgICovXG4gICAgYWRkQ3NzUnVsZTogZnVuY3Rpb24ocnVsZUluZm8pIHtcbiAgICAgICAgdmFyIHN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICAgIHN0eWxlU2hlZXQsXG4gICAgICAgICAgICBzZWxlY3RvciA9IHJ1bGVJbmZvLnNlbGVjdG9yLFxuICAgICAgICAgICAgY3NzID0gcnVsZUluZm8uY3NzO1xuXG4gICAgICAgIGlmIChkb2N1bWVudC5oZWFkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGVTaGVldCA9IHN0eWxlVGFnLnNoZWV0IHx8IHN0eWxlVGFnLnN0eWxlU2hlZXQ7XG5cbiAgICAgICAgaWYgKHN0eWxlU2hlZXQuaW5zZXJ0UnVsZSkge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5pbnNlcnRSdWxlKHNlbGVjdG9yICsgJ3snICsgY3NzICsgJ30nLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuYWRkUnVsZShzZWxlY3RvciwgY3NzLCAwKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IHRvIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUYWcgZm9yIGJpbmRpbmcgZXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gRXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgICAqL1xuICAgIGJpbmRFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBldmVudFR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFsnb24nICsgZXZlbnRUeXBlXSA9IGNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIl19
