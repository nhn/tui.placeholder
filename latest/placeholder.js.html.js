tui.util.defineNamespace("fedoc.content", {});
fedoc.content["placeholder.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Generate the virtual placeholder on browsers isn't supported placehoder feature\n * @author NHN Ent. FE dev team.&lt;dl_javascript@nhnent.com>\n */\n'use strict';\n\nvar util = require('./util.js');\n\nvar Placeholder;\n\nvar isSupportPlaceholder,\n    sharedInstance;\n\nvar browser = tui.util.browser;\n\nvar KEYCODE_BACK = 8;\nvar KEYCODE_TAB = 9;\n\nvar INPUT_TYPES = [\n    'text',\n    'password',\n    'email',\n    'tel',\n    'number',\n    'url',\n    'search'\n];\n\nif (browser.msie &amp;&amp; (browser.version > 9 &amp;&amp; browser.version &lt;= 11)) {\n    util.addCssRule({\n        selector: ':-ms-input-placeholder',\n        css: 'color:#fff !important;text-indent:-9999px;'\n    });\n}\n\nisSupportPlaceholder = 'placeholder' in document.createElement('input') &amp;&amp; !(browser.msie &amp;&amp; browser.version &lt;= 11);\n\n/**\n * Placeholder Object\n * @constructor\n * @param {HTMLElement} elements - Selected 'input' elements\n * @example\n * tui.component.placeholder();\n * tui.component.placeholder(document.getElementById('add-area').getElementsByTagName('input'));\n */\nPlaceholder = tui.util.defineClass(/** @lends Placeholder.prototype */{\n    init: function() {\n        /**\n         * Array pushed all 'input' elements in the current page\n         * @type {Array}\n         * @private\n         */\n        this._inputElems = [];\n    },\n\n    /**\n     * Add elements in array\n     * @param {HTMLElement} elements - selected 'input' elements\n     */\n    add: function(elements) {\n        if (isSupportPlaceholder) {\n            return;\n        }\n\n        this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));\n    },\n\n    /**\n     * Generate virtual placeholders for the browser isnt't supported placeholder property\n     */\n    generatePlaceholder: function() {\n        var self = this;\n\n        tui.util.forEach(this._inputElems, function(elem) {\n            var type = elem.type;\n\n            if (tui.util.inArray(type, INPUT_TYPES) > -1 &amp;&amp;\n                elem.getAttribute('placeholder')) {\n                self._attachCustomPlaceholder(elem);\n            }\n        });\n    },\n\n    /**\n     * Returns element's style value defined at css file\n     * @param {HTMLElement} target - 'input' element\n     * @returns {Object} Style info of 'input' element\n     * @private\n     */\n    _getInitStyle: function(target) {\n        var computedObj,\n            styleInfo;\n\n        if (window.getComputedStyle) {\n            computedObj = window.getComputedStyle(target, null);\n\n            styleInfo = {\n                fontSize: computedObj.getPropertyValue('font-size'),\n                paddingLeft: computedObj.getPropertyValue('padding-left')\n            };\n        } else {\n            computedObj = target.currentStyle;\n\n            styleInfo = {\n                fontSize: computedObj.fontSize,\n                paddingLeft: computedObj.paddingLeft\n            };\n        }\n\n        return styleInfo;\n    },\n\n    /**\n     * Attach a new virtual placeholder after a selected 'input' element and wrap this element\n     * @param {HTMLElement} target - The 'input' element\n     * @private\n     */\n    _attachCustomPlaceholder: function(target) {\n        var initStyle = this._getInitStyle(target),\n            wrapTag = document.createElement('span'),\n            placeholder = target.getAttribute('placeholder'),\n            inputValue = target.value;\n\n        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, inputValue);\n        wrapTag.appendChild(target.cloneNode());\n\n        target.parentNode.insertBefore(wrapTag, target.nextSibling);\n        target.parentNode.removeChild(target);\n\n        wrapTag.style.cssText = 'position:relative;line-height:1;';\n\n        this._bindEventToVirtualPlaceholder(wrapTag);\n    },\n\n    /**\n     * Bind events on the element\n     * @param {HTMLElement} target - The wrapper tag of the 'input' element\n     * @private\n     */\n    _bindEventToVirtualPlaceholder: function(target) {\n        var inputTag = target.getElementsByTagName('input')[0],\n            spanTag = target.getElementsByTagName('span')[0],\n            spanStyle = spanTag.style;\n\n        util.bindEvent(spanTag, 'click', function() {\n            inputTag.focus();\n        });\n\n        util.bindEvent(inputTag, 'keydown', function(e) {\n            var keyCode = e.which || e.keyCode;\n\n            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB)) {\n                spanStyle.display = 'none';\n            }\n        });\n\n        util.bindEvent(inputTag, 'keyup', function() {\n            if (inputTag.value === '') {\n                spanStyle.display = 'inline-block';\n            }\n        });\n    },\n\n    /**\n     * Generate the virtual placeholder element\n     * @param {Number} paddingLeft - Current 'input' element's left padding size\n     * @param {Number} fontSize - Current 'input' element's 'font-size' property value\n     * @param {String} placehoderText - Current 'input' element value of placeholder property\n     * @param {String} inputValue - Current 'input' element value\n     * @returns {String} String of virtual placehoder tag\n     * @private\n     */\n    _generateSpanTag: function(paddingLeft, fontSize, placehoderText, inputValue) {\n        var html = '&lt;span style=\"position:absolute;left:0;top:50%;width:90%;';\n\n        html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';\n        html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;*display:inline;zoom:1;';\n        html += 'display:' + (inputValue !== '' ? 'none' : 'inline-block') + ';';\n        html += 'color:#aaa;line-height:1.2;z-index:0;';\n        html += 'font-size:' + fontSize + ';\" UNSELECTABLE=\"on\">' + placehoderText + '&lt;/span>';\n\n        return html;\n    }\n});\n\nsharedInstance = new Placeholder();\n\nmodule.exports = function(elements) {\n    sharedInstance.add(elements);\n    sharedInstance.generatePlaceholder();\n};\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"