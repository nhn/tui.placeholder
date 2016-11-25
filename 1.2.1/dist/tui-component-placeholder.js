/*!
 * tui-component-placeholder.js
 * @version 1.2.1
 * @author NHNEnt FE Development Lab <dl_javascript@nhnent.com>
 * @license MIT
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	/** @namespace tui.component.placeholder */
	tui.util.defineNamespace('tui.component.placeholder', __webpack_require__(1));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature
	 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
	 */
	'use strict';
	
	var util = __webpack_require__(2);
	
	var Placeholder, sharedInstance;
	var browser = tui.util.browser;
	var isSupportPlaceholder = 'placeholder' in document.createElement('input') &&
	                            'placeholder' in document.createElement('textarea');
	var isIE = !(browser.msie && browser.version <= 11);
	var isSupportPropertychange = (browser.msie && browser.version < 11);
	
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
	     * @param {HTMLElement[]} selectedTargets - Selected elements for generating placeholder
	     * @param {object} [options] - options
	     *   @param {string} [options.wrapperClassName] - wrapper class name
	     * @ignore
	     */
	    generateOnTargets: function(selectedTargets, options) {
	        this.targets = this.targets.concat(selectedTargets);
	
	        tui.util.forEach(this.targets, function(target) {
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
	    remove: function(selectedTargets) {
	        var removeTargets;
	
	        if (selectedTargets) {
	            removeTargets = tui.util.filter(selectedTargets, function(target) {
	                return tui.util.inArray(target, this.targets) >= 0;
	            }, this);
	            this.targets = util.removeArrayItems(this.targets, removeTargets);
	        } else {
	            removeTargets = this.targets;
	            this.targets = [];
	        }
	
	        tui.util.forEach(removeTargets, function(target) {
	            this._unbindEvent(target, target.previousSibling);
	            this._detachPlaceholder(target);
	        }, this);
	    },
	
	    /**
	     * Hide placeholders on 'input' or 'textarea' element that already has value
	     * @param {HTMLElements} selectedTargets - Selected elements to hide placeholder
	     * @ignore
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
	
	        if (isSupportPropertychange) {
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
	
	        if (isSupportPropertychange) {
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
	
	        tui.util.extend(styleObj, addStyle);
	
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
	     * Generate virtual placeholders.
	     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder
	     * @param {object} [options] - options
	     *   @param {string} [options.wrapperClassName] - wrapper class name
	     * @memberof tui.component.placeholder
	     * @function
	     * @api
	     * @example
	     * tui.component.placeholder.generate();
	     * tui.component.placeholder.generate(document.getElementsByTagName('input'));
	     * tui.component.placeholder.generate(document.getElementsByTagName('input'), {
	     *     wrapperClassName: 'my-class-name'
	     * });
	     */
	    generate: function(selectedTargets, options) {
	        var targets;
	
	        if (isSupportPlaceholder && isIE) {
	            return;
	        }
	
	        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : getAllTargets();
	
	        sharedInstance.generateOnTargets(tui.util.filter(targets, function(target) {
	            var tagName = target.nodeName.toLowerCase();
	            var inputType = target.type.toLowerCase();
	            var disableState = target.disabled || target.readOnly;
	            var hasProp = !tui.util.isNull(target.getAttribute('placeholder'));
	            var enableElem = tui.util.inArray(tagName, TARGET_TAGS) > -1;
	
	            if (tagName === 'input') {
	                enableElem = tui.util.inArray(inputType, INPUT_TYPES) > -1;
	            }
	
	            return hasProp && enableElem && !disableState;
	        }), options);
	    },
	
	    /**
	     * Clear generated placeholders.
	     * @memberof tui.component.placeholder
	     * @function
	     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder
	     */
	    remove: function(selectedTargets) {
	        var targets;
	
	        if (isSupportPlaceholder && isIE) {
	            return;
	        }
	
	        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : null;
	        sharedInstance.remove(targets);
	    },
	
	    /**
	     * When 'input' or 'textarea' element already has value, hiding the virtual placeholder
	     * @memberof tui.component.placeholder
	     * @function
	     * @example
	     * tui.component.placeholder.hideOnInputHavingValue();
	     */
	    hideOnInputHavingValue: function() {
	        if (isSupportPlaceholder && isIE) {
	            return;
	        }
	
	        sharedInstance.hideOnTargets(tui.util.filter(sharedInstance.targets, function(target) {
	            return (target.value !== '' && target.type !== INPUT_TYPES[1]);
	        }));
	    }
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
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
	        var callback = target[callbackPropName(eventType)];
	        var success = true;
	
	        if (target.removeEventListener && eventType !== 'propertychange') {
	            target.removeEventListener(eventType, callback);
	        } else if (target.detachEvent) {
	            target.detachEvent('on' + eventType, callback);
	        } else {
	            success = false;
	        }
	
	        if (success) {
	            delete target[callbackPropName(eventType)];
	        }
	    },
	
	    /**
	     * Remove target items from source array and returns a new removed array.
	     * @param {array} sourceItems - source array
	     * @param {array} targetItems - target items
	     * @returns {array} new removed array
	     */
	    removeArrayItems: function(sourceItems, targetItems) {
	        return tui.util.filter(sourceItems, function(item) {
	            return tui.util.inArray(item, targetItems) === -1;
	        });
	    },
	
	    /**
	     * Make CSSText
	     * @param {Object} styleObj - Style info object
	     * @returns {string} Connected string of style
	     */
	    makeStyleText: function(styleObj) {
	        var styleStr = '';
	
	        tui.util.forEach(styleObj, function(value, prop) {
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
	
	    // export to be used by unit-test
	    _callbackPropName: callbackPropName
	};
	
	module.exports = util;


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZTdlNzBlY2RlYmQ5MzM2NWM2MzEiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9wbGFjZWhvbGRlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3RDQTtBQUNBO0FBQ0E7Ozs7Ozs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNELGdDQUErQixPQUFPLHNCQUFzQixpQkFBaUI7O0FBRTdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxnQkFBZSxjQUFjO0FBQzdCLGdCQUFlLE9BQU87QUFDdEIsa0JBQWlCLE9BQU87QUFDeEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7O0FBRUw7QUFDQTtBQUNBLGdCQUFlLGNBQWM7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYTtB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Q1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFLOztBQUVMO0FBQ0E7QUFDQSxnQkFBZSxZQUFZO0FBQzNCLGdCQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7O0FBRUw7QUFDQTtBQUNBLGdCQUFlLE1BQU07QUFDckIsZ0JBQWUsTUFBTTtBQUNyQixrQkFBaUIsTUFBTTtBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVCxNQUFLOztBQUVMO0FBQ0E7QUFDQSxnQkFBZSxPQUFPO0FBQ3RCLGtCQUFpQixPQUFPO0FBQ3hCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdEQUErQztBQUMvQyxVQUFTOztBQUVUO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsZ0JBQWUsT0FBTztBQUN0QixnQkFBZSxPQUFPO0FBQ3RCLGtCQUFpQixPQUFPO0FBQ3hCO0FBQ0E7QUFDQSwrQ0FBOEMsRUFBRSxPQUFPLEVBQUU7QUFDekQ7QUFDQSxVQUFTOztBQUVUO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0EsZ0JBQWUsWUFBWTtBQUMzQixrQkFBaUIsT0FBTztBQUN4QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0EsTUFBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUEiLCJmaWxlIjoidHVpLWNvbXBvbmVudC1wbGFjZWhvbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcImRpc3RcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBlN2U3MGVjZGViZDkzMzY1YzYzMSIsIid1c2Ugc3RyaWN0Jztcbi8qKiBAbmFtZXNwYWNlIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIgKi9cbnR1aS51dGlsLmRlZmluZU5hbWVzcGFjZSgndHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcicsIHJlcXVpcmUoJy4vcGxhY2Vob2xkZXIuanMnKSk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgR2VuZXJhdGUgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIgb24gYnJvd3NlcnMgaXNuJ3Qgc3VwcG9ydGVkIHBsYWNlaG9sZGVyIGZlYXR1cmVcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXIsIHNoYXJlZEluc3RhbmNlO1xudmFyIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyO1xudmFyIGlzU3VwcG9ydFBsYWNlaG9sZGVyID0gJ3BsYWNlaG9sZGVyJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BsYWNlaG9sZGVyJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpO1xudmFyIGlzSUUgPSAhKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPD0gMTEpO1xudmFyIGlzU3VwcG9ydFByb3BlcnR5Y2hhbmdlID0gKGJyb3dzZXIubXNpZSAmJiBicm93c2VyLnZlcnNpb24gPCAxMSk7XG5cbnZhciBLRVlDT0RFX0JBQ0sgPSA4O1xudmFyIEtFWUNPREVfVEFCID0gOTtcbnZhciBUQVJHRVRfVEFHUyA9IFtcbiAgICAnaW5wdXQnLFxuICAgICd0ZXh0YXJlYSdcbl07XG52YXIgSU5QVVRfVFlQRVMgPSBbXG4gICAgJ3RleHQnLFxuICAgICdwYXNzd29yZCcsXG4gICAgJ2VtYWlsJyxcbiAgICAndGVsJyxcbiAgICAnbnVtYmVyJyxcbiAgICAndXJsJyxcbiAgICAnc2VhcmNoJ1xuXTtcbnZhciBXUkFQUEVSX1NUWUxFID0gdXRpbC5tYWtlU3R5bGVUZXh0KHtcbiAgICAncG9zaXRpb24nOiAncmVsYXRpdmUnLFxuICAgICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaycsXG4gICAgJ292ZXJmbG93JzogJ2hpZGRlbidcbn0pO1xudmFyIERFRkFVTFRfU1RZTEUgPSB1dGlsLm1ha2VTdHlsZVRleHQoe1xuICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXG4gICAgJ292ZXJmbG93JzogJ2hpZGRlbicsXG4gICAgJ2NvbG9yJzogJyM5OTknLFxuICAgICd6LWluZGV4JzogJzAnXG59KTtcbnZhciBURU1QTEFURSA9ICc8c3BhbiBzdHlsZT1cInt7c3R5bGV9fVwiIFVOU0VMRUNUQUJMRT1cIm9uXCI+e3twbGFjZWhvbGRlclRleHR9fTwvc3Bhbj4nO1xuXG4vKipcbiAqIFBsYWNlaG9sZGVyIE9iamVjdFxuICogQGNvbnN0cnVjdG9yXG4gKiBAaWdub3JlXG4gKi9cblBsYWNlaG9sZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbGFjZWhvbGRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBwdXNoZWQgJ2lucHV0JyBhbmQgJ3RleHRhcmVhJyBlbGVtZW50cyBvbiBwYWdlXG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMudGFyZ2V0cyA9IFtdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBwbGFjZWhvbGRlcnNcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IHNlbGVjdGVkVGFyZ2V0cyAtIFNlbGVjdGVkIGVsZW1lbnRzIGZvciBnZW5lcmF0aW5nIHBsYWNlaG9sZGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIG9wdGlvbnNcbiAgICAgKiAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy53cmFwcGVyQ2xhc3NOYW1lXSAtIHdyYXBwZXIgY2xhc3MgbmFtZVxuICAgICAqIEBpZ25vcmVcbiAgICAgKi9cbiAgICBnZW5lcmF0ZU9uVGFyZ2V0czogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMudGFyZ2V0cyA9IHRoaXMudGFyZ2V0cy5jb25jYXQoc2VsZWN0ZWRUYXJnZXRzKTtcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMudGFyZ2V0cywgZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgcGxhY2Vob2xkZXIgPSB0aGlzLl9nZXRQbGFjZWhvbGRlckh0bWwodGFyZ2V0KTtcblxuICAgICAgICAgICAgdGhpcy5fYXR0YWNoUGxhY2Vob2xkZXIodGFyZ2V0LCBwbGFjZWhvbGRlciwgb3B0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLl9iaW5kRXZlbnQodGFyZ2V0LCB0YXJnZXQucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBwbGFjZWhvbGRlcnNcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IHNlbGVjdGVkVGFyZ2V0cyAtIFNlbGVjdGVkIGVsZW1lbnRzIGZvciBnZW5lcmF0aW5nIHBsYWNlaG9sZGVyXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzKSB7XG4gICAgICAgIHZhciByZW1vdmVUYXJnZXRzO1xuXG4gICAgICAgIGlmIChzZWxlY3RlZFRhcmdldHMpIHtcbiAgICAgICAgICAgIHJlbW92ZVRhcmdldHMgPSB0dWkudXRpbC5maWx0ZXIoc2VsZWN0ZWRUYXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHVpLnV0aWwuaW5BcnJheSh0YXJnZXQsIHRoaXMudGFyZ2V0cykgPj0gMDtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy50YXJnZXRzID0gdXRpbC5yZW1vdmVBcnJheUl0ZW1zKHRoaXMudGFyZ2V0cywgcmVtb3ZlVGFyZ2V0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW1vdmVUYXJnZXRzID0gdGhpcy50YXJnZXRzO1xuICAgICAgICAgICAgdGhpcy50YXJnZXRzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHJlbW92ZVRhcmdldHMsIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy5fdW5iaW5kRXZlbnQodGFyZ2V0LCB0YXJnZXQucHJldmlvdXNTaWJsaW5nKTtcbiAgICAgICAgICAgIHRoaXMuX2RldGFjaFBsYWNlaG9sZGVyKHRhcmdldCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIaWRlIHBsYWNlaG9sZGVycyBvbiAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIHZhbHVlXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudHN9IHNlbGVjdGVkVGFyZ2V0cyAtIFNlbGVjdGVkIGVsZW1lbnRzIHRvIGhpZGUgcGxhY2Vob2xkZXJcbiAgICAgKiBAaWdub3JlXG4gICAgICovXG4gICAgaGlkZU9uVGFyZ2V0czogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzKSB7XG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc2VsZWN0ZWRUYXJnZXRzLCBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICAgIHRhcmdldC5wcmV2aW91c1NpYmxpbmcuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhIG5ldyB2aXJ0dWFsIHBsYWNlaG9sZGVyIGFmdGVyIGEgc2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50IGFuZCB3cmFwIHRoaXMgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwbGFjZWhvbGRlciAtIEhUTUwgc3RyaW5nIG9mIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIG9wdGlvbnNcbiAgICAgKiAgIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy53cmFwcGVyQ2xhc3NOYW1lXSAtIHdyYXBwZXIgY2xhc3MgbmFtZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaFBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQsIHBsYWNlaG9sZGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICB2YXIgcGFyZW50Tm9kZSA9IHRhcmdldC5wYXJlbnROb2RlO1xuXG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMud3JhcHBlckNsYXNzTmFtZSkge1xuICAgICAgICAgICAgd3JhcHBlci5jbGFzc05hbWUgPSBvcHRpb25zLndyYXBwZXJDbGFzc05hbWU7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcHBlci5pbm5lckhUTUwgPSBwbGFjZWhvbGRlcjtcbiAgICAgICAgd3JhcHBlci5zdHlsZS5jc3NUZXh0ID0gV1JBUFBFUl9TVFlMRTtcblxuICAgICAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwcGVyLCB0YXJnZXQpO1xuXG4gICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGV0YWNoIGdlbmVyYXRlZCBwbGFjZWhvbGRlciBhbmQgcmVzdG9yZSB0aGUgdGFyZ2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHRhcmdldCAtIFRoZSAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2RldGFjaFBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSB3cmFwcGVyLnBhcmVudE5vZGU7XG4gICAgICAgIHZhciBwbGFjZWhvbGRlciA9IHRhcmdldC5wcmV2aW91c1NpYmxpbmc7XG5cbiAgICAgICAgd3JhcHBlci5yZW1vdmVDaGlsZChwbGFjZWhvbGRlcik7XG4gICAgICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhcmdldCwgd3JhcHBlcik7XG4gICAgICAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQod3JhcHBlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzIG9uIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgb3IgJ3RleHRhcmVhJyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGxhY2Vob2xkZXIgLSBUaGUgdmlydHVhbCBwbGFjZWhvbGRlciBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfYmluZEV2ZW50OiBmdW5jdGlvbih0YXJnZXQsIHBsYWNlaG9sZGVyKSB7XG4gICAgICAgIHZhciBwbGFjZWhvbGRlclN0eWxlID0gcGxhY2Vob2xkZXIuc3R5bGU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV2ZW50IGhhbmRsZXJcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5dXAoKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0LnZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEV2ZW50IGhhbmRsZXJcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG9uQ2hhbmdlKCkge1xuICAgICAgICAgICAgaWYgKHRhcmdldC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyU3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHBsYWNlaG9sZGVyLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRhcmdldC5mb2N1cygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaXNTdXBwb3J0UHJvcGVydHljaGFuZ2UpIHtcbiAgICAgICAgICAgIHV0aWwuYmluZEV2ZW50KHRhcmdldCwgJ3Byb3BlcnR5Y2hhbmdlJywgb25DaGFuZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRpbC5iaW5kRXZlbnQodGFyZ2V0LCAnY2hhbmdlJywgb25DaGFuZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQodGFyZ2V0LCAna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBrZXlDb2RlID0gZS53aGljaCB8fCBlLmtleUNvZGU7XG5cbiAgICAgICAgICAgIGlmICghKGtleUNvZGUgPT09IEtFWUNPREVfQkFDSyB8fCBrZXlDb2RlID09PSBLRVlDT0RFX1RBQiB8fFxuICAgICAgICAgICAgICAgIChlLnNoaWZ0S2V5ICYmIGtleUNvZGUgPT09IEtFWUNPREVfVEFCKSkpIHtcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlclN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHRhcmdldCwgJ2tleXVwJywgb25LZXl1cCk7XG4gICAgICAgIHV0aWwuYmluZEV2ZW50KHRhcmdldCwgJ2JsdXInLCBvbktleXVwKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIGV2ZW50cyBmcm9tIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgb3IgJ3RleHRhcmVhJyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGxhY2Vob2xkZXIgLSBUaGUgdmlydHVhbCBwbGFjZWhvbGRlciBlbGVtZW50XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfdW5iaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgcGxhY2Vob2xkZXIpIHtcbiAgICAgICAgdXRpbC51bmJpbmRFdmVudCh0YXJnZXQsICdrZXlkb3duJyk7XG4gICAgICAgIHV0aWwudW5iaW5kRXZlbnQodGFyZ2V0LCAna2V5dXAnKTtcbiAgICAgICAgdXRpbC51bmJpbmRFdmVudCh0YXJnZXQsICdibHVyJyk7XG4gICAgICAgIHV0aWwudW5iaW5kRXZlbnQocGxhY2Vob2xkZXIsICdjbGljaycpO1xuXG4gICAgICAgIGlmIChpc1N1cHBvcnRQcm9wZXJ0eWNoYW5nZSkge1xuICAgICAgICAgICAgdXRpbC51bmJpbmRFdmVudCh0YXJnZXQsICdwcm9wZXJ0eWNoYW5nZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRpbC51bmJpbmRFdmVudCh0YXJnZXQsICdjaGFuZ2UnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIncyBodG1sXG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgb3IgJ3RleHRhcmVhJyBlbGVtZW50XG4gICAgICogQHJldHVybnMge3N0cmluZ30gU3RyaW5nIG9mIHZpcnR1YWwgcGxhY2Vob2xkZXIgdGFnXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11c2VsZXNzLWVzY2FwZSAqL1xuICAgIF9nZXRQbGFjZWhvbGRlckh0bWw6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB2YXIgaW5pdFN0eWxlID0gdXRpbC5nZXRTdHlsZSh0YXJnZXQpO1xuICAgICAgICB2YXIgcGxhY2Vob2xkZXJUZXh0ID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKTtcbiAgICAgICAgdmFyIGhhc1ZhbHVlID0gdGFyZ2V0LnZhbHVlICE9PSAnJztcbiAgICAgICAgdmFyIGlzSW5wdXQgPSB0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lucHV0JztcbiAgICAgICAgdmFyIHN0eWxlT2JqID0ge1xuICAgICAgICAgICAgJ2Rpc3BsYXknOiBoYXNWYWx1ZSA/ICdub25lJyA6ICdpbmxpbmUtYmxvY2snLFxuICAgICAgICAgICAgJ3RvcCc6IHBhcnNlSW50KGluaXRTdHlsZS5wYWRkaW5nVG9wLCAxMCkgK1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChpbml0U3R5bGUuYm9yZGVyVG9wV2lkdGgsIDEwKSArICdweCcsXG4gICAgICAgICAgICAnbGVmdCc6IHBhcnNlSW50KGluaXRTdHlsZS5wYWRkaW5nTGVmdCwgMTApICtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoaW5pdFN0eWxlLmJvcmRlckxlZnRXaWR0aCwgMTApICsgJ3B4JyxcbiAgICAgICAgICAgICdmb250LXNpemUnOiBpbml0U3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICAnZm9udC1mYW1pbHknOiBpbml0U3R5bGUuZm9udEZhbWlseS5yZXBsYWNlKC9cXFwiL2csICdcXCcnKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgYWRkU3R5bGUgPSAhaXNJbnB1dCA/IHsnd2lkdGgnOiAnOTAlJ30gOiB7J3doaXRlLXNwYWNlJzogJ25vd3JhcCd9O1xuXG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChzdHlsZU9iaiwgYWRkU3R5bGUpO1xuXG4gICAgICAgIHJldHVybiB1dGlsLmFwcGx5VGVtcGxhdGUoVEVNUExBVEUsIHtcbiAgICAgICAgICAgIHN0eWxlOiBERUZBVUxUX1NUWUxFICsgdXRpbC5tYWtlU3R5bGVUZXh0KHN0eWxlT2JqKSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dDogcGxhY2Vob2xkZXJUZXh0XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVzZWxlc3MtZXNjYXBlICovXG59KTtcblxuLyoqXG4gKiBHZXQgYWxsICdpbnB1dCcgYW5kICd0ZXh0YXJlYScgZWxlbWVudHMgb24gcGFnZVxuICogQHJldHVybnMge0FycmF5LjxIVE1MRWxlbWVudD59IEFsbCBlbGVtZW50c1xuICogQGlnbm9yZVxuICovXG5mdW5jdGlvbiBnZXRBbGxUYXJnZXRzKCkge1xuICAgIHZhciBpbnB1dHMgPSB0dWkudXRpbC50b0FycmF5KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbnB1dCcpKTtcbiAgICB2YXIgdGV4dGFyZWFzID0gdHVpLnV0aWwudG9BcnJheShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGV4dGFyZWEnKSk7XG5cbiAgICByZXR1cm4gaW5wdXRzLmNvbmNhdCh0ZXh0YXJlYXMpO1xufVxuXG5pZiAoYnJvd3Nlci5tc2llICYmIChicm93c2VyLnZlcnNpb24gPiA5ICYmIGJyb3dzZXIudmVyc2lvbiA8PSAxMSkpIHtcbiAgICB1dGlsLmFkZENzc1J1bGUoe1xuICAgICAgICBzZWxlY3RvcjogJzotbXMtaW5wdXQtcGxhY2Vob2xkZXInLFxuICAgICAgICBjc3M6ICdjb2xvcjojZmZmICFpbXBvcnRhbnQ7dGV4dC1pbmRlbnQ6LTk5OTlweDsnXG4gICAgfSk7XG59XG5cbnNoYXJlZEluc3RhbmNlID0gbmV3IFBsYWNlaG9sZGVyKCk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHZpcnR1YWwgcGxhY2Vob2xkZXJzLlxuICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb258SFRNTEVsZW1lbnRbXX0gc2VsZWN0ZWRUYXJnZXRzIC0gU2VsZWN0ZWQgZWxlbWVudHMgZm9yIGdlbmVyYXRpbmcgcGxhY2Vob2xkZXJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gb3B0aW9uc1xuICAgICAqICAgQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLndyYXBwZXJDbGFzc05hbWVdIC0gd3JhcHBlciBjbGFzcyBuYW1lXG4gICAgICogQG1lbWJlcm9mIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXJcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAYXBpXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiB0dWkuY29tcG9uZW50LnBsYWNlaG9sZGVyLmdlbmVyYXRlKCk7XG4gICAgICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlci5nZW5lcmF0ZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlci5nZW5lcmF0ZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSwge1xuICAgICAqICAgICB3cmFwcGVyQ2xhc3NOYW1lOiAnbXktY2xhc3MtbmFtZSdcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBnZW5lcmF0ZTogZnVuY3Rpb24oc2VsZWN0ZWRUYXJnZXRzLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciB0YXJnZXRzO1xuXG4gICAgICAgIGlmIChpc1N1cHBvcnRQbGFjZWhvbGRlciAmJiBpc0lFKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0YXJnZXRzID0gKHNlbGVjdGVkVGFyZ2V0cykgPyB0dWkudXRpbC50b0FycmF5KHNlbGVjdGVkVGFyZ2V0cykgOiBnZXRBbGxUYXJnZXRzKCk7XG5cbiAgICAgICAgc2hhcmVkSW5zdGFuY2UuZ2VuZXJhdGVPblRhcmdldHModHVpLnV0aWwuZmlsdGVyKHRhcmdldHMsIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICAgICAgdmFyIHRhZ05hbWUgPSB0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIHZhciBpbnB1dFR5cGUgPSB0YXJnZXQudHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgdmFyIGRpc2FibGVTdGF0ZSA9IHRhcmdldC5kaXNhYmxlZCB8fCB0YXJnZXQucmVhZE9ubHk7XG4gICAgICAgICAgICB2YXIgaGFzUHJvcCA9ICF0dWkudXRpbC5pc051bGwodGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSk7XG4gICAgICAgICAgICB2YXIgZW5hYmxlRWxlbSA9IHR1aS51dGlsLmluQXJyYXkodGFnTmFtZSwgVEFSR0VUX1RBR1MpID4gLTE7XG5cbiAgICAgICAgICAgIGlmICh0YWdOYW1lID09PSAnaW5wdXQnKSB7XG4gICAgICAgICAgICAgICAgZW5hYmxlRWxlbSA9IHR1aS51dGlsLmluQXJyYXkoaW5wdXRUeXBlLCBJTlBVVF9UWVBFUykgPiAtMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGhhc1Byb3AgJiYgZW5hYmxlRWxlbSAmJiAhZGlzYWJsZVN0YXRlO1xuICAgICAgICB9KSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGdlbmVyYXRlZCBwbGFjZWhvbGRlcnMuXG4gICAgICogQG1lbWJlcm9mIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXJcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufEhUTUxFbGVtZW50W119IHNlbGVjdGVkVGFyZ2V0cyAtIFNlbGVjdGVkIGVsZW1lbnRzIGZvciBnZW5lcmF0aW5nIHBsYWNlaG9sZGVyXG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihzZWxlY3RlZFRhcmdldHMpIHtcbiAgICAgICAgdmFyIHRhcmdldHM7XG5cbiAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyICYmIGlzSUUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldHMgPSAoc2VsZWN0ZWRUYXJnZXRzKSA/IHR1aS51dGlsLnRvQXJyYXkoc2VsZWN0ZWRUYXJnZXRzKSA6IG51bGw7XG4gICAgICAgIHNoYXJlZEluc3RhbmNlLnJlbW92ZSh0YXJnZXRzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogV2hlbiAnaW5wdXQnIG9yICd0ZXh0YXJlYScgZWxlbWVudCBhbHJlYWR5IGhhcyB2YWx1ZSwgaGlkaW5nIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyXG4gICAgICogQG1lbWJlcm9mIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXJcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIHR1aS5jb21wb25lbnQucGxhY2Vob2xkZXIuaGlkZU9uSW5wdXRIYXZpbmdWYWx1ZSgpO1xuICAgICAqL1xuICAgIGhpZGVPbklucHV0SGF2aW5nVmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNTdXBwb3J0UGxhY2Vob2xkZXIgJiYgaXNJRSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hhcmVkSW5zdGFuY2UuaGlkZU9uVGFyZ2V0cyh0dWkudXRpbC5maWx0ZXIoc2hhcmVkSW5zdGFuY2UudGFyZ2V0cywgZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gKHRhcmdldC52YWx1ZSAhPT0gJycgJiYgdGFyZ2V0LnR5cGUgIT09IElOUFVUX1RZUEVTWzFdKTtcbiAgICAgICAgfSkpO1xuICAgIH1cbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9wbGFjZWhvbGRlci5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsYmFja1Byb3BOYW1lID0gZnVuY3Rpb24oZXZlbnRUeXBlKSB7XG4gICAgcmV0dXJuICdfX2NiX3R1aV9wbGFjZWhvbGRlcl8nICsgZXZlbnRUeXBlICsgJ19fJztcbn07XG5cbnZhciBoYXNDb21wdXRlZFN0eWxlID0gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKTtcblxudmFyIHV0aWwgPSB7XG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgJ3N0eWxlJyBlbGVtZW50IGFuZCBhZGQgY3NzIHJ1bGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcnVsZUluZm8gLSBWYWx1ZSBvZiBzZWxlY3RvciBhbmQgY3NzIHByb3BlcnR5XG4gICAgICovXG4gICAgYWRkQ3NzUnVsZTogZnVuY3Rpb24ocnVsZUluZm8pIHtcbiAgICAgICAgdmFyIHN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgdmFyIHNlbGVjdG9yID0gcnVsZUluZm8uc2VsZWN0b3I7XG4gICAgICAgIHZhciBjc3MgPSBydWxlSW5mby5jc3M7XG4gICAgICAgIHZhciBzdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChkb2N1bWVudC5oZWFkKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc3R5bGVUYWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGVTaGVldCA9IHN0eWxlVGFnLnNoZWV0IHx8IHN0eWxlVGFnLnN0eWxlU2hlZXQ7XG5cbiAgICAgICAgaWYgKHN0eWxlU2hlZXQuaW5zZXJ0UnVsZSkge1xuICAgICAgICAgICAgc3R5bGVTaGVldC5pbnNlcnRSdWxlKHNlbGVjdG9yICsgJ3snICsgY3NzICsgJ30nLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuYWRkUnVsZShzZWxlY3RvciwgY3NzLCAwKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIGV2ZW50IHRvIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBET00gZWxlbWVudCB0byBhdHRhY2ggdGhlIGV2ZW50IGhhbmRsZXIgb25cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIC0gRXZlbnQgdHlwZVxuICAgICAqIEBwYXJhbSB7cmVxdWVzdENhbGxiYWNrfSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyICYmIGV2ZW50VHlwZSAhPT0gJ3Byb3BlcnR5Y2hhbmdlJykge1xuICAgICAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICB0YXJnZXRbY2FsbGJhY2tQcm9wTmFtZShldmVudFR5cGUpXSA9IGNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBldmVudCBmcm9tIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBET00gZWxlbWVudCB0byBkZXRhY2ggdGhlIGV2ZW50IGhhbmRsZXIgZnJvbVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgLSBFdmVudCB0eXBlXG4gICAgICovXG4gICAgdW5iaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IHRhcmdldFtjYWxsYmFja1Byb3BOYW1lKGV2ZW50VHlwZSldO1xuICAgICAgICB2YXIgc3VjY2VzcyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyICYmIGV2ZW50VHlwZSAhPT0gJ3Byb3BlcnR5Y2hhbmdlJykge1xuICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0LmRldGFjaEV2ZW50KSB7XG4gICAgICAgICAgICB0YXJnZXQuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRbY2FsbGJhY2tQcm9wTmFtZShldmVudFR5cGUpXTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGFyZ2V0IGl0ZW1zIGZyb20gc291cmNlIGFycmF5IGFuZCByZXR1cm5zIGEgbmV3IHJlbW92ZWQgYXJyYXkuXG4gICAgICogQHBhcmFtIHthcnJheX0gc291cmNlSXRlbXMgLSBzb3VyY2UgYXJyYXlcbiAgICAgKiBAcGFyYW0ge2FycmF5fSB0YXJnZXRJdGVtcyAtIHRhcmdldCBpdGVtc1xuICAgICAqIEByZXR1cm5zIHthcnJheX0gbmV3IHJlbW92ZWQgYXJyYXlcbiAgICAgKi9cbiAgICByZW1vdmVBcnJheUl0ZW1zOiBmdW5jdGlvbihzb3VyY2VJdGVtcywgdGFyZ2V0SXRlbXMpIHtcbiAgICAgICAgcmV0dXJuIHR1aS51dGlsLmZpbHRlcihzb3VyY2VJdGVtcywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHR1aS51dGlsLmluQXJyYXkoaXRlbSwgdGFyZ2V0SXRlbXMpID09PSAtMTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2UgQ1NTVGV4dFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZU9iaiAtIFN0eWxlIGluZm8gb2JqZWN0XG4gICAgICogQHJldHVybnMge3N0cmluZ30gQ29ubmVjdGVkIHN0cmluZyBvZiBzdHlsZVxuICAgICAqL1xuICAgIG1ha2VTdHlsZVRleHQ6IGZ1bmN0aW9uKHN0eWxlT2JqKSB7XG4gICAgICAgIHZhciBzdHlsZVN0ciA9ICcnO1xuXG4gICAgICAgIHR1aS51dGlsLmZvckVhY2goc3R5bGVPYmosIGZ1bmN0aW9uKHZhbHVlLCBwcm9wKSB7XG4gICAgICAgICAgICBzdHlsZVN0ciArPSBwcm9wICsgJzonICsgdmFsdWUgKyAnOyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzdHlsZVN0cjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVwbGFjZSBtYXRjaGVkIHByb3BlcnR5IHdpdGggdGVtcGxhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGVtcGxhdGUgLSBTdHJpbmcgb2YgdGVtcGxhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcE9iaiAtIFByb3BlcnRpZXNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXBsYWNlZCB0ZW1wbGF0ZSBzdHJpbmdcbiAgICAgKi9cbiAgICBhcHBseVRlbXBsYXRlOiBmdW5jdGlvbih0ZW1wbGF0ZSwgcHJvcE9iaikge1xuICAgICAgICB2YXIgbmV3VGVtcGxhdGUgPSB0ZW1wbGF0ZS5yZXBsYWNlKC9cXHtcXHsoXFx3KilcXH1cXH0vZywgZnVuY3Rpb24odmFsdWUsIHByb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wT2JqLmhhc093blByb3BlcnR5KHByb3ApID8gcHJvcE9ialtwcm9wXSA6ICcnO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbmV3VGVtcGxhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgZWxlbWVudCdzIHN0eWxlIHZhbHVlIGRlZmluZWQgYXQgY3NzIGZpbGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSBDdXJyZW50IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBvYmplY3Qgb2YgZWxlbWVudFxuICAgICAqL1xuICAgIGdldFN0eWxlOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGNvbXB1dGVkT2JqO1xuXG4gICAgICAgIGlmIChoYXNDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRhcmdldCwgJycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcHV0ZWRPYmogPSB0YXJnZXQuY3VycmVudFN0eWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvbXB1dGVkT2JqO1xuICAgIH0sXG5cbiAgICAvLyBleHBvcnQgdG8gYmUgdXNlZCBieSB1bml0LXRlc3RcbiAgICBfY2FsbGJhY2tQcm9wTmFtZTogY2FsbGJhY2tQcm9wTmFtZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvdXRpbC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9