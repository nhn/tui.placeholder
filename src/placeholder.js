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
