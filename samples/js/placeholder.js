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
             wrapperStyle = 'position:relative;display:inline-block;width:100%;line-height:1;*display:inline;zoom:1;';

         wrapTag.innerHTML = this._generateSpanTag(paddingLeft, fontSize, placeholder);
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
      * @param  {String} placehoderText - Current 'input' tag's value
      * @returns {String} String of custom placehoder tag
      * @private
      */
      _generateSpanTag: function(paddingLeft, fontSize, placehoderText) {
         var html = '<span style="position:absolute;left:0;top:50%;width:90%;';

         html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';
         html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;display:inilne-block;*display:inline;zoom:1;';
         html += 'color:#aaa;line-height:1.1;z-index:0;';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQuUGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlcicpKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBHZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2RlciBvbiBicm93c2VycyBub3Qgc3VwcG9ydGVkICdwbGFjZWhvZGVyJ1xuICogQGF1dGhvciBOSE4gRW50LiBGRSBkZXYgdGVhbS48ZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxudmFyIFBsYWNlaG9sZGVyLFxuICAgIGlzU3VwcG9ydFBsYWNlaG9sZGVyLFxuICAgIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyLFxuICAgIGhhc0NvbXB1dGVkU3R5bGVGdW5jID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUgPyB0cnVlIDogZmFsc2UsXG4gICAgS0VZQ09ERV9CQUNLID0gOCxcbiAgICBLRVlDT0RFX1RBQiA9IDk7XG5cbmlmIChicm93c2VyLm1zaWUgJiYgKGJyb3dzZXIudmVyc2lvbiA+IDkgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnOi1tcy1pbnB1dC1wbGFjZWhvbGRlcicsXG4gICAgICAgIGNzczogJ2NvbG9yOiNmZmYgIWltcG9ydGFudDt0ZXh0LWluZGVudDotOTk5OXB4OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBDcmVhdGUgcGxhY2Vob2xkZXIgY2xhc3NcbiAqIEBjbGFzcyBQbGFjZWhvbGRlclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbiBQbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgUGxhY2Vob2xkZXIucHJvdG90eXBlICove1xuICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgIC8qKlxuICAgICAgICAgICogQXJyYXkgcHVzaGVkICdpbnB1dCcgdGFncyBpbiBjdXJyZW50IHBhZ2VcbiAgICAgICAgICAqIEB0eXBlICB7QXJyYXl9XG4gICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICovXG4gICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG5cbiAgICAgICAgIHRoaXMuYWRkKCk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFdoZW4gY3JlYXRlIGR5bmFtaWMgJ2lucHV0JyB0YWcgYW5kIGFwcGVuZCBvbiBwYWdlLCBnZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2xkZXJcbiAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudFtdfSBlbGVtZW50cyAtIFNlbGVjdGVkICdpbnB1dCcgdGFnc1xuICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gSWYgYSBicm93c2VyIHN1cHBvcnQgJ3BsYWNlaG9sZGVyJyBwcm9wZXJ0eSBhbmQgaGFzIGFueSBjb25kaXRpb24sIHJldHVybnNcbiAgICAgICogQGV4YW1wbGVcbiAgICAgICogdHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlci5hZGQoKTtcbiAgICAgICogdHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlci5hZGQoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JykpO1xuICAgICAgKiBAYXBpXG4gICAgICAqL1xuICAgICBhZGQ6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmIChlbGVtZW50cykge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0aGlzLl9pbnB1dEVsZW1zLmNvbmNhdCh0dWkudXRpbC50b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHRoaXMuX2lucHV0RWxlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVQbGFjZWhvbGRlcih0aGlzLl9pbnB1dEVsZW1zKTtcbiAgICAgICAgIH1cbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogUmV0dXJuIHN0eWxlIGluZm8gb2YgaW1wb3J0ZWQgc3R5bGVcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW0gLSBGaXJzdCAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICB2YXIgY29tcHV0ZWRPYmosXG4gICAgICAgICAgICAgc3R5bGVJbmZvO1xuXG4gICAgICAgICBpZiAoaGFzQ29tcHV0ZWRTdHlsZUZ1bmMpIHtcbiAgICAgICAgICAgICBjb21wdXRlZE9iaiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0sIG51bGwpO1xuXG4gICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJyksXG4gICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJyksXG4gICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKVxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gZWxlbS5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5mb250U2l6ZSxcbiAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmoud2lkdGgsXG4gICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBjb21wdXRlZE9iai5wYWRkaW5nTGVmdFxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9XG5cbiAgICAgICAgIHJldHVybiBzdHlsZUluZm87XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdlbmVyYXRvciB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgYnJvd3NlciBub3Qgc3VwcG9ydGVkICdwbGFjZWhvbGRlcicgcHJvcGVydHlcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9pbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtLnR5cGU7XG5cbiAgICAgICAgICAgICBpZiAoKHR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlID09PSAncGFzc3dvcmQnIHx8IHR5cGUgPT09ICdlbWFpbCcpICYmXG4gICAgICAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBBdHRhY2ggYSBuZXcgY3VzdG9tIHBsYWNlaG9kZXIgdGFnIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyB0YWcgYW5kIHdyYXAgJ2lucHV0JyB0YWdcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgIHZhciBpbml0U3R5bGUgPSB0aGlzLl9nZXRJbml0U3R5bGUodGFyZ2V0KSxcbiAgICAgICAgICAgICBmb250U2l6ZSA9IGluaXRTdHlsZS5mb250U2l6ZSxcbiAgICAgICAgICAgICBwYWRkaW5nTGVmdCA9IGluaXRTdHlsZS5wYWRkaW5nTGVmdCxcbiAgICAgICAgICAgICB3cmFwVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLFxuICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgICB3cmFwcGVyU3R5bGUgPSAncG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtYmxvY2s7d2lkdGg6MTAwJTtsaW5lLWhlaWdodDoxOypkaXNwbGF5OmlubGluZTt6b29tOjE7JztcblxuICAgICAgICAgd3JhcFRhZy5pbm5lckhUTUwgPSB0aGlzLl9nZW5lcmF0ZVNwYW5UYWcocGFkZGluZ0xlZnQsIGZvbnRTaXplLCBwbGFjZWhvbGRlcik7XG4gICAgICAgICB3cmFwVGFnLmFwcGVuZENoaWxkKHRhcmdldC5jbG9uZU5vZGUoKSk7XG5cbiAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwVGFnLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KTtcblxuICAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gd3JhcHBlclN0eWxlO1xuXG4gICAgICAgICB0aGlzLl9iaW5kRXZlbnRUb0N1c3RvbVBsYWNlaG9sZGVyKHdyYXBUYWcpO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBCaW5kIGV2ZW50IGN1c3RvbSBwbGFjZWhvZGVyIHRhZ1xuICAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgdGFnJ3Mgd3JhcHBlciB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9iaW5kRXZlbnRUb0N1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgIHZhciBpbnB1dFRhZyA9IHRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKVswXSxcbiAgICAgICAgICAgICBzcGFuVGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzcGFuJylbMF0sXG4gICAgICAgICAgICAgc3BhblN0eWxlID0gc3BhblRhZy5zdHlsZTtcblxuICAgICAgICAgdXRpbC5iaW5kRXZlbnQoc3BhblRhZywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIGlucHV0VGFnLmZvY3VzKCk7XG4gICAgICAgICB9KTtcblxuICAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgICBpZiAoIShrZXlDb2RlID09PSBLRVlDT0RFX0JBQ0sgfHwga2V5Q29kZSA9PT0gS0VZQ09ERV9UQUIpKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgaWYgKGlucHV0VGFnLnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZW5lcmF0ZSBjdXN0b20gcGxhY2Vob2xkZXIgdGFnXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gcGFkZGluZ0xlZnQgLSBDdXJyZW50ICdpbnB1dCcgdGFnJ3MgbGVmdCBwYWRkaW5nIHNpemVcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIEN1cnJlbnQgJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBsYWNlaG9kZXJUZXh0IC0gQ3VycmVudCAnaW5wdXQnIHRhZydzIHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiBjdXN0b20gcGxhY2Vob2RlciB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihwYWRkaW5nTGVmdCwgZm9udFNpemUsIHBsYWNlaG9kZXJUZXh0KSB7XG4gICAgICAgICB2YXIgaHRtbCA9ICc8c3BhbiBzdHlsZT1cInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6NTAlO3dpZHRoOjkwJTsnO1xuXG4gICAgICAgICBodG1sICs9ICdwYWRkaW5nLWxlZnQ6JyArIHBhZGRpbmdMZWZ0ICsgJzttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyKSAtIDEpICsgJ3B4Oyc7XG4gICAgICAgICBodG1sICs9ICdvdmVyZmxvdzpoaWRkZW47d2hpdGUtc3BhY2U6bm93cmFwO3RleHQtb3ZlcmZsb3c6ZWxsaXBzaXM7ZGlzcGxheTppbmlsbmUtYmxvY2s7KmRpc3BsYXk6aW5saW5lO3pvb206MTsnO1xuICAgICAgICAgaHRtbCArPSAnY29sb3I6I2FhYTtsaW5lLWhlaWdodDoxLjE7ei1pbmRleDowOyc7XG4gICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJ1wiIFVOU0VMRUNUQUJMRT1cIm9uXCI+JyArIHBsYWNlaG9kZXJUZXh0ICsgJzwvc3Bhbj4nO1xuXG4gICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFBsYWNlaG9sZGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlICdzdHlsZScgdGFnIGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJ1bGVJbmZvIC0gc2VsZWN0b3IgYW5kIGNzcyB2YWx1ZVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRhZyBmb3IgYmluZGluZ1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
