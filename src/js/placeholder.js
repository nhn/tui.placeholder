/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var util = require('./util.js');

var Placeholder, sharedInstance;
var browser = snippet.browser;
var supportIE = browser.msie && browser.version <= 11;
var otherBrowser = browser.others;
var supportPlaceholder = 'placeholder' in document.createElement('input') &&
                            'placeholder' in document.createElement('textarea');
var supportPropertychange = browser.msie && browser.version < 11;
var generatePlaceholder = supportIE || (!supportIE && !supportPlaceholder) ||
                        (otherBrowser && !supportPlaceholder);

var KEYCODE_BACK = 8;
var KEYCODE_TAB = 9;
var TARGET_TAGS = [
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
    'display': 'inline-block',
    'overflow': 'hidden'
});
var DEFAULT_STYLE = util.makeStyleText({
    'position': 'absolute',
    'overflow': 'hidden',
    'color': '#999',
    'z-index': '0'
});
var TEMPLATE = '<span style="{{style}}" UNSELECTABLE="on">{{placeholderText}}</span>';

/**
 * Placeholder Object
 * @constructor
 * @ignore
 */
Placeholder = snippet.defineClass(/** @lends Placeholder.prototype */{
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
     * @param {HTMLElement[]} selectedTargets - Selected elements for generating placeholder
     * @param {object} [options] - options
     *   @param {string} [options.wrapperClassName] - wrapper class name
     * @ignore
     */
    generateOnTargets: function(selectedTargets, options) {
        this.targets = this.targets.concat(selectedTargets);

        snippet.forEach(this.targets, function(target) {
            var placeholder = this._getPlaceholderHtml(target);

            this._attachPlaceholder(target, placeholder, options);
            this._bindEvent(target, target.previousSibling);
        }, this);
    },

    /**
     * Remove placeholders
     * @param {HTMLElement[]} selectedTargets - Selected elements for generating placeholder
     * @ignore
     */
    removeOnTargets: function(selectedTargets) {
        var removeTargets;

        if (selectedTargets) {
            removeTargets = snippet.filter(selectedTargets, function(target) {
                return snippet.inArray(target, this.targets) >= 0;
            }, this);
            this.targets = util.removeArrayItems(this.targets, removeTargets);
        } else {
            removeTargets = this.targets;
            this.targets = [];
        }

        snippet.forEach(removeTargets, function(target) {
            this._unbindEvent(target, target.previousSibling);
            this._detachPlaceholder(target);
        }, this);
    },

    /**
     * Hide placeholders
     * @param {HTMLElements} selectedTargets - Selected elements to hide placeholder
     * @ignore
     */
    hideOnTargets: function(selectedTargets) {
        snippet.forEach(selectedTargets || this.targets, function(target) {
            target.previousSibling.style.display = 'none';
        });
    },

    /**
     * Attach a new virtual placeholder after a selected 'input' element and wrap this element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {string} placeholder - HTML string of the virtual placeholder
     * @param {object} [options] - options
     *   @param {string} [options.wrapperClassName] - wrapper class name
     * @private
     */
    _attachPlaceholder: function(target, placeholder, options) {
        var wrapper = document.createElement('span');
        var parentNode = target.parentNode;

        if (options && options.wrapperClassName) {
            wrapper.className = options.wrapperClassName;
        }
        wrapper.innerHTML = placeholder;
        wrapper.style.cssText = WRAPPER_STYLE;

        parentNode.insertBefore(wrapper, target);

        wrapper.appendChild(target);
    },

    /**
     * Detach generated placeholder and restore the target to original state.
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @private
     */
    _detachPlaceholder: function(target) {
        var wrapper = target.parentNode;
        var parentNode = wrapper.parentNode;
        var placeholder = target.previousSibling;

        wrapper.removeChild(placeholder);
        parentNode.insertBefore(target, wrapper);
        parentNode.removeChild(wrapper);
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

        /**
         * Event handler
         */
        function onChange() {
            if (target.value) {
                placeholderStyle.display = 'none';
            }
        }

        util.bindEvent(placeholder, 'click', function() {
            target.focus();
        });

        if (supportPropertychange) {
            util.bindEvent(target, 'propertychange', onChange);
        } else {
            util.bindEvent(target, 'change', onChange);
        }

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
     * Unbind events from the element
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @param {HTMLElement} placeholder - The virtual placeholder element
     * @private
     */
    _unbindEvent: function(target, placeholder) {
        util.unbindEvent(target, 'keydown');
        util.unbindEvent(target, 'keyup');
        util.unbindEvent(target, 'blur');
        util.unbindEvent(placeholder, 'click');

        if (supportPropertychange) {
            util.unbindEvent(target, 'propertychange');
        } else {
            util.unbindEvent(target, 'change');
        }
    },

    /**
     * Get the virtual placeholder's html
     * @param {HTMLElement} target - The 'input' or 'textarea' element
     * @returns {string} String of virtual placeholder tag
     * @private
     */
    /* eslint-disable no-useless-escape */
    _getPlaceholderHtml: function(target) {
        var initStyle = util.getStyle(target);
        var placeholderText = target.getAttribute('placeholder');
        var hasValue = target.value !== '';
        var isInput = target.nodeName.toLowerCase() === 'input';
        var styleObj = {
            'display': hasValue ? 'none' : 'inline-block',
            'top': parseInt(initStyle.paddingTop, 10) +
                    parseInt(initStyle.borderTopWidth, 10) + 'px',
            'left': parseInt(initStyle.paddingLeft, 10) +
                    parseInt(initStyle.borderLeftWidth, 10) + 'px',
            'font-size': initStyle.fontSize,
            'font-family': initStyle.fontFamily.replace(/\"/g, '\'')
        };
        var addStyle = !isInput ? {'width': '90%'} : {'white-space': 'nowrap'};

        snippet.extend(styleObj, addStyle);

        return util.applyTemplate(TEMPLATE, {
            style: DEFAULT_STYLE + util.makeStyleText(styleObj),
            placeholderText: placeholderText
        });
    }
    /* eslint-enable no-useless-escape */
});

/**
 * Get all 'input' and 'textarea' elements on page
 * @returns {Array.<HTMLElement>} All elements
 * @ignore
 */
function getAllTargets() {
    var inputs = snippet.toArray(document.getElementsByTagName('input'));
    var textareas = snippet.toArray(document.getElementsByTagName('textarea'));

    return inputs.concat(textareas);
}

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

sharedInstance = new Placeholder();

/** @module placeholder */
module.exports = {
    /**
     * Generate virtual placeholders.
     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder
     * @param {object} [options] - options
     *   @param {string} [options.wrapperClassName] - wrapper class name
     * @function
     * @example
     * var placeholder = tui.placeholder; // require('tui-placeholder');
     *
     * placeholder.generate();
     * placeholder.generate(document.getElementsByTagName('input'));
     * placeholder.generate(document.getElementsByTagName('input'), {
     *     wrapperClassName: 'my-class-name'
     * });
     */
    generate: function(selectedTargets, options) {
        var targets;

        if (generatePlaceholder) {
            targets = selectedTargets ? snippet.toArray(selectedTargets) : getAllTargets();

            sharedInstance.generateOnTargets(snippet.filter(targets, function(target) {
                var tagName = target.nodeName.toLowerCase();
                var inputType = target.type.toLowerCase();
                var disableState = target.disabled || target.readOnly;
                var hasProp = !snippet.isNull(target.getAttribute('placeholder'));
                var enableElem = snippet.inArray(tagName, TARGET_TAGS) > -1;

                if (tagName === 'input') {
                    enableElem = snippet.inArray(inputType, INPUT_TYPES) > -1;
                }

                return hasProp && enableElem && !disableState;
            }), options);
        }
    },

    /**
     * Clear generated placeholders.
     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder
     * @function
     */
    remove: function(selectedTargets) {
        var targets;

        if (generatePlaceholder) {
            targets = selectedTargets ? snippet.toArray(selectedTargets) : null;
            sharedInstance.removeOnTargets(targets);
        }
    },

    /**
     * When 'input' or 'textarea' element already has value, hiding the virtual placeholder
     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder
     * @function
     */
    hide: function(selectedTargets) {
        var targets;

        if (generatePlaceholder) {
            targets = selectedTargets ? snippet.toArray(selectedTargets) : null;
            sharedInstance.hideOnTargets(targets);
        }
    }
};
