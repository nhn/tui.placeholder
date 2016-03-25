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
 Placeholder = tui.util.defineClass({
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5QbGFjZWhvbGRlcicsIHJlcXVpcmUoJy4vc3JjL3BsYWNlaG9sZGVyJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdlbmVyYXRlIGN1c3RvbSBwbGFjZWhvZGVyIG9uIGJyb3dzZXJzIG5vdCBzdXBwb3J0ZWQgJ3BsYWNlaG9kZXInXG4gKiBAYXV0aG9yIE5ITiBFbnQuIEZFIGRldiB0ZWFtLjxkbF9qYXZhc2NyaXB0QG5obmVudC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXIsXG4gICAgaXNTdXBwb3J0UGxhY2Vob2xkZXIsXG4gICAgYnJvd3NlciA9IHR1aS51dGlsLmJyb3dzZXIsXG4gICAgaGFzQ29tcHV0ZWRTdHlsZUZ1bmMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSA/IHRydWUgOiBmYWxzZSxcbiAgICBLRVlDT0RFX0JBQ0sgPSA4LFxuICAgIEtFWUNPREVfVEFCID0gOTtcblxuaWYgKGJyb3dzZXIubXNpZSAmJiAoYnJvd3Nlci52ZXJzaW9uID4gOSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpKSB7XG4gICAgdXRpbC5hZGRDc3NSdWxlKHtcbiAgICAgICAgc2VsZWN0b3I6ICc6LW1zLWlucHV0LXBsYWNlaG9sZGVyJyxcbiAgICAgICAgY3NzOiAnY29sb3I6I2ZmZiAhaW1wb3J0YW50O3RleHQtaW5kZW50Oi05OTk5cHg7J1xuICAgIH0pO1xufSBlbHNlIGlmIChicm93c2VyLmNocm9tZSB8fCBicm93c2VyLnNhZmFyaSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnaW5wdXQ6LXdlYmtpdC1hdXRvZmlsbCcsXG4gICAgICAgIGNzczogJy13ZWJraXQtYm94LXNoYWRvdzogMCAwIDAgMTAwMHB4IHdoaXRlIGluc2V0OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBDcmVhdGUgcGxhY2Vob2xkZXIgY2xhc3NcbiAqIEBjbGFzcyBQbGFjZWhvbGRlclxuICogQGNvbnN0cnVjdG9yXG4gKi9cbiBQbGFjZWhvbGRlciA9IHR1aS51dGlsLmRlZmluZUNsYXNzKHtcbiAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAvKipcbiAgICAgICAgICAqIEFycmF5IHB1c2hlZCAnaW5wdXQnIHRhZ3MgaW4gY3VycmVudCBwYWdlXG4gICAgICAgICAgKiBAdHlwZSAge0FycmF5fVxuICAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICAqL1xuICAgICAgICAgdGhpcy5faW5wdXRFbGVtcyA9IFtdO1xuXG4gICAgICAgICB0aGlzLmFkZCgpO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBXaGVuIGNyZWF0ZSBkeW5hbWljICdpbnB1dCcgdGFnIGFuZCBhcHBlbmQgb24gcGFnZSwgZ2VuZXJhdGUgY3VzdG9tIHBsYWNlaG9sZGVyXG4gICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnRbXX0gZWxlbWVudHMgLSBBbGwgJ2lucHV0JyB0YWdzXG4gICAgICAqIEByZXR1cm5zIHtCb29sZWFufSBJZiBhIGJyb3dzZXIgc3VwcG9ydCAncGxhY2Vob2xkZXInIHByb3BlcnR5IGFuZCBoYXMgYW55IGNvbmRpdGlvbiwgcmV0dXJuc1xuICAgICAgKiBAYXBpXG4gICAgICAqL1xuICAgICBhZGQ6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICB9XG5cbiAgICAgICAgIGlmIChlbGVtZW50cykge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0aGlzLl9pbnB1dEVsZW1zLmNvbmNhdCh0dWkudXRpbC50b0FycmF5KGVsZW1lbnRzKSk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIHRoaXMuX2lucHV0RWxlbXMgPSB0dWkudXRpbC50b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICAgICAgIH1cblxuICAgICAgICAgaWYgKHRoaXMuX2lucHV0RWxlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVQbGFjZWhvbGRlcih0aGlzLl9pbnB1dEVsZW1zKTtcbiAgICAgICAgIH1cbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogUmV0dXJuIHN0eWxlIGluZm8gb2YgaW1wb3J0ZWQgc3R5bGVcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW0gLSBGaXJzdCAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2V0SW5pdFN0eWxlOiBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICB2YXIgY29tcHV0ZWRPYmosXG4gICAgICAgICAgICAgc3R5bGVJbmZvO1xuXG4gICAgICAgICBpZiAoaGFzQ29tcHV0ZWRTdHlsZUZ1bmMpIHtcbiAgICAgICAgICAgICBjb21wdXRlZE9iaiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsZW0sIG51bGwpO1xuICAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICAgZm9udFNpemU6IGNvbXB1dGVkT2JqLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpLFxuICAgICAgICAgICAgICAgICBmaXhlZEhlaWdodDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnbGluZS1oZWlnaHQnKSxcbiAgICAgICAgICAgICAgICAgZml4ZWRXaWR0aDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKVxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gZWxlbS5jdXJyZW50U3R5bGU7XG4gICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZm9udFNpemUsXG4gICAgICAgICAgICAgICAgIGZpeGVkSGVpZ2h0OiBjb21wdXRlZE9iai5saW5lSGVpZ2h0LFxuICAgICAgICAgICAgICAgICBmaXhlZFdpZHRoOiBjb21wdXRlZE9iai53aWR0aFxuICAgICAgICAgICAgIH07XG4gICAgICAgICB9XG5cbiAgICAgICAgIHJldHVybiBzdHlsZUluZm87XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdlbmVyYXRvciB2aXJ0dWFsIHBsYWNlaG9sZGVycyBmb3IgYnJvd3NlciBub3Qgc3VwcG9ydGVkICdwbGFjZWhvbGRlcicgcHJvcGVydHlcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVBsYWNlaG9sZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgdHVpLnV0aWwuZm9yRWFjaCh0aGlzLl9pbnB1dEVsZW1zLCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAgICAgICAgdmFyIHR5cGUgPSBlbGVtLnR5cGU7XG5cbiAgICAgICAgICAgICBpZiAoKHR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlID09PSAncGFzc3dvcmQnIHx8IHR5cGUgPT09ICdlbWFpbCcpICYmXG4gICAgICAgICAgICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicpKSB7XG4gICAgICAgICAgICAgICAgIHNlbGYuX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyKGVsZW0pO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgIH0pO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBBdHRhY2ggYSBuZXcgY3VzdG9tIHBsYWNlaG9kZXIgdGFnIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyB0YWcgYW5kIHdyYXAgJ2lucHV0JyB0YWdcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZ1xuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgIHZhciBpbml0U3R5bGUgPSB0aGlzLl9nZXRJbml0U3R5bGUodGFyZ2V0KSxcbiAgICAgICAgICAgICBmb250U2l6ZSA9IGluaXRTdHlsZS5mb250U2l6ZSxcbiAgICAgICAgICAgICBmaXhlZEhlaWdodCA9IGluaXRTdHlsZS5maXhlZEhlaWdodCxcbiAgICAgICAgICAgICB3cmFwVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpLFxuICAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKTtcblxuICAgICAgICAgdGFyZ2V0LnN0eWxlLmNzc1RleHQgPSB0aGlzLl9nZXRJbnB1dFN0eWxlKGZvbnRTaXplLCBmaXhlZEhlaWdodCk7XG5cbiAgICAgICAgIHdyYXBUYWcuaW5uZXJIVE1MID0gdGhpcy5fZ2VuZXJhdGVTcGFuVGFnKGZvbnRTaXplLCBwbGFjZWhvbGRlcik7XG4gICAgICAgICB3cmFwVGFnLmFwcGVuZENoaWxkKHRhcmdldC5jbG9uZU5vZGUoKSk7XG5cbiAgICAgICAgIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwVGFnLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KTtcblxuICAgICAgICAgd3JhcFRhZy5zdHlsZS5jc3NUZXh0ID0gdGhpcy5fZ2V0V3JhcHBlclN0eWxlKGluaXRTdHlsZS5maXhlZFdpZHRoKTtcblxuICAgICAgICAgdGhpcy5fYmluZEV2ZW50VG9DdXN0b21QbGFjZWhvbGRlcih3cmFwVGFnKTtcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogQmluZCBldmVudCBjdXN0b20gcGxhY2Vob2RlciB0YWdcbiAgICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIHRhZydzIHdyYXBwZXIgdGFnXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfYmluZEV2ZW50VG9DdXN0b21QbGFjZWhvbGRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICB2YXIgaW5wdXRUYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2lucHV0JylbMF0sXG4gICAgICAgICAgICAgc3BhblRhZyA9IHRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3BhbicpWzBdLFxuICAgICAgICAgICAgIHNwYW5TdHlsZSA9IHNwYW5UYWcuc3R5bGU7XG5cbiAgICAgICAgIHV0aWwuYmluZEV2ZW50KHNwYW5UYWcsICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgaW5wdXRUYWcuZm9jdXMoKTtcbiAgICAgICAgIH0pO1xuXG4gICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoIHx8IGUua2V5Q29kZTtcblxuICAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IEtFWUNPREVfQkFDSyB8fCBrZXlDb2RlID09PSBLRVlDT0RFX1RBQikpIHtcbiAgICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG5cbiAgICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICBpZiAoaW5wdXRUYWcudmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgIHNwYW5TdHlsZS5kaXNwbGF5ID0gJ2lubGluZS1ibG9jayc7XG4gICAgICAgICAgICAgfVxuICAgICAgICAgfSk7XG4gICAgIH0sXG5cbiAgICAgLyoqXG4gICAgICAqIEdldCBzdHlsZSBvZiAnaW5wdXQnIHRhZydzIHBhcmVudCB0YWdcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmaXhlZFdpZHRoIC0gVGhlICdpbnB1dCcgdGFnJ3MgJ3dpZHRoJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBTdHJpbmcgb2YgY3VzdG9tIHBsYWNlaG9kZXIgd3JhcHBlciB0YWcncyBzdHlsZVxuICAgICAgKiBAcHJpdmF0ZVxuICAgICAgKi9cbiAgICAgX2dldFdyYXBwZXJTdHlsZTogZnVuY3Rpb24oZml4ZWRXaWR0aCkge1xuICAgICAgICAgcmV0dXJuICdwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmlubGluZS1ibG9jazsqZGlzcGxheTppbmxpbmU7em9vbToxO3dpZHRoOicgKyBmaXhlZFdpZHRoICsgJzsnO1xuICAgICB9LFxuXG4gICAgIC8qKlxuICAgICAgKiBHZXQgc3R5bGUgb2YgJ2lucHV0JyB0YWdcbiAgICAgICogQHBhcmFtICB7TnVtYmVyfSBmb250U2l6ZSAtIFRoZSAnaW5wdXQnIHRhZydzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICAqIEBwYXJhbSAge051bWJlcn0gZml4ZWRIZWlnaHQgLSBUaGUgJ2lucHV0JyB0YWcncyAnbGluZS1oZWlnaHQnIHByb3BlcnR5IHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiAnaW5wdXQnIHRhZydzIHN0eWxlXG4gICAgICAqIEBwcml2YXRlXG4gICAgICAqL1xuICAgICBfZ2V0SW5wdXRTdHlsZTogZnVuY3Rpb24oZm9udFNpemUsIGZpeGVkSGVpZ2h0KSB7XG4gICAgICAgICByZXR1cm4gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnO2hlaWdodDonICsgZml4ZWRIZWlnaHQgKyAnO2xpbmUtaGVpZ2h0OicgKyBmaXhlZEhlaWdodCArICc7JztcbiAgICAgfSxcblxuICAgICAvKipcbiAgICAgICogW2Z1bmN0aW9uIGRlc2NyaXB0aW9uXVxuICAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZvbnRTaXplIC0gQ3VycmVudCAnJ2lucHV0JyB0YWcncyAnZm9udC1zaXplJyBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHBsYWNlaG9kZXJUZXh0IC0gQ3VycmVudCAnaW5wdXQnIHRhZydzIHZhbHVlXG4gICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFN0cmluZyBvZiBjdXN0b20gcGxhY2Vob2RlciB0YWdcbiAgICAgICogQHByaXZhdGVcbiAgICAgICovXG4gICAgIF9nZW5lcmF0ZVNwYW5UYWc6IGZ1bmN0aW9uKGZvbnRTaXplLCBwbGFjZWhvZGVyVGV4dCkge1xuICAgICAgICAgdmFyIGh0bWwgPSAnPHNwYW4gc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTtjb2xvcjojYWFhOyc7XG5cbiAgICAgICAgIGh0bWwgKz0gJ2Rpc3BsYXk6aW5saW5lLWJsb2NrO21hcmdpbi10b3A6JyArICgtKHBhcnNlRmxvYXQoZm9udFNpemUsIDEwKSAvIDIgKyAxKSkgKyAncHg7JztcbiAgICAgICAgIGh0bWwgKz0gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnXCIgVU5TRUxFQ1RBQkxFPVwib25cIj4nICsgcGxhY2Vob2RlclRleHQgKyAnPC9zcGFuPic7XG5cbiAgICAgICAgIHJldHVybiBodG1sO1xuICAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgUGxhY2Vob2xkZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgJ3N0eWxlJyB0YWcgYW5kIGFkZCBjc3MgcnVsZVxuICAgICAqIEBwYXJhbSAge09iamVjdH0gcnVsZUluZm8gLSBzZWxlY3RvciBhbmQgY3NzIHZhbHVlXG4gICAgICovXG4gICAgYWRkQ3NzUnVsZTogZnVuY3Rpb24ocnVsZUluZm8pIHtcbiAgICAgICAgdmFyIHN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICAgICAgICAgIHN0eWxlU2hlZXQsXG4gICAgICAgICAgICBzZWxlY3RvciA9IHJ1bGVJbmZvLnNlbGVjdG9yLFxuICAgICAgICAgICAgY3NzID0gcnVsZUluZm8uY3NzO1xuXG4gICAgICAgIGlmIChkb2N1bWVudC5oZWFkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGVTaGVldCA9IHN0eWxlVGFnLnNoZWV0IHx8IHN0eWxlVGFnLnN0eWxlU2hlZXQ7XG5cbiAgICAgICAgaWYgKHN0eWxlU2hlZXQuaW5zZXJ0UnVsZSkge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5pbnNlcnRSdWxlKHNlbGVjdG9yICsgJ3snICsgY3NzICsgJ30nLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuYWRkUnVsZShzZWxlY3RvciwgY3NzLCAwKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IHRvIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGFnIGZvciBiaW5kaW5nXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBldmVudFR5cGUgLSBFdmVudCB0eXBlXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrIC0gRXZlbnQgaGFuZGxlciBmdW5jdGlvblxuICAgICAqL1xuICAgIGJpbmRFdmVudDogZnVuY3Rpb24odGFyZ2V0LCBldmVudFR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFsnb24nICsgZXZlbnRUeXBlXSA9IGNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuIl19
