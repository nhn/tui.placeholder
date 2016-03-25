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
                 fixedHeight: computedObj.getPropertyValue('line-height'),
                 fixedWidth: computedObj.getPropertyValue('width')
             };
         } else {
             computedObj = elem.currentStyle;
             styleInfo = {
                 fontSize: computedObj.fontSize,
                 fixedHeight: computedObj.lineHeight,
                 fixedWidth: computedObj.width
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
             fixedHeight = initStyle.fixedHeight,
             wrapTag = document.createElement('span'),
             placeholder = target.getAttribute('placeholder');

         target.style.cssText = this._getInputStyle(fontSize, fixedHeight);

         wrapTag.innerHTML = this._generateSpanTag(fontSize, placeholder);
         wrapTag.appendChild(target.cloneNode());

         target.parentNode.insertBefore(wrapTag, target.nextSibling);
         target.parentNode.removeChild(target);

         wrapTag.style.cssText = this._getWrapperStyle(initStyle.fixedWidth);

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

         util.bindEvent(spanTag, 'mousedown', function(e) {
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
      * Get style of 'input' tag's parent tag
      * @param  {Number} fixedWidth - The 'input' tag's 'width' property value
      * @returns {String} String of custom placehoder wrapper tag's style
      * @private
      */
     _getWrapperStyle: function(fixedWidth) {
         return 'position:relative;display:inline-block;*display:inline;zoom:1;width:' + fixedWidth + ';';
     },

     /**
      * Get style of 'input' tag
      * @param  {Number} fontSize - The 'input' tag's 'font-size' property value
      * @param  {Number} fixedHeight - The 'input' tag's 'line-height' property value
      * @returns {String} String of 'input' tag's style
      * @private
      */
     _getInputStyle: function(fontSize, fixedHeight) {
         return 'font-size:' + fontSize + ';height:' + fixedHeight + ';line-height:' + fixedHeight + ';';
     },

     /**
      * [function description]
      * @param  {Number} fontSize - Current ''input' tag's 'font-size' property value
      * @param  {String} placehoderText - Current 'input' tag's value
      * @returns {String} String of custom placehoder tag
      * @private
      */
     _generateSpanTag: function(fontSize, placehoderText) {
         var html = '<span style="position:absolute;left:0;top:50%;color:#aaa;';

         html += 'display:inline-block;margin-top:' + (-(parseFloat(fontSize, 10) / 2 + 1)) + 'px;';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlBsYWNlaG9sZGVyJywgcmVxdWlyZSgnLi9zcmMvcGxhY2Vob2xkZXInKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR2VuZXJhdGUgY3VzdG9tIHBsYWNlaG9kZXIgb24gYnJvd3NlcnMgbm90IHN1cHBvcnRlZCAncGxhY2Vob2RlcidcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbnZhciBQbGFjZWhvbGRlcixcbiAgICBpc1N1cHBvcnRQbGFjZWhvbGRlcixcbiAgICBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcixcbiAgICBoYXNDb21wdXRlZFN0eWxlRnVuYyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIEtFWUNPREVfQkFDSyA9IDgsXG4gICAgS0VZQ09ERV9UQUIgPSA5O1xuXG5pZiAoYnJvd3Nlci5tc2llICYmIChicm93c2VyLnZlcnNpb24gPiA5ICYmIGJyb3dzZXIudmVyc2lvbiA8PSAxMSkpIHtcbiAgICB1dGlsLmFkZENzc1J1bGUoe1xuICAgICAgICBzZWxlY3RvcjogJzotbXMtaW5wdXQtcGxhY2Vob2xkZXInLFxuICAgICAgICBjc3M6ICdjb2xvcjojZmZmICFpbXBvcnRhbnQ7dGV4dC1pbmRlbnQ6LTk5OTlweDsnXG4gICAgfSk7XG59XG5cbmlzU3VwcG9ydFBsYWNlaG9sZGVyID0gJ3BsYWNlaG9sZGVyJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpICYmICEoYnJvd3Nlci5tc2llICYmIGJyb3dzZXIudmVyc2lvbiA8PSAxMSk7XG5cbi8qKlxuICogQ3JlYXRlIHBsYWNlaG9sZGVyIGNsYXNzXG4gKiBAY2xhc3MgUGxhY2Vob2xkZXJcbiAqIEBjb25zdHJ1Y3RvclxuICovXG4gUGxhY2Vob2xkZXIgPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKiogQGxlbmRzIFBsYWNlaG9sZGVyLnByb3RvdHlwZSAqL3tcbiAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAvKipcbiAgICAgICAgICAqIEFycmF5IHB1c2hlZCAnaW5wdXQnIHRhZ3MgaW4gY3VycmVudCBwYWdlXG4gICAgICAgICAgKiBAdHlwZSAge0FycmF5fVxuICAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICAqL1xuICAgICAgICAgdGhpcy5faW5wdXRFbGVtcyA9IFtdO1xuXG4gICAgICAgICB0aGlzLmFkZCgpO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBXaGVuIGNyZWF0ZSBkeW5hbWljICdpbnB1dCcgdGFnIGFuZCBhcHBlbmQgb24gcGFnZSwgZ2VuZXJhdGUgY3VzdG9tIHBsYWNlaG9sZGVyXG4gICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gZWxlbWVudHMgLSBTZWxlY3RlZCAnaW5wdXQnIHRhZ3NcbiAgICAgICogQHJldHVybnMge0Jvb2xlYW59IElmIGEgYnJvd3NlciBzdXBwb3J0ICdwbGFjZWhvbGRlcicgcHJvcGVydHkgYW5kIGhhcyBhbnkgY29uZGl0aW9uLCByZXR1cm5zXG4gICAgICAqIEBleGFtcGxlXG4gICAgICAqIHR1aS5jb21wb25lbnQuUGxhY2Vob2xkZXIuYWRkKCk7XG4gICAgICAqIHR1aS5jb21wb25lbnQuUGxhY2Vob2xkZXIuYWRkKGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgICogQGFwaVxuICAgICAgKi9cbiAgICAgYWRkOiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgfVxuXG4gICAgICAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdGhpcy5faW5wdXRFbGVtcy5jb25jYXQodHVpLnV0aWwudG9BcnJheShlbGVtZW50cykpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdHVpLnV0aWwudG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmICh0aGlzLl9pbnB1dEVsZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlUGxhY2Vob2xkZXIodGhpcy5faW5wdXRFbGVtcyk7XG4gICAgICAgICB9XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFJldHVybiBzdHlsZSBpbmZvIG9mIGltcG9ydGVkIHN0eWxlXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtIC0gRmlyc3QgJ2lucHV0JyB0YWdcbiAgICAgICogQHJldHVybnMge09iamVjdH0gU3R5bGUgaW5mb1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldEluaXRTdHlsZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgdmFyIGNvbXB1dGVkT2JqLFxuICAgICAgICAgICAgIHN0eWxlSW5mbztcblxuICAgICAgICAgaWYgKGhhc0NvbXB1dGVkU3R5bGVGdW5jKSB7XG4gICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKTtcbiAgICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKSxcbiAgICAgICAgICAgICAgICAgZml4ZWRIZWlnaHQ6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ2xpbmUtaGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJylcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICBjb21wdXRlZE9iaiA9IGVsZW0uY3VycmVudFN0eWxlO1xuICAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmZvbnRTaXplLFxuICAgICAgICAgICAgICAgICBmaXhlZEhlaWdodDogY29tcHV0ZWRPYmoubGluZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmoud2lkdGhcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgfVxuXG4gICAgICAgICByZXR1cm4gc3R5bGVJbmZvO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZW5lcmF0b3IgdmlydHVhbCBwbGFjZWhvbGRlcnMgZm9yIGJyb3dzZXIgbm90IHN1cHBvcnRlZCAncGxhY2Vob2xkZXInIHByb3BlcnR5XG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2VuZXJhdGVQbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5faW5wdXRFbGVtcywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbS50eXBlO1xuXG4gICAgICAgICAgICAgaWYgKCh0eXBlID09PSAndGV4dCcgfHwgdHlwZSA9PT0gJ3Bhc3N3b3JkJyB8fCB0eXBlID09PSAnZW1haWwnKSAmJlxuICAgICAgICAgICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgICBzZWxmLl9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcihlbGVtKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9KTtcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogQXR0YWNoIGEgbmV3IGN1c3RvbSBwbGFjZWhvZGVyIHRhZyBhZnRlciBhIHNlbGVjdGVkICdpbnB1dCcgdGFnIGFuZCB3cmFwICdpbnB1dCcgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICB2YXIgaW5pdFN0eWxlID0gdGhpcy5fZ2V0SW5pdFN0eWxlKHRhcmdldCksXG4gICAgICAgICAgICAgZm9udFNpemUgPSBpbml0U3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICAgZml4ZWRIZWlnaHQgPSBpbml0U3R5bGUuZml4ZWRIZWlnaHQsXG4gICAgICAgICAgICAgd3JhcFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSxcbiAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG5cbiAgICAgICAgIHRhcmdldC5zdHlsZS5jc3NUZXh0ID0gdGhpcy5fZ2V0SW5wdXRTdHlsZShmb250U2l6ZSwgZml4ZWRIZWlnaHQpO1xuXG4gICAgICAgICB3cmFwVGFnLmlubmVySFRNTCA9IHRoaXMuX2dlbmVyYXRlU3BhblRhZyhmb250U2l6ZSwgcGxhY2Vob2xkZXIpO1xuICAgICAgICAgd3JhcFRhZy5hcHBlbmRDaGlsZCh0YXJnZXQuY2xvbmVOb2RlKCkpO1xuXG4gICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcFRhZywgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgIHdyYXBUYWcuc3R5bGUuY3NzVGV4dCA9IHRoaXMuX2dldFdyYXBwZXJTdHlsZShpbml0U3R5bGUuZml4ZWRXaWR0aCk7XG5cbiAgICAgICAgIHRoaXMuX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXIod3JhcFRhZyk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEJpbmQgZXZlbnQgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWcncyB3cmFwcGVyIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgdmFyIGlucHV0VGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdLFxuICAgICAgICAgICAgIHNwYW5UYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChzcGFuVGFnLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIGlucHV0VGFnLmZvY3VzKCk7XG4gICAgICAgICB9KTtcblxuICAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgICBpZiAoIShrZXlDb2RlID09PSBLRVlDT0RFX0JBQ0sgfHwga2V5Q29kZSA9PT0gS0VZQ09ERV9UQUIpKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgaWYgKGlucHV0VGFnLnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZXQgc3R5bGUgb2YgJ2lucHV0JyB0YWcncyBwYXJlbnQgdGFnXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZml4ZWRXaWR0aCAtIFRoZSAnaW5wdXQnIHRhZydzICd3aWR0aCcgcHJvcGVydHkgdmFsdWVcbiAgICAgICogQHJldHVybnMge1N0cmluZ30gU3RyaW5nIG9mIGN1c3RvbSBwbGFjZWhvZGVyIHdyYXBwZXIgdGFnJ3Mgc3R5bGVcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZXRXcmFwcGVyU3R5bGU6IGZ1bmN0aW9uKGZpeGVkV2lkdGgpIHtcbiAgICAgICAgIHJldHVybiAncG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtYmxvY2s7KmRpc3BsYXk6aW5saW5lO3pvb206MTt3aWR0aDonICsgZml4ZWRXaWR0aCArICc7JztcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogR2V0IHN0eWxlIG9mICdpbnB1dCcgdGFnXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZm9udFNpemUgLSBUaGUgJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZpeGVkSGVpZ2h0IC0gVGhlICdpbnB1dCcgdGFnJ3MgJ2xpbmUtaGVpZ2h0JyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgJ2lucHV0JyB0YWcncyBzdHlsZVxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldElucHV0U3R5bGU6IGZ1bmN0aW9uKGZvbnRTaXplLCBmaXhlZEhlaWdodCkge1xuICAgICAgICAgcmV0dXJuICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJztoZWlnaHQ6JyArIGZpeGVkSGVpZ2h0ICsgJztsaW5lLWhlaWdodDonICsgZml4ZWRIZWlnaHQgKyAnOyc7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFtmdW5jdGlvbiBkZXNjcmlwdGlvbl1cbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIEN1cnJlbnQgJydpbnB1dCcgdGFnJ3MgJ2ZvbnQtc2l6ZScgcHJvcGVydHkgdmFsdWVcbiAgICAgICogQHBhcmFtICB7U3RyaW5nfSBwbGFjZWhvZGVyVGV4dCAtIEN1cnJlbnQgJ2lucHV0JyB0YWcncyB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihmb250U2l6ZSwgcGxhY2Vob2RlclRleHQpIHtcbiAgICAgICAgIHZhciBodG1sID0gJzxzcGFuIHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7Y29sb3I6I2FhYTsnO1xuXG4gICAgICAgICBodG1sICs9ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyICsgMSkpICsgJ3B4Oyc7XG4gICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJ1wiIFVOU0VMRUNUQUJMRT1cIm9uXCI+JyArIHBsYWNlaG9kZXJUZXh0ICsgJzwvc3Bhbj4nO1xuXG4gICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFBsYWNlaG9sZGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlICdzdHlsZScgdGFnIGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJ1bGVJbmZvIC0gc2VsZWN0b3IgYW5kIGNzcyB2YWx1ZVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRhZyBmb3IgYmluZGluZ1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
