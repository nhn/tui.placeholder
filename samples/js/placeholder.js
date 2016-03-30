(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
tui.util.defineNamespace('tui.component.placeholder', require('./placeholder'));
tui.component.placeholder.add();

},{"./placeholder":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate custom placehoder on browsers not supported 'placehoder'
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
 * Create placeholder class
 * @class Placeholder
 * @constructor
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed 'input' tags in current page
         * @type  {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * When create dynamic 'input' tag and append on page, generate custom placeholder
     * @param {HTMLElement[]} elements - Selected 'input' tags
     * @example
     * tui.component.Placeholder.add();
     * tui.component.Placeholder.add(document.getElementsByTagName('input'));
     * @api
     */
    add: function(elements) {
        if (!isSupportPlaceholder) {
            this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));

            if (this._inputElems.length) {
                this._generatePlaceholder();
            }
        }
    },

    /**
     * Return style info of imported style
     * @param  {HTMLElement} elem - First 'input' tag
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
                fixedWidth: computedObj.getPropertyValue('width'),
                paddingLeft: computedObj.getPropertyValue('padding-left')
            };
        } else {
            computedObj = elem.currentStyle;

            styleInfo = {
                fontSize: computedObj.fontSize,
                fixedWidth: computedObj.width,
                paddingLeft: computedObj.paddingLeft
            };
        }

        return styleInfo;
    },

    /**
     * Generator virtual placeholders for browser not supported 'placeholder' property
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
     * Attach a new custom placehoder tag after a selected 'input' tag and wrap 'input' tag
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
     * Bind event custom placehoder tag
     * @param  {HTMLElement} target - The 'input' tag's wrapper tag
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
     * Generate custom placeholder tag
     * @param  {Number} paddingLeft - Current 'input' tag's left padding size
     * @param  {Number} fontSize - Current 'input' tag's 'font-size' property value
     * @param  {String} placehoderText - Current 'input' tag's value of placeholder property
     * @param  {String} inputValue - Current 'input' tag's value
     * @returns {String} String of custom placehoder tag
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvcGxhY2Vob2xkZXIuanMiLCJzcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQucGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3BsYWNlaG9sZGVyJykpO1xudHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlci5hZGQoKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2RlciBvbiBicm93c2VycyBub3Qgc3VwcG9ydGVkICdwbGFjZWhvZGVyJ1xuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG4ndXNlIHN0cmljdCc7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXI7XG5cbnZhciBpc1N1cHBvcnRQbGFjZWhvbGRlcixcbiAgICBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcixcbiAgICBLRVlDT0RFX0JBQ0sgPSA4LFxuICAgIEtFWUNPREVfVEFCID0gOTtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufVxuXG5pc1N1cHBvcnRQbGFjZWhvbGRlciA9ICdwbGFjZWhvbGRlcicgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKSAmJiAhKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpO1xuXG4vKipcbiAqIENyZWF0ZSBwbGFjZWhvbGRlciBjbGFzc1xuICogQGNsYXNzIFBsYWNlaG9sZGVyXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuUGxhY2Vob2xkZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsYWNlaG9sZGVyLnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHB1c2hlZCAnaW5wdXQnIHRhZ3MgaW4gY3VycmVudCBwYWdlXG4gICAgICAgICAqIEB0eXBlICB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdoZW4gY3JlYXRlIGR5bmFtaWMgJ2lucHV0JyB0YWcgYW5kIGFwcGVuZCBvbiBwYWdlLCBnZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2xkZXJcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IGVsZW1lbnRzIC0gU2VsZWN0ZWQgJ2lucHV0JyB0YWdzXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0dWkuY29tcG9uZW50LlBsYWNlaG9sZGVyLmFkZCgpO1xuICAgICAqIHR1aS5jb21wb25lbnQuUGxhY2Vob2xkZXIuYWRkKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgKiBAYXBpXG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICBpZiAoIWlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdHVpLnV0aWwudG9BcnJheShlbGVtZW50cyB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pbnB1dEVsZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlUGxhY2Vob2xkZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gc3R5bGUgaW5mbyBvZiBpbXBvcnRlZCBzdHlsZVxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtIC0gRmlyc3QgJ2lucHV0JyB0YWdcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgIHZhciBjb21wdXRlZE9iaixcbiAgICAgICAgICAgIHN0eWxlSW5mbztcblxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWxlbSwgbnVsbCk7XG5cbiAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJyksXG4gICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0JylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IGVsZW0uY3VycmVudFN0eWxlO1xuXG4gICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmZvbnRTaXplLFxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg6IGNvbXB1dGVkT2JqLndpZHRoLFxuICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5wYWRkaW5nTGVmdFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHlsZUluZm87XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRvciB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgYnJvd3NlciBub3Qgc3VwcG9ydGVkICdwbGFjZWhvbGRlcicgcHJvcGVydHlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZW5lcmF0ZVBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5faW5wdXRFbGVtcywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtLnR5cGU7XG5cbiAgICAgICAgICAgIGlmICgodHlwZSA9PT0gJ3RleHQnIHx8IHR5cGUgPT09ICdwYXNzd29yZCcgfHwgdHlwZSA9PT0gJ2VtYWlsJykgJiZcbiAgICAgICAgICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgbmV3IGN1c3RvbSBwbGFjZWhvZGVyIHRhZyBhZnRlciBhIHNlbGVjdGVkICdpbnB1dCcgdGFnIGFuZCB3cmFwICdpbnB1dCcgdGFnXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGluaXRTdHlsZSA9IHRoaXMuX2dldEluaXRTdHlsZSh0YXJnZXQpLFxuICAgICAgICAgICAgZm9udFNpemUgPSBpbml0U3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGluaXRTdHlsZS5wYWRkaW5nTGVmdCxcbiAgICAgICAgICAgIHdyYXBUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyksXG4gICAgICAgICAgICBpbnB1dFZhbHVlID0gdGFyZ2V0LnZhbHVlO1xuXG4gICAgICAgIHdyYXBUYWcuaW5uZXJIVE1MID0gdGhpcy5fZ2VuZXJhdGVTcGFuVGFnKHBhZGRpbmdMZWZ0LCBmb250U2l6ZSwgcGxhY2Vob2xkZXIsIGlucHV0VmFsdWUpO1xuICAgICAgICB3cmFwVGFnLmFwcGVuZENoaWxkKHRhcmdldC5jbG9uZU5vZGUoKSk7XG5cbiAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBUYWcsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOnJlbGF0aXZlO2xpbmUtaGVpZ2h0OjE7JztcblxuICAgICAgICB0aGlzLl9iaW5kRXZlbnRUb0N1c3RvbVBsYWNlaG9sZGVyKHdyYXBUYWcpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IGN1c3RvbSBwbGFjZWhvZGVyIHRhZ1xuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWcncyB3cmFwcGVyIHRhZ1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5wdXRUYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JylbMF0sXG4gICAgICAgICAgICBzcGFuVGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0sXG4gICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHNwYW5UYWcsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaW5wdXRUYWcuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgaWYgKCEoa2V5Q29kZSA9PT0gS0VZQ09ERV9CQUNLIHx8IGtleUNvZGUgPT09IEtFWUNPREVfVEFCKSkge1xuICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGN1c3RvbSBwbGFjZWhvbGRlciB0YWdcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBhZGRpbmdMZWZ0IC0gQ3VycmVudCAnaW5wdXQnIHRhZydzIGxlZnQgcGFkZGluZyBzaXplXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIEN1cnJlbnQgJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gcGxhY2Vob2RlclRleHQgLSBDdXJyZW50ICdpbnB1dCcgdGFnJ3MgdmFsdWUgb2YgcGxhY2Vob2xkZXIgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlucHV0VmFsdWUgLSBDdXJyZW50ICdpbnB1dCcgdGFnJ3MgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihwYWRkaW5nTGVmdCwgZm9udFNpemUsIHBsYWNlaG9kZXJUZXh0LCBpbnB1dFZhbHVlKSB7XG4gICAgICAgIHZhciBodG1sID0gJzxzcGFuIHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7d2lkdGg6OTAlOyc7XG5cbiAgICAgICAgaHRtbCArPSAncGFkZGluZy1sZWZ0OicgKyBwYWRkaW5nTGVmdCArICc7bWFyZ2luLXRvcDonICsgKC0ocGFyc2VGbG9hdChmb250U2l6ZSwgMTApIC8gMikgLSAxKSArICdweDsnO1xuICAgICAgICBodG1sICs9ICdvdmVyZmxvdzpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7KmRpc3BsYXk6aW5saW5lO3pvb206MTsnO1xuICAgICAgICBodG1sICs9ICdkaXNwbGF5OicgKyAoaW5wdXRWYWx1ZSAhPT0gJycgPyAnbm9uZScgOiAnaW5saW5lLWJsb2NrJykgKyAnOyc7XG4gICAgICAgIGh0bWwgKz0gJ2NvbG9yOiNhYWE7bGluZS1oZWlnaHQ6MS4yO3otaW5kZXg6MDsnO1xuICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJztcIiBVTlNFTEVDVEFCTEU9XCJvblwiPicgKyBwbGFjZWhvZGVyVGV4dCArICc8L3NwYW4+JztcblxuICAgICAgICByZXR1cm4gaHRtbDtcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUGxhY2Vob2xkZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlICdzdHlsZScgdGFnIGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJ1bGVJbmZvIC0gc2VsZWN0b3IgYW5kIGNzcyB2YWx1ZVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRhZyBmb3IgYmluZGluZ1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
