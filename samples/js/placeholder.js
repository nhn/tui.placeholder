(function() {
'use strict';

var Placeholder = tui.util.defineClass({
    /**
     * Init setting
     * @param  {HTMLElement} elements - selected 'input' tags
     */
    init: function(elements) {
        /**
         * All 'input' elements in current page
         * @type  {Array}
         */
        this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));

        /**
         * State value for detect to use 'placeholder' property
         * @type  {Boolean}
         */
        this._propState = this._isSupportPlaceholder();

        //if (!this._propState && this._inputElems.length > 0) {
            this._generatePlaceholder();
        //}
    },

    /**
     * Return style info of imported style sheet
     * @param  {HTMLElement} elem - first 'input' tag
     * @returns {Object}
     */
    _getInitStyle: function(elem) {
        var computedObj,
            hasFunc = false;

        if (window.getComputedStyle) {
            computedObj = window.getComputedStyle(elem, null);
            hasFunc = true;
        } else {
            computedObj = elem.currentStyle;
        }

        return {
            fontSize: hasFunc ? computedObj.getPropertyValue('font-size') : computedObj.fontSize,
            fixedHeight: hasFunc ? computedObj.getPropertyValue('line-height') : computedObj.lineHeight,
            fixedWidth: hasFunc ? computedObj.getPropertyValue('width') : computedObj.width
        };
    },

    /**
     * Detect to use 'placeholder' property
     * @returns {Boolean}
     */
    _isSupportPlaceholder: function() {
        return ('placeholder' in document.createElement('input'));
    },

    /**
     * Generator virtual placeholders for browser not supported 'placeholder' property
     */
    _generatePlaceholder: function() {
        var self = this,
            type;

        tui.util.forEach(this._inputElems, function(elem) {
            type = elem.type;

            if (type === 'text' || type === 'password' || type === 'email') {
                self._attachCustomPlaceholderTag(elem);
            }
        });
    },

    /**
     * Attach a new custom placehoder tag after a selected 'input' tag and wrap 'input' tag
     * @param  {HTMLElement} target - input tag
     */
    _attachCustomPlaceholderTag: function(target) {
        var initStyle = this._getInitStyle(target),
            fontSize = initStyle.fontSize,
            fixedHeight = initStyle.fixedHeight,
            wrapTag = document.createElement('span'),
            wrapTagStyle = 'position:relative;display:inline-block;*display:inline;zoom:1;width:' + initStyle.fixedWidth + ';',
            placehoderHtml;

        placehoderHtml = '<span style="position:absolute;padding-left:2px;left:0;top:50%;color:#aaa;';
        placehoderHtml += 'display:inline-block;margin-top:' + (-(parseFloat(fontSize, 10) / 2)) + 'px;';
        placehoderHtml += 'font-size:' + fontSize + '">' + target.placeholder + '</span>';

        target.style.cssText = 'font-size:' + fontSize + ';height:' + fixedHeight + ';line-height:' + fixedHeight + ';';

        wrapTag.innerHTML = placehoderHtml;
        wrapTag.appendChild(target.cloneNode());

        target.parentNode.insertBefore(wrapTag, target.nextSibling);
        target.parentNode.removeChild(target);

        wrapTag.style.cssText = wrapTagStyle;

        this._bindEvent(wrapTag, 'click', tui.util.bind(function() {
            this.lastChild.focus();
        }, wrapTag));

        this._bindEvent(wrapTag, 'keyup', tui.util.bind(this._onToggleState, wrapTag));
    },

    /**
     * Change 'span' tag's display state by 'input' tag's value
     */
    _onToggleState: function() {
        var inputTag = this.getElementsByTagName('input')[0],
            spanTag = this.getElementsByTagName('span')[0];

        spanTag.style.display = (inputTag.value !== '') ? 'none' : 'inline-block';
    },

    /**
     * Bind event to element
     * @param  {HTMLElement} target - tag for binding
     * @param  {String} eventType - event type
     * @param  {Function} callback - event handler function
     */
    _bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = callback;
        }
    }
});

new Placeholder();
})();
