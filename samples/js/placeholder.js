(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Placeholder', require('./src/placeholder'));

},{"./src/placeholder":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate custom placehoder on browsers not supported 'placehoder'
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */

'use strict';

var util = require('./util.js');

var browser = tui.util.browser,
    Placeholder;

if (browser.msie && browser.version > 9) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
} else if (browser.chrome || browser.safari) {
    util.addCssRule({
        selector: 'input:-webkit-autofill',
        css: '-webkit-box-shadow: 0 0 0 1000px white inset;'
    });
}

/**
 * Create placeholder class
 * @class Placeholder
 * @constructor
 * @param {HTMLElement} elements - All 'input' tags
 */
 Placeholder = tui.util.defineClass({
     init: function(elements) {
         /**
          * Array pushed 'input' tags in current page
          * @type  {Array}
          * @private
          */
         this._inputElems = [];

         this.add(elements);
     },

     /**
      * When create dynamic 'input' tag and append on page, generate custom placeholder
      * @param {HTMLElement} elements - All 'input' tags
      * @api
      */
     add: function(elements) {
         var isSupportPlaceholder = 'placeholder' in document.createElement('input');

         if (elements) {
             this._inputElems = this._inputElems.concat(tui.util.toArray(elements));
         } else {
             this._inputElems = tui.util.toArray(document.getElementsByTagName('input'));
         }

         if ((!isSupportPlaceholder || browser.msie) &&
             this._inputElems.length > 0) {
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
             hasFunc = false;

         if (window.getComputedStyle) {
             hasFunc = true;
             computedObj = window.getComputedStyle(elem, null);
         } else {
             computedObj = elem.currentStyle;
         }

         return {
             fontSize: hasFunc ? computedObj.getPropertyValue('font-size') : computedObj.fontSize,
             fixedHeight: hasFunc ? computedObj.getPropertyValue('line-height') : computedObj.lineHeight,
             fixedWidth: hasFunc ? computedObj.getPropertyValue('width') : computedObj.width
         };
     },

     /**
      * Generator virtual placeholders for browser not supported 'placeholder' property
      * @private
      */
     _generatePlaceholder: function() {
         var self = this,
             type;

         tui.util.forEach(this._inputElems, function(elem) {
             type = elem.type;

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

         util.bindEventToCustomPlaceholder(wrapTag);
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
             var keyCode = e.keyCode;

             if (!(keyCode === 8 || keyCode === 9)) {
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
         var html = '<span style="position:absolute;padding-left:2px;left:0;top:50%;color:#aaa;';

         html += 'display:inline-block;margin-top:' + (-(parseFloat(fontSize, 10) / 2)) + 'px;';
         html += 'font-size:' + fontSize + '">' + placehoderText + '</span>';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlBsYWNlaG9sZGVyJywgcmVxdWlyZSgnLi9zcmMvcGxhY2Vob2xkZXInKSk7XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR2VuZXJhdGUgY3VzdG9tIHBsYWNlaG9kZXIgb24gYnJvd3NlcnMgbm90IHN1cHBvcnRlZCAncGxhY2Vob2RlcidcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbnZhciBicm93c2VyID0gdHVpLnV0aWwuYnJvd3NlcixcbiAgICBQbGFjZWhvbGRlcjtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPiA5KSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufSBlbHNlIGlmIChicm93c2VyLmNocm9tZSB8fCBicm93c2VyLnNhZmFyaSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnaW5wdXQ6LXdlYmtpdC1hdXRvZmlsbCcsXG4gICAgICAgIGNzczogJy13ZWJraXQtYm94LXNoYWRvdzogMCAwIDAgMTAwMHB4IHdoaXRlIGluc2V0OydcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgcGxhY2Vob2xkZXIgY2xhc3NcbiAqIEBjbGFzcyBQbGFjZWhvbGRlclxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50cyAtIEFsbCAnaW5wdXQnIHRhZ3NcbiAqL1xuIFBsYWNlaG9sZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3Moe1xuICAgICBpbml0OiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICAgLyoqXG4gICAgICAgICAgKiBBcnJheSBwdXNoZWQgJ2lucHV0JyB0YWdzIGluIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICogQHR5cGUgIHtBcnJheX1cbiAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgKi9cbiAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSBbXTtcblxuICAgICAgICAgdGhpcy5hZGQoZWxlbWVudHMpO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBXaGVuIGNyZWF0ZSBkeW5hbWljICdpbnB1dCcgdGFnIGFuZCBhcHBlbmQgb24gcGFnZSwgZ2VuZXJhdGUgY3VzdG9tIHBsYWNlaG9sZGVyXG4gICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRzIC0gQWxsICdpbnB1dCcgdGFnc1xuICAgICAgKiBAYXBpXG4gICAgICAqL1xuICAgICBhZGQ6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgICB2YXIgaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cbiAgICAgICAgIGlmIChlbGVtZW50cykge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0aGlzLl9pbnB1dEVsZW1zLmNvbmNhdCh0dWkudXRpbC50b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKCghaXNTdXBwb3J0UGxhY2Vob2xkZXIgfHwgYnJvd3Nlci5tc2llKSAmJlxuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlUGxhY2Vob2xkZXIodGhpcy5faW5wdXRFbGVtcyk7XG4gICAgICAgICB9XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFJldHVybiBzdHlsZSBpbmZvIG9mIGltcG9ydGVkIHN0eWxlXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtIC0gRmlyc3QgJ2lucHV0JyB0YWdcbiAgICAgICogQHJldHVybnMge09iamVjdH0gU3R5bGUgaW5mb1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldEluaXRTdHlsZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgdmFyIGNvbXB1dGVkT2JqLFxuICAgICAgICAgICAgIGhhc0Z1bmMgPSBmYWxzZTtcblxuICAgICAgICAgaWYgKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICAgaGFzRnVuYyA9IHRydWU7XG4gICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgY29tcHV0ZWRPYmogPSBlbGVtLmN1cnJlbnRTdHlsZTtcbiAgICAgICAgIH1cblxuICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICBmb250U2l6ZTogaGFzRnVuYyA/IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpIDogY29tcHV0ZWRPYmouZm9udFNpemUsXG4gICAgICAgICAgICAgZml4ZWRIZWlnaHQ6IGhhc0Z1bmMgPyBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdsaW5lLWhlaWdodCcpIDogY29tcHV0ZWRPYmoubGluZUhlaWdodCxcbiAgICAgICAgICAgICBmaXhlZFdpZHRoOiBoYXNGdW5jID8gY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSA6IGNvbXB1dGVkT2JqLndpZHRoXG4gICAgICAgICB9O1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZW5lcmF0b3IgdmlydHVhbCBwbGFjZWhvbGRlcnMgZm9yIGJyb3dzZXIgbm90IHN1cHBvcnRlZCAncGxhY2Vob2xkZXInIHByb3BlcnR5XG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2VuZXJhdGVQbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgdHlwZTtcblxuICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9pbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICAgdHlwZSA9IGVsZW0udHlwZTtcblxuICAgICAgICAgICAgIGlmICgodHlwZSA9PT0gJ3RleHQnIHx8IHR5cGUgPT09ICdwYXNzd29yZCcgfHwgdHlwZSA9PT0gJ2VtYWlsJykgJiZcbiAgICAgICAgICAgICAgICAgZWxlbS5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgICAgICAgICAgc2VsZi5fYXR0YWNoQ3VzdG9tUGxhY2Vob2xkZXIoZWxlbSk7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEF0dGFjaCBhIG5ldyBjdXN0b20gcGxhY2Vob2RlciB0YWcgYWZ0ZXIgYSBzZWxlY3RlZCAnaW5wdXQnIHRhZyBhbmQgd3JhcCAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgdGFnXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfYXR0YWNoQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgdmFyIGluaXRTdHlsZSA9IHRoaXMuX2dldEluaXRTdHlsZSh0YXJnZXQpLFxuICAgICAgICAgICAgIGZvbnRTaXplID0gaW5pdFN0eWxlLmZvbnRTaXplLFxuICAgICAgICAgICAgIGZpeGVkSGVpZ2h0ID0gaW5pdFN0eWxlLmZpeGVkSGVpZ2h0LFxuICAgICAgICAgICAgIHdyYXBUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyksXG4gICAgICAgICAgICAgcGxhY2Vob2xkZXIgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpO1xuXG4gICAgICAgICB0YXJnZXQuc3R5bGUuY3NzVGV4dCA9IHRoaXMuX2dldElucHV0U3R5bGUoZm9udFNpemUsIGZpeGVkSGVpZ2h0KTtcblxuICAgICAgICAgd3JhcFRhZy5pbm5lckhUTUwgPSB0aGlzLl9nZW5lcmF0ZVNwYW5UYWcoZm9udFNpemUsIHBsYWNlaG9sZGVyKTtcbiAgICAgICAgIHdyYXBUYWcuYXBwZW5kQ2hpbGQodGFyZ2V0LmNsb25lTm9kZSgpKTtcblxuICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBUYWcsIHRhcmdldC5uZXh0U2libGluZyk7XG4gICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpO1xuXG4gICAgICAgICB3cmFwVGFnLnN0eWxlLmNzc1RleHQgPSB0aGlzLl9nZXRXcmFwcGVyU3R5bGUoaW5pdFN0eWxlLmZpeGVkV2lkdGgpO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXIod3JhcFRhZyk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEJpbmQgZXZlbnQgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWcncyB3cmFwcGVyIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgdmFyIGlucHV0VGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdLFxuICAgICAgICAgICAgIHNwYW5UYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChzcGFuVGFnLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICBpbnB1dFRhZy5mb2N1cygpO1xuICAgICAgICAgfSk7XG5cbiAgICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICB2YXIga2V5Q29kZSA9IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IDggfHwga2V5Q29kZSA9PT0gOSkpIHtcbiAgICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG5cbiAgICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdldCBzdHlsZSBvZiAnaW5wdXQnIHRhZydzIHBhcmVudCB0YWdcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmaXhlZFdpZHRoIC0gVGhlICdpbnB1dCcgdGFnJ3MgJ3dpZHRoJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgY3VzdG9tIHBsYWNlaG9kZXIgd3JhcHBlciB0YWcncyBzdHlsZVxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldFdyYXBwZXJTdHlsZTogZnVuY3Rpb24oZml4ZWRXaWR0aCkge1xuICAgICAgICAgcmV0dXJuICdwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1ibG9jazsqZGlzcGxheTppbmxpbmU7em9vbToxO3dpZHRoOicgKyBmaXhlZFdpZHRoICsgJzsnO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZXQgc3R5bGUgb2YgJ2lucHV0JyB0YWdcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIFRoZSAnaW5wdXQnIHRhZydzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZml4ZWRIZWlnaHQgLSBUaGUgJ2lucHV0JyB0YWcncyAnbGluZS1oZWlnaHQnIHByb3BlcnR5IHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiAnaW5wdXQnIHRhZydzIHN0eWxlXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2V0SW5wdXRTdHlsZTogZnVuY3Rpb24oZm9udFNpemUsIGZpeGVkSGVpZ2h0KSB7XG4gICAgICAgICByZXR1cm4gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnO2hlaWdodDonICsgZml4ZWRIZWlnaHQgKyAnO2xpbmUtaGVpZ2h0OicgKyBmaXhlZEhlaWdodCArICc7JztcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogW2Z1bmN0aW9uIGRlc2NyaXB0aW9uXVxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZvbnRTaXplIC0gQ3VycmVudCAnJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBsYWNlaG9kZXJUZXh0IC0gQ3VycmVudCAnaW5wdXQnIHRhZydzIHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiBjdXN0b20gcGxhY2Vob2RlciB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVNwYW5UYWc6IGZ1bmN0aW9uKGZvbnRTaXplLCBwbGFjZWhvZGVyVGV4dCkge1xuICAgICAgICAgdmFyIGh0bWwgPSAnPHNwYW4gc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtwYWRkaW5nLWxlZnQ6MnB4O2xlZnQ6MDt0b3A6NTAlO2NvbG9yOiNhYWE7JztcblxuICAgICAgICAgaHRtbCArPSAnZGlzcGxheTppbmxpbmUtYmxvY2s7bWFyZ2luLXRvcDonICsgKC0ocGFyc2VGbG9hdChmb250U2l6ZSwgMTApIC8gMikpICsgJ3B4Oyc7XG4gICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJ1wiPicgKyBwbGFjZWhvZGVyVGV4dCArICc8L3NwYW4+JztcblxuICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBQbGFjZWhvbGRlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSAnc3R5bGUnIHRhZyBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBydWxlSW5mbyAtIHNlbGVjdG9yIGFuZCBjc3MgdmFsdWVcbiAgICAgKi9cbiAgICBhZGRDc3NSdWxlOiBmdW5jdGlvbihydWxlSW5mbykge1xuICAgICAgICB2YXIgc3R5bGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgICAgICAgICAgc3R5bGVTaGVldCxcbiAgICAgICAgICAgIHNlbGVjdG9yID0gcnVsZUluZm8uc2VsZWN0b3IsXG4gICAgICAgICAgICBjc3MgPSBydWxlSW5mby5jc3M7XG5cbiAgICAgICAgaWYgKGRvY3VtZW50LmhlYWQpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdHlsZVNoZWV0ID0gc3R5bGVUYWcuc2hlZXQgfHwgc3R5bGVUYWcuc3R5bGVTaGVldDtcblxuICAgICAgICBpZiAoc3R5bGVTaGVldC5pbnNlcnRSdWxlKSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0Lmluc2VydFJ1bGUoc2VsZWN0b3IgKyAneycgKyBjc3MgKyAnfScsIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5hZGRSdWxlKHNlbGVjdG9yLCBjc3MsIDApO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnQgdG8gZWxlbWVudFxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUYWcgZm9yIGJpbmRpbmdcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBFdmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0WydvbicgKyBldmVudFR5cGVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iXX0=
