'use strict';

var Placeholder = tui.util.defineClass({
    /**
     * Init setting
     * @param  {Object} options - option for setting component
     */
    init: function(options) {
        /**
         * Option value for setting private property
         * @type {Object}
         */
        options = options || {};

        /**
         * Init style for rendering placeholder
         * @type {Object}
         */
        this._initStyle = this._remakeStyleInfo(options.style);

        /**
         * All 'input' elements in current page
         * @type  {Array}
         */
        this._inputElems = options.elements || document.getElementsByTagName('input');

        /**
         * State value for detect to use 'placeholder' property
         * @type  {Boolean}
         */
        this._propState = this._isSupportPlaceholder();

        if (!this._propState) {
            this._generatePlaceholder();
        }
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
        var elems = this._inputElems,
            i = 0,
            len = elems.length;

        for (; i < len; i += 1) {
            if (elems[i].placeholder && (elems[i].type === 'text' || elems[i].type === 'password')) {
                this._attachSpanTag(elems[i]);
            }
        }
    },

    /**
     * Remake style info in init options
     * @param  {Object} style - style for rendering placeholder
     * @return {Object}
     */
    _remakeStyleInfo: function(style) {
        var fontSize = style.fontSize;

        style['fontSize'] = parseFloat(fontSize , 10);
        style['fontType'] = fontSize.split(style.fontSize)[1];

        return style;
    },

    /**
     * Attach a new 'span' tag after a selected 'input' tag
     * @param  {HTMLElement} target - input tag
     */
    _attachSpanTag: function(target) {
        var self = this,
            fontSize = this._initStyle.fontSize,
            fontType = this._initStyle.fontType,
            boxHeight = this._initStyle.height,
            newTag = document.createElement('span'),
            styleText;

        styleText = '<span style="position:absolute;padding-left:3px;left:0;top:50%;color:#aaa;z-index:-9999px;';
        styleText += 'margin-top:' + (-(fontSize / 2) + fontType) + ';';
        styleText += 'font-size:' + (fontSize + fontType) + '">' + target.placeholder + '</span>';

        target.style.cssText = 'font-size: ' + (fontSize + fontType) + '; height: ' + boxHeight + '; line-height: ' + boxHeight + ';z-index:0;';

        newTag.innerHTML = styleText;
        newTag.appendChild(target.cloneNode());

        target.parentNode.insertBefore(newTag, target.nextSibling);
        target.parentNode.removeChild(target);

        newTag.style.cssText = 'position:relative;display:inline-block;*display:inline;zoom:1;';

        this._bindEvent(newTag, 'click', tui.util.bind(function() { this.lastChild.focus(); }, newTag));
        this._bindEvent(newTag, 'keyup', tui.util.bind(this._onToggleState, newTag));
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

module.exports = Placeholder;
