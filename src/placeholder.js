/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var browser = tui.util.browser;
var Placeholder, sharedInstance, isSupportPlaceholder;

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

/**
 * Placeholder Object
 * @constructor
 * @param {HTMLElement} elements - Selected 'input' elements
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
     * @param {HTMLElements|Undefined} inputElems - Selected 'input' elements for generating placeholder
     */
    add: function(inputElems) {
        var selectedElems = tui.util.toArray(inputElems || document.getElementsByTagName('input'));

        if (inputElems) {
            this._inputElems.concat(selectedElems);
        } else {
            this._inputElems = selectedElems;
        }

        this._generatePlaceholder(selectedElems);
    },

    /**
     * Hide placeholder on 'input' element that has already value
     */
    hidePlaceholders: function() {
        tui.util.forEach(this._inputElems, function(elem) {
            var placeholder = elem.parentNode.getElementsByTagName('span')[0];
            placeholder.style.display = elem.value !== '' ? 'none' : 'inline-block';
        });
    },

    /**
     * Generate virtual placeholders for the browser isnt't supported placeholder property
     * @param {HTMLElements} inputElems - 'input' elements for generating placeholder
     */
    _generatePlaceholder: function(inputElems) {
        var self = this;

        tui.util.forEach(inputElems, function(elem, index) {
            if (tui.util.inArray(elem.type, INPUT_TYPES) > -1 &&
                elem.getAttribute('placeholder')) {
                self._attachCustomPlaceholder(elem, index);
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
        var computedObj;
        var styleInfo;

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
     * @param {Number} index - Current item index
     * @private
     */
    _attachCustomPlaceholder: function(target, index) {
        var initStyle = this._getInitStyle(target);
        var wrapTag = document.createElement('span');
        var placeholder = target.getAttribute('placeholder');
        var parentNode = target.parentNode;
        var cloneNode = target.cloneNode();
        var hasValue = target.value !== '';

        this._inputElems[index] = cloneNode;

        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, hasValue);
        wrapTag.appendChild(cloneNode);

        parentNode.insertBefore(wrapTag, target.nextSibling);
        parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._bindEvent(wrapTag);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The wrapper tag of the 'input' element
     * @private
     */
    _bindEvent: function(target) {
        var inputTag = target.getElementsByTagName('input')[0];
        var spanTag = target.getElementsByTagName('span')[0];
        var spanStyle = spanTag.style;

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
     * @param {String} placeholderText - Current 'input' element value of placeholder property
     * @param {Boolena} hasValue - State of current 'input' element that has value
     * @returns {String} String of virtual placeholder tag
     * @private
     */
    _generateSpanTag: function(paddingLeft, fontSize, placeholderText, hasValue) {
        var html = '<span style="position:absolute;left:0;top:50%;width:90%;';

        html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';
        html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;*display:inline;zoom:1;';
        html += 'display:' + (hasValue ? 'none' : 'inline-block') + ';';
        html += 'color:#aaa;line-height:1.2;z-index:0;';
        html += 'font-size:' + fontSize + ';" UNSELECTABLE="on">' + placeholderText + '</span>';

        return html;
    }
});

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

sharedInstance = new Placeholder();

module.exports = {
    /**
     * Generate virtual placeholders
     * @param {HTMLElements|Undefined} inputElems - created 'input' elements
     * @api
     * @sample
     * tui.component.placeholder.generate();
     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
     */
    generate: function(inputElems) {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.add(inputElems);
    },

    /**
     * When 'input' element already has value, hide the virtual placeholder
     * @api
     * @sample
     * tui.component.placeholder.hide();
     */
    hide: function() {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.hidePlaceholders();
    }
};
