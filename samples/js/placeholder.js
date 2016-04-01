(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

tui.util.defineNamespace('tui.component.placeholder', require('./placeholder'));
tui.component.placeholder.add();

},{"./placeholder":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placehoder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';
var util = require('./util.js');

var Placeholder;

var isSupportPlaceholder,
    browser = tui.util.browser,
    KEYCODE_BACK = 8,
    KEYCODE_TAB = 9;

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

/**
 * Placeholder Class
 * @class Placeholder
 * @constructor
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed all <input> elements in the current page
         * @type  {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * When create dynamic <input> elements and this elements append on page, generate the virtual placeholder
     * @param {HTMLElement[]} elements - <input> elements
     * @example
     * tui.component.placeholder.add();
     * tui.component.placeholder.add(document.getElementsByTagName('input'));
     * @api
     */
    add: function(elements) {
        if (isSupportPlaceholder) {
            return;
        }

        this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));

        if (this._inputElems.length) {
            this._generatePlaceholder();
        }
    },

    /**
     * Returns element's style value defined at css file
     * @param  {HTMLElement} elem - <input> element
     * @returns {Object} Style info
     * @private
     */
    _getInitStyle: function(elem) {
        var computedObj,
            styleInfo;

        if (window.getComputedStyle) {
            computedObj = window.getComputedStyle(elem, null);

            styleInfo = {
                fontSize: computedObj.getPropertyValue('font-size'),
                paddingLeft: computedObj.getPropertyValue('padding-left')
            };
        } else {
            computedObj = elem.currentStyle;

            styleInfo = {
                fontSize: computedObj.fontSize,
                paddingLeft: computedObj.paddingLeft
            };
        }

        return styleInfo;
    },

    /**
     * Generate virtual placeholders for browser isnt't supported placeholder feature
     * @private
     */
    _generatePlaceholder: function() {
        var self = this;

        tui.util.forEach(this._inputElems, function(elem) {
            var type = elem.type;

            if ((type === 'text' || type === 'password' || type === 'email') &&
                elem.getAttribute('placeholder')) {
                self._attachCustomPlaceholder(elem);
            }
        });
    },

    /**
     * Attach a new virtual placeholder after a selected <input> element and wrap <input> element
     * @param  {HTMLElement} target - The 'input' tag
     * @private
     */
    _attachCustomPlaceholder: function(target) {
        var initStyle = this._getInitStyle(target),
            fontSize = initStyle.fontSize,
            paddingLeft = initStyle.paddingLeft,
            wrapTag = document.createElement('span'),
            placeholder = target.getAttribute('placeholder'),
            inputValue = target.value;

        wrapTag.innerHTML = this._generateSpanTag(paddingLeft, fontSize, placeholder, inputValue);
        wrapTag.appendChild(target.cloneNode());

        target.parentNode.insertBefore(wrapTag, target.nextSibling);
        target.parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._bindEventToCustomPlaceholder(wrapTag);
    },

    /**
     * Bind events on the element
     * @param  {HTMLElement} target - The wrapper tag of the <input> element
     * @private
     */
    _bindEventToCustomPlaceholder: function(target) {
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
     * @param  {Number} paddingLeft - Current <input> element's left padding size
     * @param  {Number} fontSize - Current <input> element's 'font-size' property value
     * @param  {String} placehoderText - Current <input> element value of placeholder property
     * @param  {String} inputValue - Current <input> element value
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

module.exports = new Placeholder();

},{"./util.js":3}],3:[function(require,module,exports){
'use strict';
var util = {
    /**
     * Generate 'style' tag and add css rule
     * @param  {Object} ruleInfo - selector and css value
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
     * @param  {HTMLElement} target - Tag for binding
     * @param  {String} eventType - Event type
     * @param  {Function} callback - Event handler function
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcGxhY2Vob2xkZXIuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LnBsYWNlaG9sZGVyJywgcmVxdWlyZSgnLi9wbGFjZWhvbGRlcicpKTtcbnR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuYWRkKCk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR2VuZXJhdGUgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIgb24gYnJvd3NlcnMgaXNuJ3Qgc3VwcG9ydGVkIHBsYWNlaG9kZXIgZmVhdHVyZVxuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXI7XG5cbnZhciBpc1N1cHBvcnRQbGFjZWhvbGRlcixcbiAgICBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcixcbiAgICBLRVlDT0RFX0JBQ0sgPSA4LFxuICAgIEtFWUNPREVfVEFCID0gOTtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufVxuXG5pc1N1cHBvcnRQbGFjZWhvbGRlciA9ICdwbGFjZWhvbGRlcicgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSAmJiAhKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpO1xuXG4vKipcbiAqIFBsYWNlaG9sZGVyIENsYXNzXG4gKiBAY2xhc3MgUGxhY2Vob2xkZXJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5QbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxhY2Vob2xkZXIucHJvdG90eXBlICove1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJyYXkgcHVzaGVkIGFsbCA8aW5wdXQ+IGVsZW1lbnRzIGluIHRoZSBjdXJyZW50IHBhZ2VcbiAgICAgICAgICogQHR5cGUgIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSBbXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hlbiBjcmVhdGUgZHluYW1pYyA8aW5wdXQ+IGVsZW1lbnRzIGFuZCB0aGlzIGVsZW1lbnRzIGFwcGVuZCBvbiBwYWdlLCBnZW5lcmF0ZSB0aGUgdmlydHVhbCBwbGFjZWhvbGRlclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gZWxlbWVudHMgLSA8aW5wdXQ+IGVsZW1lbnRzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0dWkuY29tcG9uZW50LnBsYWNlaG9sZGVyLmFkZCgpO1xuICAgICAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuYWRkKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgKiBAYXBpXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGVsZW1lbnRzIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcblxuICAgICAgICBpZiAodGhpcy5faW5wdXRFbGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlUGxhY2Vob2xkZXIoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGVsZW1lbnQncyBzdHlsZSB2YWx1ZSBkZWZpbmVkIGF0IGNzcyBmaWxlXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW0gLSA8aW5wdXQ+IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHZhciBjb21wdXRlZE9iaixcbiAgICAgICAgICAgIHN0eWxlSW5mbztcblxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSwgbnVsbCk7XG5cbiAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJyksXG4gICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmctbGVmdCcpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcHV0ZWRPYmogPSBlbGVtLmN1cnJlbnRTdHlsZTtcblxuICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5mb250U2l6ZSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogY29tcHV0ZWRPYmoucGFkZGluZ0xlZnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3R5bGVJbmZvO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgYnJvd3NlciBpc250J3Qgc3VwcG9ydGVkIHBsYWNlaG9sZGVyIGZlYXR1cmVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZW5lcmF0ZVBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5faW5wdXRFbGVtcywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtLnR5cGU7XG5cbiAgICAgICAgICAgIGlmICgodHlwZSA9PT0gJ3RleHQnIHx8IHR5cGUgPT09ICdwYXNzd29yZCcgfHwgdHlwZSA9PT0gJ2VtYWlsJykgJiZcbiAgICAgICAgICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgbmV3IHZpcnR1YWwgcGxhY2Vob2xkZXIgYWZ0ZXIgYSBzZWxlY3RlZCA8aW5wdXQ+IGVsZW1lbnQgYW5kIHdyYXAgPGlucHV0PiBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGluaXRTdHlsZSA9IHRoaXMuX2dldEluaXRTdHlsZSh0YXJnZXQpLFxuICAgICAgICAgICAgZm9udFNpemUgPSBpbml0U3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGluaXRTdHlsZS5wYWRkaW5nTGVmdCxcbiAgICAgICAgICAgIHdyYXBUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyksXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gdGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIHdyYXBUYWcuaW5uZXJIVE1MID0gdGhpcy5fZ2VuZXJhdGVTcGFuVGFnKHBhZGRpbmdMZWZ0LCBmb250U2l6ZSwgcGxhY2Vob2xkZXIsIGlucHV0VmFsdWUpO1xuICAgICAgICB3cmFwVGFnLmFwcGVuZENoaWxkKHRhcmdldC5jbG9uZU5vZGUoKSk7XG5cbiAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBUYWcsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO2xpbmUtaGVpZ2h0OjE7JztcblxuICAgICAgICB0aGlzLl9iaW5kRXZlbnRUb0N1c3RvbVBsYWNlaG9sZGVyKHdyYXBUYWcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50cyBvbiB0aGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgd3JhcHBlciB0YWcgb2YgdGhlIDxpbnB1dD4gZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5wdXRUYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JylbMF0sXG4gICAgICAgICAgICBzcGFuVGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0sXG4gICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHNwYW5UYWcsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5wdXRUYWcuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgaWYgKCEoa2V5Q29kZSA9PT0gS0VZQ09ERV9CQUNLIHx8IGtleUNvZGUgPT09IEtFWUNPREVfVEFCKSkge1xuICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBhZGRpbmdMZWZ0IC0gQ3VycmVudCA8aW5wdXQ+IGVsZW1lbnQncyBsZWZ0IHBhZGRpbmcgc2l6ZVxuICAgICAqIEBwYXJhbSAge051bWJlcn0gZm9udFNpemUgLSBDdXJyZW50IDxpbnB1dD4gZWxlbWVudCdzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBwbGFjZWhvZGVyVGV4dCAtIEN1cnJlbnQgPGlucHV0PiBlbGVtZW50IHZhbHVlIG9mIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBpbnB1dFZhbHVlIC0gQ3VycmVudCA8aW5wdXQ+IGVsZW1lbnQgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgdmlydHVhbCBwbGFjZWhvZGVyIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dlbmVyYXRlU3BhblRhZzogZnVuY3Rpb24ocGFkZGluZ0xlZnQsIGZvbnRTaXplLCBwbGFjZWhvZGVyVGV4dCwgaW5wdXRWYWx1ZSkge1xuICAgICAgICB2YXIgaHRtbCA9ICc8c3BhbiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6NTAlO3dpZHRoOjkwJTsnO1xuXG4gICAgICAgIGh0bWwgKz0gJ3BhZGRpbmctbGVmdDonICsgcGFkZGluZ0xlZnQgKyAnO21hcmdpbi10b3A6JyArICgtKHBhcnNlRmxvYXQoZm9udFNpemUsIDEwKSAvIDIpIC0gMSkgKyAncHg7JztcbiAgICAgICAgaHRtbCArPSAnb3ZlcmZsb3c6aGlkZGVuO3doaXRlLXNwYWNlOm5vd3JhcDt0ZXh0LW92ZXJmbG93OmVsbGlwc2lzOypkaXNwbGF5OmlubGluZTt6b29tOjE7JztcbiAgICAgICAgaHRtbCArPSAnZGlzcGxheTonICsgKGlucHV0VmFsdWUgIT09ICcnID8gJ25vbmUnIDogJ2lubGluZS1ibG9jaycpICsgJzsnO1xuICAgICAgICBodG1sICs9ICdjb2xvcjojYWFhO2xpbmUtaGVpZ2h0OjEuMjt6LWluZGV4OjA7JztcbiAgICAgICAgaHRtbCArPSAnZm9udC1zaXplOicgKyBmb250U2l6ZSArICc7XCIgVU5TRUxFQ1RBQkxFPVwib25cIj4nICsgcGxhY2Vob2RlclRleHQgKyAnPC9zcGFuPic7XG5cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFBsYWNlaG9sZGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgdXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSAnc3R5bGUnIHRhZyBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBydWxlSW5mbyAtIHNlbGVjdG9yIGFuZCBjc3MgdmFsdWVcbiAgICAgKi9cbiAgICBhZGRDc3NSdWxlOiBmdW5jdGlvbihydWxlSW5mbykge1xuICAgICAgICB2YXIgc3R5bGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgICAgc3R5bGVTaGVldCxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gcnVsZUluZm8uc2VsZWN0b3IsXG4gICAgICAgICAgICBjc3MgPSBydWxlSW5mby5jc3M7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmhlYWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdHlsZVNoZWV0ID0gc3R5bGVUYWcuc2hlZXQgfHwgc3R5bGVUYWcuc3R5bGVTaGVldDtcblxuICAgICAgICBpZiAoc3R5bGVTaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0Lmluc2VydFJ1bGUoc2VsZWN0b3IgKyAneycgKyBjc3MgKyAnfScsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5hZGRSdWxlKHNlbGVjdG9yLCBjc3MsIDApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgdG8gZWxlbWVudFxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUYWcgZm9yIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WydvbicgKyBldmVudFR5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iXX0=
