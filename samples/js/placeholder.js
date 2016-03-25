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
} else if (browser.chrome || browser.safari) {
    util.addCssRule({
        selector: 'input:-webkit-autofill',
        css: '-webkit-box-shadow: 0 0 0 1000px white inset;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

/**
 * Create placeholder class
 * @class Placeholder
 * @constructor
 */
 Placeholder = tui.util.defineClass(/** @lends Tree.prototype */{
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
      * @param {HTMLElement[]} elements - All 'input' tags
      * @returns {Boolean} If a browser support 'placeholder' property and has any condition, returns
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlcicsIHJlcXVpcmUoJy4vc3JjL3BsYWNlaG9sZGVyJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdlbmVyYXRlIGN1c3RvbSBwbGFjZWhvZGVyIG9uIGJyb3dzZXJzIG5vdCBzdXBwb3J0ZWQgJ3BsYWNlaG9kZXInXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIGRldiB0ZWFtLjxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXIsXG4gICAgaXNTdXBwb3J0UGxhY2Vob2xkZXIsXG4gICAgYnJvd3NlciA9IHR1aS51dGlsLmJyb3dzZXIsXG4gICAgaGFzQ29tcHV0ZWRTdHlsZUZ1bmMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/IHRydWUgOiBmYWxzZSxcbiAgICBLRVlDT0RFX0JBQ0sgPSA4LFxuICAgIEtFWUNPREVfVEFCID0gOTtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufSBlbHNlIGlmIChicm93c2VyLmNocm9tZSB8fCBicm93c2VyLnNhZmFyaSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnaW5wdXQ6LXdlYmtpdC1hdXRvZmlsbCcsXG4gICAgICAgIGNzczogJy13ZWJraXQtYm94LXNoYWRvdzogMCAwIDAgMTAwMHB4IHdoaXRlIGluc2V0OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBDcmVhdGUgcGxhY2Vob2xkZXIgY2xhc3NcbiAqIEBjbGFzcyBQbGFjZWhvbGRlclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbiBQbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVHJlZS5wcm90b3R5cGUgKi97XG4gICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgLyoqXG4gICAgICAgICAgKiBBcnJheSBwdXNoZWQgJ2lucHV0JyB0YWdzIGluIGN1cnJlbnQgcGFnZVxuICAgICAgICAgICogQHR5cGUgIHtBcnJheX1cbiAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgKi9cbiAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSBbXTtcblxuICAgICAgICAgdGhpcy5hZGQoKTtcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogV2hlbiBjcmVhdGUgZHluYW1pYyAnaW5wdXQnIHRhZyBhbmQgYXBwZW5kIG9uIHBhZ2UsIGdlbmVyYXRlIGN1c3RvbSBwbGFjZWhvbGRlclxuICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IGVsZW1lbnRzIC0gQWxsICdpbnB1dCcgdGFnc1xuICAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gSWYgYSBicm93c2VyIHN1cHBvcnQgJ3BsYWNlaG9sZGVyJyBwcm9wZXJ0eSBhbmQgaGFzIGFueSBjb25kaXRpb24sIHJldHVybnNcbiAgICAgICogQGFwaVxuICAgICAgKi9cbiAgICAgYWRkOiBmdW5jdGlvbihlbGVtZW50cykge1xuICAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgfVxuXG4gICAgICAgICBpZiAoZWxlbWVudHMpIHtcbiAgICAgICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdGhpcy5faW5wdXRFbGVtcy5jb25jYXQodHVpLnV0aWwudG9BcnJheShlbGVtZW50cykpO1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdHVpLnV0aWwudG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmICh0aGlzLl9pbnB1dEVsZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgIHRoaXMuX2dlbmVyYXRlUGxhY2Vob2xkZXIodGhpcy5faW5wdXRFbGVtcyk7XG4gICAgICAgICB9XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFJldHVybiBzdHlsZSBpbmZvIG9mIGltcG9ydGVkIHN0eWxlXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbGVtIC0gRmlyc3QgJ2lucHV0JyB0YWdcbiAgICAgICogQHJldHVybnMge09iamVjdH0gU3R5bGUgaW5mb1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldEluaXRTdHlsZTogZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgdmFyIGNvbXB1dGVkT2JqLFxuICAgICAgICAgICAgIHN0eWxlSW5mbztcblxuICAgICAgICAgaWYgKGhhc0NvbXB1dGVkU3R5bGVGdW5jKSB7XG4gICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtLCBudWxsKTtcbiAgICAgICAgICAgICBzdHlsZUluZm8gPSB7XG4gICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKSxcbiAgICAgICAgICAgICAgICAgZml4ZWRIZWlnaHQ6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ2xpbmUtaGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ3dpZHRoJylcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICBjb21wdXRlZE9iaiA9IGVsZW0uY3VycmVudFN0eWxlO1xuICAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmZvbnRTaXplLFxuICAgICAgICAgICAgICAgICBmaXhlZEhlaWdodDogY29tcHV0ZWRPYmoubGluZUhlaWdodCxcbiAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmoud2lkdGhcbiAgICAgICAgICAgICB9O1xuICAgICAgICAgfVxuXG4gICAgICAgICByZXR1cm4gc3R5bGVJbmZvO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZW5lcmF0b3IgdmlydHVhbCBwbGFjZWhvbGRlcnMgZm9yIGJyb3dzZXIgbm90IHN1cHBvcnRlZCAncGxhY2Vob2xkZXInIHByb3BlcnR5XG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2VuZXJhdGVQbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgIHR1aS51dGlsLmZvckVhY2godGhpcy5faW5wdXRFbGVtcywgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbS50eXBlO1xuXG4gICAgICAgICAgICAgaWYgKCh0eXBlID09PSAndGV4dCcgfHwgdHlwZSA9PT0gJ3Bhc3N3b3JkJyB8fCB0eXBlID09PSAnZW1haWwnKSAmJlxuICAgICAgICAgICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSkge1xuICAgICAgICAgICAgICAgICBzZWxmLl9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcihlbGVtKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgICB9KTtcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogQXR0YWNoIGEgbmV3IGN1c3RvbSBwbGFjZWhvZGVyIHRhZyBhZnRlciBhIHNlbGVjdGVkICdpbnB1dCcgdGFnIGFuZCB3cmFwICdpbnB1dCcgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICB2YXIgaW5pdFN0eWxlID0gdGhpcy5fZ2V0SW5pdFN0eWxlKHRhcmdldCksXG4gICAgICAgICAgICAgZm9udFNpemUgPSBpbml0U3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICAgZml4ZWRIZWlnaHQgPSBpbml0U3R5bGUuZml4ZWRIZWlnaHQsXG4gICAgICAgICAgICAgd3JhcFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSxcbiAgICAgICAgICAgICBwbGFjZWhvbGRlciA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJyk7XG5cbiAgICAgICAgIHRhcmdldC5zdHlsZS5jc3NUZXh0ID0gdGhpcy5fZ2V0SW5wdXRTdHlsZShmb250U2l6ZSwgZml4ZWRIZWlnaHQpO1xuXG4gICAgICAgICB3cmFwVGFnLmlubmVySFRNTCA9IHRoaXMuX2dlbmVyYXRlU3BhblRhZyhmb250U2l6ZSwgcGxhY2Vob2xkZXIpO1xuICAgICAgICAgd3JhcFRhZy5hcHBlbmRDaGlsZCh0YXJnZXQuY2xvbmVOb2RlKCkpO1xuXG4gICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUod3JhcFRhZywgdGFyZ2V0Lm5leHRTaWJsaW5nKTtcbiAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldCk7XG5cbiAgICAgICAgIHdyYXBUYWcuc3R5bGUuY3NzVGV4dCA9IHRoaXMuX2dldFdyYXBwZXJTdHlsZShpbml0U3R5bGUuZml4ZWRXaWR0aCk7XG5cbiAgICAgICAgIHRoaXMuX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXIod3JhcFRhZyk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEJpbmQgZXZlbnQgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBUaGUgJ2lucHV0JyB0YWcncyB3cmFwcGVyIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2JpbmRFdmVudFRvQ3VzdG9tUGxhY2Vob2xkZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgdmFyIGlucHV0VGFnID0gdGFyZ2V0LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpWzBdLFxuICAgICAgICAgICAgIHNwYW5UYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgICBzcGFuU3R5bGUgPSBzcGFuVGFnLnN0eWxlO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChzcGFuVGFnLCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIGlucHV0VGFnLmZvY3VzKCk7XG4gICAgICAgICB9KTtcblxuICAgICAgICAgdXRpbC5iaW5kRXZlbnQoaW5wdXRUYWcsICdrZXlkb3duJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgICBpZiAoIShrZXlDb2RlID09PSBLRVlDT0RFX0JBQ0sgfHwga2V5Q29kZSA9PT0gS0VZQ09ERV9UQUIpKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgaWYgKGlucHV0VGFnLnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZXQgc3R5bGUgb2YgJ2lucHV0JyB0YWcncyBwYXJlbnQgdGFnXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZml4ZWRXaWR0aCAtIFRoZSAnaW5wdXQnIHRhZydzICd3aWR0aCcgcHJvcGVydHkgdmFsdWVcbiAgICAgICogQHJldHVybnMge1N0cmluZ30gU3RyaW5nIG9mIGN1c3RvbSBwbGFjZWhvZGVyIHdyYXBwZXIgdGFnJ3Mgc3R5bGVcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZXRXcmFwcGVyU3R5bGU6IGZ1bmN0aW9uKGZpeGVkV2lkdGgpIHtcbiAgICAgICAgIHJldHVybiAncG9zaXRpb246cmVsYXRpdmU7ZGlzcGxheTppbmxpbmUtYmxvY2s7KmRpc3BsYXk6aW5saW5lO3pvb206MTt3aWR0aDonICsgZml4ZWRXaWR0aCArICc7JztcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogR2V0IHN0eWxlIG9mICdpbnB1dCcgdGFnXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZm9udFNpemUgLSBUaGUgJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZpeGVkSGVpZ2h0IC0gVGhlICdpbnB1dCcgdGFnJ3MgJ2xpbmUtaGVpZ2h0JyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgJ2lucHV0JyB0YWcncyBzdHlsZVxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldElucHV0U3R5bGU6IGZ1bmN0aW9uKGZvbnRTaXplLCBmaXhlZEhlaWdodCkge1xuICAgICAgICAgcmV0dXJuICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJztoZWlnaHQ6JyArIGZpeGVkSGVpZ2h0ICsgJztsaW5lLWhlaWdodDonICsgZml4ZWRIZWlnaHQgKyAnOyc7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIFtmdW5jdGlvbiBkZXNjcmlwdGlvbl1cbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIEN1cnJlbnQgJydpbnB1dCcgdGFnJ3MgJ2ZvbnQtc2l6ZScgcHJvcGVydHkgdmFsdWVcbiAgICAgICogQHBhcmFtICB7U3RyaW5nfSBwbGFjZWhvZGVyVGV4dCAtIEN1cnJlbnQgJ2lucHV0JyB0YWcncyB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgY3VzdG9tIHBsYWNlaG9kZXIgdGFnXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2VuZXJhdGVTcGFuVGFnOiBmdW5jdGlvbihmb250U2l6ZSwgcGxhY2Vob2RlclRleHQpIHtcbiAgICAgICAgIHZhciBodG1sID0gJzxzcGFuIHN0eWxlPVwicG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDo1MCU7Y29sb3I6I2FhYTsnO1xuXG4gICAgICAgICBodG1sICs9ICdkaXNwbGF5OmlubGluZS1ibG9jazttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyICsgMSkpICsgJ3B4Oyc7XG4gICAgICAgICBodG1sICs9ICdmb250LXNpemU6JyArIGZvbnRTaXplICsgJ1wiIFVOU0VMRUNUQUJMRT1cIm9uXCI+JyArIHBsYWNlaG9kZXJUZXh0ICsgJzwvc3Bhbj4nO1xuXG4gICAgICAgICByZXR1cm4gaHRtbDtcbiAgICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFBsYWNlaG9sZGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlICdzdHlsZScgdGFnIGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IHJ1bGVJbmZvIC0gc2VsZWN0b3IgYW5kIGNzcyB2YWx1ZVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRhZyBmb3IgYmluZGluZ1xuICAgICAqIEBwYXJhbSAge1N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
