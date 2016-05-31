/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var Placeholder, sharedInstance;
var browser = tui.util.browser;
var isSupportPlaceholder = 'placeholder' in document.createElement('input') &&
                        !(browser.msie && browser.version <= 11);

var KEYCODE_BACK = 8;
var KEYCODE_TAB = 9;
var ENABLE_TAGS = [
    'input',
    'textarea'
];
var INPUT_TYPES = [
    'text',
    'password',
    'email',
    'tel',
    'number',
    'url',
    'search'
];
var WRAPPER_STYLE = util.makeStyleText({
    'position': 'relative',
    'line-height': 'inherit'
});
var DEFAULT_STYLE = util.makeStyleText({
    'position': 'absolute',
    'left': '0',
    'width': '90%',
    'overflow': 'hidden',
    'white-space': 'nowrap',
    'text-overflow': 'ellipsis',
    '*display': 'inline',
    'zoom': '1',
    'color': '#aaa',
    'line-height': '1.2',
    'z-index': '0'
});
var TEMPLATE = '<span style="{{style}}" UNSELECTABLE="on">{{placeholderText}}</span>';

/**
 * Placeholder Object
 * @constructor
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed 'input' and 'textarea' elements on page
         * @type {Array}
         * @private
         */
        this.targets = [];
    },

    /**
     * Generate placeholders
     * @param {HTMLElements} selectedTargets - Selected elements for generating placeholder
     */
    generateOnTargets: function(selectedTargets) {
        this.targets = this.targets.concat(selectedTargets);

        tui.util.forEach(this.targets, function(target) {
            var placeholder = this._getPlaceholderHtml(target);

            this._attachPlaceholder(target, placeholder);
            this._bindEvent(target, target.previousSibling);
        }, this);
    },

    /**
     * Hide placeholders on 'input' or 'textarea' element that already has value
     * @param {HTMLElements} selectedTargets - Selected elements to hide placeholder
     */
    hideOnTargets: function(selectedTargets) {
        tui.util.forEach(selectedTargets, function(target) {
            target.previousSibling.style.display = 'none';
        });
    },

    /**
     * Attach a new virtual placeholder after a selected 'input' element and wrap this element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {string} placeholder - HTML string of the virtual placeholder
     * @private
     */
    _attachPlaceholder: function(target, placeholder) {
        var wrapper = document.createElement('span');
        var parentNode = target.parentNode;

        parentNode.insertBefore(wrapper, target);

        wrapper.innerHTML = placeholder;
        wrapper.style.cssText = WRAPPER_STYLE;
        wrapper.appendChild(target);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {HTMLElement} placeholder - The virtual placeholder element
     * @private
     */
    _bindEvent: function(target, placeholder) {
        var placeholderStyle = placeholder.style;

        /**
         * Event handler
         */
        function onKeyup() {
            if (target.value === '') {
                placeholderStyle.display = 'inline-block';
            }
        }

        util.bindEvent(placeholder, 'click', function() {
            target.focus();
        });

        util.bindEvent(target, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB ||
                (e.shiftKey && keyCode === KEYCODE_TAB))) {
                placeholderStyle.display = 'none';
            }
        });

        util.bindEvent(target, 'keyup', onKeyup);
        util.bindEvent(target, 'blur', onKeyup);
    },

    /**
     * Get the virtual placeholder's html
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @returns {string} String of virtual placeholder tag
     * @private
     */
    _getPlaceholderHtml: function(target) {
        var initStyle = util.getStyle(target);
        var placeholderText = target.getAttribute('placeholder');
        var hasValue = target.value !== '';
        var isInput = target.nodeName.toLowerCase() === 'input';
        var styleObj = {
            'display': hasValue ? 'none' : 'inline-block',
            'margin-top': (isInput ? -(parseFloat(initStyle.fontSize, 10) / 2) - 1 : 0) + 'px',
            'padding-left': initStyle.paddingLeft,
            'font-size': initStyle.fontSize,
            'font-family': initStyle.fontFamily
        };

        if (isInput) {
            styleObj.top = '50%';
        }

        return util.replaceTemplate(TEMPLATE, {
            style: DEFAULT_STYLE + util.makeStyleText(styleObj),
            placeholderText: placeholderText
        });
    }
});

/**
 * Get all 'input' and 'textarea' elements on page
 * @returns {Array.<HTMLElement>} All elements
 */
function getAllTargets() {
    var inputs = tui.util.toArray(document.getElementsByTagName('input'));
    var textareas = tui.util.toArray(document.getElementsByTagName('textarea'));

    return inputs.concat(textareas);
}

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

sharedInstance = new Placeholder();

module.exports = {
    /**
     * Generate virtual placeholders
     * @param {HTMLElements} [selectedTargets] - created elements
     * @memberof tui.component.placeholder
     * @function
     * @api
     * @example
     * tui.component.placeholder.generate();
     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
     */
    generate: function(selectedTargets) {
        var targets;

        if (isSupportPlaceholder) {
            return;
        }

        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : getAllTargets();

        sharedInstance.generateOnTargets(tui.util.filter(targets, function(target) {
            var tagName = target.nodeName.toLowerCase();
            var inputType = target.type.toLowerCase();
            var disableState = target.disabled || target.readOnly;
            var hasProp = !tui.util.isNull(target.getAttribute('placeholder'));
            var enableElem = tui.util.inArray(tagName, ENABLE_TAGS) > -1;

            if (tagName === 'input') {
                enableElem = tui.util.inArray(inputType, INPUT_TYPES) > -1;
            }

            return hasProp && enableElem && !disableState;
        }));
    },

    /**
     * When 'input' or 'textarea' element already has value, hiding the virtual placeholder
     * @memberof tui.component.placeholder
     * @function
     * @api
     * @example
     * tui.component.placeholder.hideOnInputHavingValue();
     */
    hideOnInputHavingValue: function() {
        if (isSupportPlaceholder) {
            return;
        }

        sharedInstance.hideOnTargets(tui.util.filter(sharedInstance.targets, function(target) {
            return (target.value !== '' && target.type !== INPUT_TYPES[1]);
        }));
    }
};
