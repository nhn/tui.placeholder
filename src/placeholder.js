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
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed 'input' elements in the current page
         * @type {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * Get all 'input' elements
     * @returns {HTMLElements} All 'input' elements
     */
    getAllInputElems: function() {
        return this._inputElems;
    },

    /**
     * Add elements in array
     * @param {HTMLElements} inputElems - Selected 'input' elements for generating placeholder
     */
    generatePlaceholders: function(inputElems) {
        this._inputElems = this._inputElems.concat(inputElems);

        tui.util.forEach(inputElems, this._attachPlaceholder, this);
    },

    /**
     * Hide placeholder on 'input' element that has already value
     * @param {HTMLElements} inputElems - Selected 'input' elements for hiding placeholder
     */
    hidePlaceholders: function(inputElems) {
        tui.util.forEach(inputElems, function(elem) {
            var placeholder = elem.parentNode.getElementsByTagName('span')[0];

            placeholder.style.display = 'none';
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
    _attachPlaceholder: function(target, index) {
        var initStyle = this._getInitStyle(target);
        var wrapTag = document.createElement('span');
        var placeholder = target.getAttribute('placeholder');
        var parentNode = target.parentNode;
        var cloneNode = target.cloneNode();
        var hasValue = target.value !== '';

        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, hasValue);
        wrapTag.appendChild(cloneNode);

        parentNode.insertBefore(wrapTag, target.nextSibling);
        parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._inputElems[index] = cloneNode;

        this._bindEvent(wrapTag);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The wrapper tag of the 'input' element
     * @private
     */
    _bindEvent: function(target) {
        var inputElem = target.getElementsByTagName('input')[0];
        var spanElem = target.getElementsByTagName('span')[0];
        var spanStyle = spanElem.style;

        /**
         * Event handler
         */
        function onKeyup() {
            if (inputElem.value === '') {
                spanStyle.display = 'inline-block';
            }
        }

        util.bindEvent(spanElem, 'click', function() {
            inputElem.focus();
        });

        util.bindEvent(inputElem, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB ||
                (e.shiftKey && keyCode === KEYCODE_TAB))) {
                spanStyle.display = 'none';
            }
        });

        util.bindEvent(inputElem, 'keyup', onKeyup);
        util.bindEvent(inputElem, 'blur', onKeyup);
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
     * @example
     * tui.component.placeholder.generate();
     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
     */
    generate: function(inputElems) {
        var selectedElems;

        if (isSupportPlaceholder) {
            return;
        }

        selectedElems = tui.util.toArray(inputElems || document.getElementsByTagName('input'));

        sharedInstance.generatePlaceholders(tui.util.filter(selectedElems, function(elem) {
            var type = elem.type.toLowerCase();
            var diableState = elem.disabled;
            var readonlyState = elem.readOnly;

            return (tui.util.inArray(type, INPUT_TYPES) > -1 &&
                    elem.getAttribute('placeholder') &&
                    !(diableState || readonlyState));
        }));
    },

    /**
     * When 'input' element already has value, hide the virtual placeholder
     * @api
     * @example
     * tui.component.placeholder.hideOnInputHavingValue();
     */
    hideOnInputHavingValue: function() {
        var inputElems;

        if (isSupportPlaceholder) {
            return;
        }

        inputElems = sharedInstance.getAllInputElems();

        sharedInstance.hidePlaceholders(tui.util.filter(inputElems, function(elem) {
            return (elem.value !== '' && elem.type !== INPUT_TYPES[1]);
        }));
    },

    /**
     * Reset 'input' elements array (method for testcase)
     * @api
     * @example
     * tui.component.placeholder.reset();
     */
    reset: function() {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.getAllInputElems().length = 0;
    }
};
