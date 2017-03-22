tui.util.defineNamespace("fedoc.content", {});
fedoc.content["src_placeholder.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Generate the virtual placeholder on browsers isn't supported placeholder feature\n * @author NHN Ent. FE dev team.&lt;dl_javascript@nhnent.com>\n */\n'use strict';\n\nvar util = require('./util.js');\n\nvar Placeholder, sharedInstance;\nvar browser = tui.util.browser;\nvar isSupportPlaceholder = 'placeholder' in document.createElement('input') &amp;&amp;\n                        !(browser.msie &amp;&amp; browser.version &lt;= 11);\n\nvar KEYCODE_BACK = 8;\nvar KEYCODE_TAB = 9;\nvar TARGET_TAGS = [\n    'input',\n    'textarea'\n];\nvar INPUT_TYPES = [\n    'text',\n    'password',\n    'email',\n    'tel',\n    'number',\n    'url',\n    'search'\n];\nvar WRAPPER_STYLE = util.makeStyleText({\n    'position': 'relative',\n    'display': 'inline-block',\n    'overflow': 'hidden'\n});\nvar DEFAULT_STYLE = util.makeStyleText({\n    'position': 'absolute',\n    'overflow': 'hidden',\n    'color': '#999',\n    'z-index': '0'\n});\nvar TEMPLATE = '&lt;span style=\"{{style}}\" UNSELECTABLE=\"on\">{{placeholderText}}&lt;/span>';\n\n/**\n * Placeholder Object\n * @constructor\n */\nPlaceholder = tui.util.defineClass(/** @lends Placeholder.prototype */{\n    init: function() {\n        /**\n         * Array pushed 'input' and 'textarea' elements on page\n         * @type {Array}\n         * @private\n         */\n        this.targets = [];\n    },\n\n    /**\n     * Generate placeholders\n     * @param {HTMLElement[]} selectedTargets - Selected elements for generating placeholder\n     * @param {object} [options] - options\n     *   @param {string} [options.wrapperClassName] - wrapper class name\n     */\n    generateOnTargets: function(selectedTargets, options) {\n        this.targets = this.targets.concat(selectedTargets);\n\n        tui.util.forEach(this.targets, function(target) {\n            var placeholder = this._getPlaceholderHtml(target);\n\n            this._attachPlaceholder(target, placeholder, options);\n            this._bindEvent(target, target.previousSibling);\n        }, this);\n    },\n\n    /**\n     * Remove placeholders\n     * @param {HTMLElement[]} selectedTargets - Selected elements for generating placeholder\n     */\n    remove: function(selectedTargets) {\n        var removeTargets;\n\n        if (selectedTargets) {\n            removeTargets = tui.util.filter(selectedTargets, function(target) {\n                return tui.util.inArray(target, this.targets) >= 0;\n            }, this);\n            this.targets = util.removeArrayItems(this.targets, removeTargets);\n        } else {\n            removeTargets = this.targets;\n            this.targets = [];\n        }\n\n        tui.util.forEach(removeTargets, function(target) {\n            this._unbindEvent(target, target.previousSibling);\n            this._detachPlaceholder(target);\n        }, this);\n    },\n\n    /**\n     * Hide placeholders on 'input' or 'textarea' element that already has value\n     * @param {HTMLElements} selectedTargets - Selected elements to hide placeholder\n     */\n    hideOnTargets: function(selectedTargets) {\n        tui.util.forEach(selectedTargets, function(target) {\n            target.previousSibling.style.display = 'none';\n        });\n    },\n\n    /**\n     * Attach a new virtual placeholder after a selected 'input' element and wrap this element\n     * @param {HTMLElement} target - The 'input' or 'textarea' element\n     * @param {string} placeholder - HTML string of the virtual placeholder\n     * @param {object} [options] - options\n     *   @param {string} [options.wrapperClassName] - wrapper class name\n     * @private\n     */\n    _attachPlaceholder: function(target, placeholder, options) {\n        var wrapper = document.createElement('span');\n        var parentNode = target.parentNode;\n\n        if (options &amp;&amp; options.wrapperClassName) {\n            wrapper.className = options.wrapperClassName;\n        }\n        wrapper.innerHTML = placeholder;\n        wrapper.style.cssText = WRAPPER_STYLE;\n\n        parentNode.insertBefore(wrapper, target);\n\n        wrapper.appendChild(target);\n    },\n\n    /**\n     * Detach generated placeholder and restore the target to original state.\n     * @param {HTMLElement} target - The 'input' or 'textarea' element\n     */\n    _detachPlaceholder: function(target) {\n        var wrapper = target.parentNode;\n        var parentNode = wrapper.parentNode;\n        var placeholder = target.previousSibling;\n\n        wrapper.removeChild(placeholder);\n        parentNode.insertBefore(target, wrapper);\n        parentNode.removeChild(wrapper);\n    },\n\n    /**\n     * Bind events on the element\n     * @param {HTMLElement} target - The 'input' or 'textarea' element\n     * @param {HTMLElement} placeholder - The virtual placeholder element\n     * @private\n     */\n    _bindEvent: function(target, placeholder) {\n        var placeholderStyle = placeholder.style;\n\n        /**\n         * Event handler\n         */\n        function onKeyup() {\n            if (target.value === '') {\n                placeholderStyle.display = 'inline-block';\n            }\n        }\n\n        util.bindEvent(placeholder, 'click', function() {\n            target.focus();\n        });\n\n        util.bindEvent(target, 'keydown', function(e) {\n            var keyCode = e.which || e.keyCode;\n\n            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB ||\n                (e.shiftKey &amp;&amp; keyCode === KEYCODE_TAB))) {\n                placeholderStyle.display = 'none';\n            }\n        });\n\n        util.bindEvent(target, 'keyup', onKeyup);\n        util.bindEvent(target, 'blur', onKeyup);\n    },\n\n    /**\n     * Unbind events from the element\n     * @param {HTMLElement} target - The 'input' or 'textarea' element\n     * @param {HTMLElement} placeholder - The virtual placeholder element\n     * @private\n     */\n    _unbindEvent: function(target, placeholder) {\n        util.unbindEvent(target, 'keydown');\n        util.unbindEvent(target, 'keyup');\n        util.unbindEvent(target, 'blur');\n        util.unbindEvent(placeholder, 'click');\n    },\n\n    /**\n     * Get the virtual placeholder's html\n     * @param {HTMLElement} target - The 'input' or 'textarea' element\n     * @returns {string} String of virtual placeholder tag\n     * @private\n     */\n    _getPlaceholderHtml: function(target) {\n        var initStyle = util.getStyle(target);\n        var placeholderText = target.getAttribute('placeholder');\n        var hasValue = target.value !== '';\n        var isInput = target.nodeName.toLowerCase() === 'input';\n        var styleObj = {\n            'display': hasValue ? 'none' : 'inline-block',\n            'top': parseInt(initStyle.paddingTop, 10) +\n                    parseInt(initStyle.borderTopWidth, 10) + 'px',\n            'left': parseInt(initStyle.paddingLeft, 10) +\n                    parseInt(initStyle.borderLeftWidth, 10) + 'px',\n            'font-size': initStyle.fontSize,\n            'font-family': initStyle.fontFamily.replace(/\\\"/g, '\\'')\n        };\n        var addStyle = !isInput ? {'width': '90%'} : {'white-space': 'nowrap'};\n\n        tui.util.extend(styleObj, addStyle);\n\n        return util.applyTemplate(TEMPLATE, {\n            style: DEFAULT_STYLE + util.makeStyleText(styleObj),\n            placeholderText: placeholderText\n        });\n    }\n});\n\n/**\n * Get all 'input' and 'textarea' elements on page\n * @returns {Array.&lt;HTMLElement>} All elements\n */\nfunction getAllTargets() {\n    var inputs = tui.util.toArray(document.getElementsByTagName('input'));\n    var textareas = tui.util.toArray(document.getElementsByTagName('textarea'));\n\n    return inputs.concat(textareas);\n}\n\nif (browser.msie &amp;&amp; (browser.version > 9 &amp;&amp; browser.version &lt;= 11)) {\n    util.addCssRule({\n        selector: ':-ms-input-placeholder',\n        css: 'color:#fff !important;text-indent:-9999px;'\n    });\n}\n\nsharedInstance = new Placeholder();\n\nmodule.exports = {\n    /**\n     * Generate virtual placeholders.\n     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder\n     * @param {object} [options] - options\n     *   @param {string} [options.wrapperClassName] - wrapper class name\n     * @memberof tui.component.placeholder\n     * @function\n     * @api\n     * @example\n     * tui.component.placeholder.generate();\n     * tui.component.placeholder.generate(document.getElementsByTagName('input'));\n     * tui.component.placeholder.generate(document.getElementsByTagName('input'), {\n     *     wrapperClassName: 'my-class-name'\n     * });\n     */\n    generate: function(selectedTargets, options) {\n        var targets;\n\n        if (isSupportPlaceholder) {\n            return;\n        }\n\n        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : getAllTargets();\n\n        sharedInstance.generateOnTargets(tui.util.filter(targets, function(target) {\n            var tagName = target.nodeName.toLowerCase();\n            var inputType = target.type.toLowerCase();\n            var disableState = target.disabled || target.readOnly;\n            var hasProp = !tui.util.isNull(target.getAttribute('placeholder'));\n            var enableElem = tui.util.inArray(tagName, TARGET_TAGS) > -1;\n\n            if (tagName === 'input') {\n                enableElem = tui.util.inArray(inputType, INPUT_TYPES) > -1;\n            }\n\n            return hasProp &amp;&amp; enableElem &amp;&amp; !disableState;\n        }), options);\n    },\n\n    /**\n     * Clear generated placeholders.\n     * @param {HTMLCollection|HTMLElement[]} selectedTargets - Selected elements for generating placeholder\n     */\n    remove: function(selectedTargets) {\n        var targets;\n\n        if (isSupportPlaceholder) {\n            return;\n        }\n\n        targets = (selectedTargets) ? tui.util.toArray(selectedTargets) : null;\n        sharedInstance.remove(targets);\n    },\n\n    /**\n     * When 'input' or 'textarea' element already has value, hiding the virtual placeholder\n     * @memberof tui.component.placeholder\n     * @function\n     * @api\n     * @example\n     * tui.component.placeholder.hideOnInputHavingValue();\n     */\n    hideOnInputHavingValue: function() {\n        if (isSupportPlaceholder) {\n            return;\n        }\n\n        sharedInstance.hideOnTargets(tui.util.filter(sharedInstance.targets, function(target) {\n            return (target.value !== '' &amp;&amp; target.type !== INPUT_TYPES[1]);\n        }));\n    }\n};\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"