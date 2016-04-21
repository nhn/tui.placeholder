(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

tui.util.defineNamespace('tui.component.placeholder', require('./src/placeholder.js'));

window.onload = function() {
    tui.component.placeholder();
};

},{"./src/placeholder.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placehoder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var Placeholder;

var isSupportPlaceholder,
    sharedInstance;

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

sharedInstance = new Placeholder();

module.exports = function(elements) {
    sharedInstance.add(elements);
    sharedInstance.generatePlaceholder();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQucGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlci5qcycpKTtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIoKTtcbn07XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR2VuZXJhdGUgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIgb24gYnJvd3NlcnMgaXNuJ3Qgc3VwcG9ydGVkIHBsYWNlaG9kZXIgZmVhdHVyZVxuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbnZhciBQbGFjZWhvbGRlcjtcblxudmFyIGlzU3VwcG9ydFBsYWNlaG9sZGVyLFxuICAgIHNoYXJlZEluc3RhbmNlO1xuXG52YXIgYnJvd3NlciA9IHR1aS51dGlsLmJyb3dzZXI7XG5cbnZhciBLRVlDT0RFX0JBQ0sgPSA4O1xudmFyIEtFWUNPREVfVEFCID0gOTtcblxudmFyIElOUFVUX1RZUEVTID0gW1xuICAgICd0ZXh0JyxcbiAgICAncGFzc3dvcmQnLFxuICAgICdlbWFpbCcsXG4gICAgJ3RlbCcsXG4gICAgJ251bWJlcicsXG4gICAgJ3VybCcsXG4gICAgJ3NlYXJjaCdcbl07XG5cbmlmIChicm93c2VyLm1zaWUgJiYgKGJyb3dzZXIudmVyc2lvbiA+IDkgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnOi1tcy1pbnB1dC1wbGFjZWhvbGRlcicsXG4gICAgICAgIGNzczogJ2NvbG9yOiNmZmYgIWltcG9ydGFudDt0ZXh0LWluZGVudDotOTk5OXB4OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBQbGFjZWhvbGRlciBPYmplY3RcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudHMgLSBTZWxlY3RlZCAnaW5wdXQnIGVsZW1lbnRzXG4gKiBAZXhhbXBsZVxuICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcigpO1xuICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLWFyZWEnKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gKi9cblBsYWNlaG9sZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbGFjZWhvbGRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBwdXNoZWQgYWxsICdpbnB1dCcgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBlbGVtZW50cyBpbiBhcnJheVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRzIC0gc2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50c1xuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdHVpLnV0aWwudG9BcnJheShlbGVtZW50cyB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHZpcnR1YWwgcGxhY2Vob2xkZXJzIGZvciB0aGUgYnJvd3NlciBpc250J3Qgc3VwcG9ydGVkIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICovXG4gICAgZ2VuZXJhdGVQbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuX2lucHV0RWxlbXMsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbS50eXBlO1xuXG4gICAgICAgICAgICBpZiAodHVpLnV0aWwuaW5BcnJheSh0eXBlLCBJTlBVVF9UWVBFUykgPiAtMSAmJlxuICAgICAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fYXR0YWNoQ3VzdG9tUGxhY2Vob2xkZXIoZWxlbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGVsZW1lbnQncyBzdHlsZSB2YWx1ZSBkZWZpbmVkIGF0IGNzcyBmaWxlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gJ2lucHV0JyBlbGVtZW50XG4gICAgICogQHJldHVybnMge09iamVjdH0gU3R5bGUgaW5mbyBvZiAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRJbml0U3R5bGU6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgY29tcHV0ZWRPYmosXG4gICAgICAgICAgICBzdHlsZUluZm87XG5cbiAgICAgICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCwgbnVsbCk7XG5cbiAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJyksXG4gICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB0YXJnZXQuY3VycmVudFN0eWxlO1xuXG4gICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmZvbnRTaXplLFxuICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5wYWRkaW5nTGVmdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHlsZUluZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhIG5ldyB2aXJ0dWFsIHBsYWNlaG9sZGVyIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50IGFuZCB3cmFwIHRoaXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciBpbml0U3R5bGUgPSB0aGlzLl9nZXRJbml0U3R5bGUodGFyZ2V0KSxcbiAgICAgICAgICAgIHdyYXBUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyksXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gdGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIHdyYXBUYWcuaW5uZXJIVE1MID0gdGhpcy5fZ2VuZXJhdGVTcGFuVGFnKGluaXRTdHlsZS5wYWRkaW5nTGVmdCwgaW5pdFN0eWxlLmZvbnRTaXplLCBwbGFjZWhvbGRlciwgaW5wdXRWYWx1ZSk7XG4gICAgICAgIHdyYXBUYWcuYXBwZW5kQ2hpbGQodGFyZ2V0LmNsb25lTm9kZSgpKTtcblxuICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcFRhZywgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KTtcblxuICAgICAgICB3cmFwVGFnLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246cmVsYXRpdmU7bGluZS1oZWlnaHQ6MTsnO1xuXG4gICAgICAgIHRoaXMuX2JpbmRFdmVudFRvVmlydHVhbFBsYWNlaG9sZGVyKHdyYXBUYWcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50cyBvbiB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSB3cmFwcGVyIHRhZyBvZiB0aGUgJ2lucHV0JyBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEV2ZW50VG9WaXJ0dWFsUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5wdXRUYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JylbMF0sXG4gICAgICAgICAgICBzcGFuVGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0sXG4gICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHNwYW5UYWcsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5wdXRUYWcuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgaWYgKCEoa2V5Q29kZSA9PT0gS0VZQ09ERV9CQUNLIHx8IGtleUNvZGUgPT09IEtFWUNPREVfVEFCKSkge1xuICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFkZGluZ0xlZnQgLSBDdXJyZW50ICdpbnB1dCcgZWxlbWVudCdzIGxlZnQgcGFkZGluZyBzaXplXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGZvbnRTaXplIC0gQ3VycmVudCAnaW5wdXQnIGVsZW1lbnQncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwbGFjZWhvZGVyVGV4dCAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50IHZhbHVlIG9mIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlucHV0VmFsdWUgLSBDdXJyZW50ICdpbnB1dCcgZWxlbWVudCB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiB2aXJ0dWFsIHBsYWNlaG9kZXIgdGFnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihwYWRkaW5nTGVmdCwgZm9udFNpemUsIHBsYWNlaG9kZXJUZXh0LCBpbnB1dFZhbHVlKSB7XG4gICAgICAgIHZhciBodG1sID0gJzxzcGFuIHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7d2lkdGg6OTAlOyc7XG5cbiAgICAgICAgaHRtbCArPSAncGFkZGluZy1sZWZ0OicgKyBwYWRkaW5nTGVmdCArICc7bWFyZ2luLXRvcDonICsgKC0ocGFyc2VGbG9hdChmb250U2l6ZSwgMTApIC8gMikgLSAxKSArICdweDsnO1xuICAgICAgICBodG1sICs9ICdvdmVyZmxvdzpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7KmRpc3BsYXk6aW5saW5lO3pvb206MTsnO1xuICAgICAgICBodG1sICs9ICdkaXNwbGF5OicgKyAoaW5wdXRWYWx1ZSAhPT0gJycgPyAnbm9uZScgOiAnaW5saW5lLWJsb2NrJykgKyAnOyc7XG4gICAgICAgIGh0bWwgKz0gJ2NvbG9yOiNhYWE7bGluZS1oZWlnaHQ6MS4yO3otaW5kZXg6MDsnO1xuICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJztcIiBVTlNFTEVDVEFCTEU9XCJvblwiPicgKyBwbGFjZWhvZGVyVGV4dCArICc8L3NwYW4+JztcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG59KTtcblxuc2hhcmVkSW5zdGFuY2UgPSBuZXcgUGxhY2Vob2xkZXIoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbGVtZW50cykge1xuICAgIHNoYXJlZEluc3RhbmNlLmFkZChlbGVtZW50cyk7XG4gICAgc2hhcmVkSW5zdGFuY2UuZ2VuZXJhdGVQbGFjZWhvbGRlcigpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgPHN0eWxlPiB0YWcgYW5kIGFkZCBjc3MgcnVsZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBydWxlSW5mbyAtIFZhbHVlIG9mIHNlbGVjdG9yIGFuZCBjc3MgcHJvcGVydHlcbiAgICAgKi9cbiAgICBhZGRDc3NSdWxlOiBmdW5jdGlvbihydWxlSW5mbykge1xuICAgICAgICB2YXIgc3R5bGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgICAgc3R5bGVTaGVldCxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gcnVsZUluZm8uc2VsZWN0b3IsXG4gICAgICAgICAgICBjc3MgPSBydWxlSW5mby5jc3M7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmhlYWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdHlsZVNoZWV0ID0gc3R5bGVUYWcuc2hlZXQgfHwgc3R5bGVUYWcuc3R5bGVTaGVldDtcblxuICAgICAgICBpZiAoc3R5bGVTaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0Lmluc2VydFJ1bGUoc2VsZWN0b3IgKyAneycgKyBjc3MgKyAnfScsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5hZGRSdWxlKHNlbGVjdG9yLCBjc3MsIDApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgdG8gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRhZyBmb3IgYmluZGluZyBldmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFR5cGUgLSBFdmVudCB0eXBlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WydvbicgKyBldmVudFR5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iXX0=
