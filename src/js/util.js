/**
 * @fileoverview Util for placeholder
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');

var callbackPropName = function(eventType) {
    return '__cb_tui_placeholder_' + eventType + '__';
};

var hasComputedStyle = (window.getComputedStyle);

var util = {
    /**
     * Generate 'style' element and add css rule
     * @param {Object} ruleInfo - Value of selector and css property
     */
    addCssRule: function(ruleInfo) {
        var styleTag = document.createElement('style');
        var selector = ruleInfo.selector;
        var css = ruleInfo.css;
        var styleSheet;

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
     * @param {HTMLElement} target - DOM element to attach the event handler on
     * @param {string} eventType - Event type
     * @param {requestCallback} callback - Event handler function
     */
    bindEvent: function(target, eventType, callback) {
        var success = true;

        if (target.addEventListener && eventType !== 'propertychange') {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            success = false;
        }

        if (success) {
            target[callbackPropName(eventType)] = callback;
        }
    },

    /**
     * Unbind event from element
     * @param {HTMLElement} target - DOM element to detach the event handler from
     * @param {string} eventType - Event type
     */
    unbindEvent: function(target, eventType) {
        var propName = callbackPropName(eventType);
        var callback = target[propName];
        var success = true;

        if (target.removeEventListener && eventType !== 'propertychange') {
            target.removeEventListener(eventType, callback);
        } else if (target.detachEvent) {
            target.detachEvent('on' + eventType, callback);
        } else {
            success = false;
        }

        if (success) {
            try { // IE7 : 'delete' operator don't use on element
                delete target[propName];
            } catch (e) {
                target[propName] = null;
            }
        }
    },

    /**
     * Remove target items from source array and returns a new removed array.
     * @param {array} sourceItems - source array
     * @param {array} targetItems - target items
     * @returns {array} new removed array
     */
    removeArrayItems: function(sourceItems, targetItems) {
        return snippet.filter(sourceItems, function(item) {
            return snippet.inArray(item, targetItems) === -1;
        });
    },

    /**
     * Make CSSText
     * @param {Object} styleObj - Style info object
     * @returns {string} Connected string of style
     */
    makeStyleText: function(styleObj) {
        var styleStr = '';

        snippet.forEach(styleObj, function(value, prop) {
            styleStr += prop + ':' + value + ';';
        });

        return styleStr;
    },

    /**
     * Replace matched property with template
     * @param {string} template - String of template
     * @param {Object} propObj - Properties
     * @returns {string} Replaced template string
     */
    applyTemplate: function(template, propObj) {
        var newTemplate = template.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
            return propObj.hasOwnProperty(prop) ? propObj[prop] : '';
        });

        return newTemplate;
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - Current element
     * @returns {Object} Style object of element
     */
    getStyle: function(target) {
        var computedObj;

        if (hasComputedStyle) {
            computedObj = window.getComputedStyle(target, '');
        } else {
            computedObj = target.currentStyle;
        }

        return computedObj;
    },

    /**
     * Send information to google analytics
     */
    sendHostNameToGA: function() {
        var hostname = location.hostname;

        snippet.imagePing('https://www.google-analytics.com/collect', {
            v: 1,
            t: 'event',
            tid: 'UA-115377265-9',
            cid: hostname,
            dp: hostname,
            dh: 'placeholder'
        });
    },

    // export to be used by unit-test
    _callbackPropName: callbackPropName
};

module.exports = util;
