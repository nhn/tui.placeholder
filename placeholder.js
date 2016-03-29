(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Placeholder', require('./src/placeholder'));

},{"./src/placeholder":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate custom placehoder on browsers not supported 'placehoder'
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */

'use strict';

var util = require('./util.js');

var Placeholder,
    isSupportPlaceholder,
    browser = tui.util.browser,
    hasComputedStyleFunc = window.getComputedStyle ? true : false,
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

         this.add();
     },

     /**
      * When create dynamic 'input' tag and append on page, generate custom placeholder
      * @param {HTMLElement[]} elements - Selected 'input' tags
      * @returns {Boolean} If a browser support 'placeholder' property and has any condition, returns
      * @example
      * tui.component.Placeholder.add();
      * tui.component.Placeholder.add(document.getElementsByTagName('input'));
      * @api
      */
     add: function(elements) {
         if (isSupportPlaceholder) {
             return false;
         }

         if (elements) {
             this._inputElems = this._inputElems.concat(tui.util.toArray(elements));
         } else {
             this._inputElems = tui.util.toArray(document.getElementsByTagName('input'));
         }

         if (this._inputElems.length) {
             this._generatePlaceholder(this._inputElems);
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

         if (hasComputedStyleFunc) {
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
             inputValue = target.value,
             wrapperStyle = 'position:relative;line-height:1;';

         wrapTag.innerHTML = this._generateSpanTag(paddingLeft, fontSize, placeholder, inputValue);
         wrapTag.appendChild(target.cloneNode());
         
         target.parentNode.insertBefore(wrapTag, target.nextSibling);
         target.parentNode.removeChild(target);

         wrapTag.style.cssText = wrapperStyle;

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

         util.bindEvent(spanTag, 'click', function(e) {
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
        html += 'font-size:' + fontSize + '" UNSELECTABLE="on">' + placehoderText + '</span>';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuUGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlcicpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2RlciBvbiBicm93c2VycyBub3Qgc3VwcG9ydGVkICdwbGFjZWhvZGVyJ1xuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxudmFyIFBsYWNlaG9sZGVyLFxuICAgIGlzU3VwcG9ydFBsYWNlaG9sZGVyLFxuICAgIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyLFxuICAgIGhhc0NvbXB1dGVkU3R5bGVGdW5jID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUgPyB0cnVlIDogZmFsc2UsXG4gICAgS0VZQ09ERV9CQUNLID0gOCxcbiAgICBLRVlDT0RFX1RBQiA9IDk7XG5cbmlmIChicm93c2VyLm1zaWUgJiYgKGJyb3dzZXIudmVyc2lvbiA+IDkgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnOi1tcy1pbnB1dC1wbGFjZWhvbGRlcicsXG4gICAgICAgIGNzczogJ2NvbG9yOiNmZmYgIWltcG9ydGFudDt0ZXh0LWluZGVudDotOTk5OXB4OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBDcmVhdGUgcGxhY2Vob2xkZXIgY2xhc3NcbiAqIEBjbGFzcyBQbGFjZWhvbGRlclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbiBQbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxhY2Vob2xkZXIucHJvdG90eXBlICove1xuICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgIC8qKlxuICAgICAgICAgICogQXJyYXkgcHVzaGVkICdpbnB1dCcgdGFncyBpbiBjdXJyZW50IHBhZ2VcbiAgICAgICAgICAqIEB0eXBlICB7QXJyYXl9XG4gICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICovXG4gICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG5cbiAgICAgICAgIHRoaXMuYWRkKCk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFdoZW4gY3JlYXRlIGR5bmFtaWMgJ2lucHV0JyB0YWcgYW5kIGFwcGVuZCBvbiBwYWdlLCBnZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2xkZXJcbiAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudFtdfSBlbGVtZW50cyAtIFNlbGVjdGVkICdpbnB1dCcgdGFnc1xuICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gSWYgYSBicm93c2VyIHN1cHBvcnQgJ3BsYWNlaG9sZGVyJyBwcm9wZXJ0eSBhbmQgaGFzIGFueSBjb25kaXRpb24sIHJldHVybnNcbiAgICAgICogQGV4YW1wbGVcbiAgICAgICogdHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlci5hZGQoKTtcbiAgICAgICogdHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlci5hZGQoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JykpO1xuICAgICAgKiBAYXBpXG4gICAgICAqL1xuICAgICBhZGQ6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmIChlbGVtZW50cykge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0aGlzLl9pbnB1dEVsZW1zLmNvbmNhdCh0dWkudXRpbC50b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHRoaXMuX2lucHV0RWxlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVQbGFjZWhvbGRlcih0aGlzLl9pbnB1dEVsZW1zKTtcbiAgICAgICAgIH1cbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogUmV0dXJuIHN0eWxlIGluZm8gb2YgaW1wb3J0ZWQgc3R5bGVcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW0gLSBGaXJzdCAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICB2YXIgY29tcHV0ZWRPYmosXG4gICAgICAgICAgICAgc3R5bGVJbmZvO1xuXG4gICAgICAgICBpZiAoaGFzQ29tcHV0ZWRTdHlsZUZ1bmMpIHtcbiAgICAgICAgICAgICBjb21wdXRlZE9iaiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0sIG51bGwpO1xuXG4gICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJyksXG4gICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJyksXG4gICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKVxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gZWxlbS5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5mb250U2l6ZSxcbiAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmoud2lkdGgsXG4gICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5wYWRkaW5nTGVmdFxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9XG5cbiAgICAgICAgIHJldHVybiBzdHlsZUluZm87XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdlbmVyYXRvciB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgYnJvd3NlciBub3Qgc3VwcG9ydGVkICdwbGFjZWhvbGRlcicgcHJvcGVydHlcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9pbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtLnR5cGU7XG5cbiAgICAgICAgICAgICBpZiAoKHR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlID09PSAncGFzc3dvcmQnIHx8IHR5cGUgPT09ICdlbWFpbCcpICYmXG4gICAgICAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBBdHRhY2ggYSBuZXcgY3VzdG9tIHBsYWNlaG9kZXIgdGFnIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyB0YWcgYW5kIHdyYXAgJ2lucHV0JyB0YWdcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgIHZhciBpbml0U3R5bGUgPSB0aGlzLl9nZXRJbml0U3R5bGUodGFyZ2V0KSxcbiAgICAgICAgICAgICBmb250U2l6ZSA9IGluaXRTdHlsZS5mb250U2l6ZSxcbiAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGluaXRTdHlsZS5wYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICB3cmFwVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLFxuICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgICBpbnB1dFZhbHVlID0gdGFyZ2V0LnZhbHVlLFxuICAgICAgICAgICAgIHdyYXBwZXJTdHlsZSA9ICdwb3NpdGlvbjpyZWxhdGl2ZTtsaW5lLWhlaWdodDoxOyc7XG5cbiAgICAgICAgIHdyYXBUYWcuaW5uZXJIVE1MID0gdGhpcy5fZ2VuZXJhdGVTcGFuVGFnKHBhZGRpbmdMZWZ0LCBmb250U2l6ZSwgcGxhY2Vob2xkZXIsIGlucHV0VmFsdWUpO1xuICAgICAgICAgd3JhcFRhZy5hcHBlbmRDaGlsZCh0YXJnZXQuY2xvbmVOb2RlKCkpO1xuICAgICAgICAgXG4gICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcFRhZywgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgIHdyYXBUYWcuc3R5bGUuY3NzVGV4dCA9IHdyYXBwZXJTdHlsZTtcblxuICAgICAgICAgdGhpcy5fYmluZEV2ZW50VG9DdXN0b21QbGFjZWhvbGRlcih3cmFwVGFnKTtcbiAgICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEJpbmQgZXZlbnQgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWcncyB3cmFwcGVyIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgdmFyIGlucHV0VGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdLFxuICAgICAgICAgICAgIHNwYW5UYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChzcGFuVGFnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgaW5wdXRUYWcuZm9jdXMoKTtcbiAgICAgICAgIH0pO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IEtFWUNPREVfQkFDSyB8fCBrZXlDb2RlID09PSBLRVlDT0RFX1RBQikpIHtcbiAgICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG5cbiAgICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdlbmVyYXRlIGN1c3RvbSBwbGFjZWhvbGRlciB0YWdcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBwYWRkaW5nTGVmdCAtIEN1cnJlbnQgJ2lucHV0JyB0YWcncyBsZWZ0IHBhZGRpbmcgc2l6ZVxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZvbnRTaXplIC0gQ3VycmVudCAnaW5wdXQnIHRhZydzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICAqIEBwYXJhbSAge1N0cmluZ30gcGxhY2Vob2RlclRleHQgLSBDdXJyZW50ICdpbnB1dCcgdGFnJ3MgdmFsdWUgb2YgcGxhY2Vob2xkZXIgcHJvcGVydHlcbiAgICAgICogQHBhcmFtICB7U3RyaW5nfSBpbnB1dFZhbHVlIC0gQ3VycmVudCAnaW5wdXQnIHRhZydzIHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiBjdXN0b20gcGxhY2Vob2RlciB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVNwYW5UYWc6IGZ1bmN0aW9uKHBhZGRpbmdMZWZ0LCBmb250U2l6ZSwgcGxhY2Vob2RlclRleHQsIGlucHV0VmFsdWUpIHtcbiAgICAgICAgdmFyIGh0bWwgPSAnPHNwYW4gc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt3aWR0aDo5MCU7JztcblxuICAgICAgICBodG1sICs9ICdwYWRkaW5nLWxlZnQ6JyArIHBhZGRpbmdMZWZ0ICsgJzttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyKSAtIDEpICsgJ3B4Oyc7XG4gICAgICAgIGh0bWwgKz0gJ292ZXJmbG93OmhpZGRlbjt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpczsqZGlzcGxheTppbmxpbmU7em9vbToxOyc7XG4gICAgICAgIGh0bWwgKz0gJ2Rpc3BsYXk6JyArIChpbnB1dFZhbHVlICE9PSAnJyA/ICdub25lJyA6ICdpbmxpbmUtYmxvY2snKSArICc7JztcbiAgICAgICAgaHRtbCArPSAnY29sb3I6I2FhYTtsaW5lLWhlaWdodDoxLjI7ei1pbmRleDowOyc7XG4gICAgICAgIGh0bWwgKz0gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnXCIgVU5TRUxFQ1RBQkxFPVwib25cIj4nICsgcGxhY2Vob2RlclRleHQgKyAnPC9zcGFuPic7XG5cbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBQbGFjZWhvbGRlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSAnc3R5bGUnIHRhZyBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBydWxlSW5mbyAtIHNlbGVjdG9yIGFuZCBjc3MgdmFsdWVcbiAgICAgKi9cbiAgICBhZGRDc3NSdWxlOiBmdW5jdGlvbihydWxlSW5mbykge1xuICAgICAgICB2YXIgc3R5bGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgICAgc3R5bGVTaGVldCxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gcnVsZUluZm8uc2VsZWN0b3IsXG4gICAgICAgICAgICBjc3MgPSBydWxlSW5mby5jc3M7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmhlYWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdHlsZVNoZWV0ID0gc3R5bGVUYWcuc2hlZXQgfHwgc3R5bGVUYWcuc3R5bGVTaGVldDtcblxuICAgICAgICBpZiAoc3R5bGVTaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0Lmluc2VydFJ1bGUoc2VsZWN0b3IgKyAneycgKyBjc3MgKyAnfScsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5hZGRSdWxlKHNlbGVjdG9yLCBjc3MsIDApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgdG8gZWxlbWVudFxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUYWcgZm9yIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WydvbicgKyBldmVudFR5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iXX0=
