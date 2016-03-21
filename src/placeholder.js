'use strict';

var Placeholder = tui.util.defineClass({
    /**
     * Init setting
     * @param  {HTMLElement} elements [input tags]
     */
    init: function(elements) {
        /**
         * All 'input' elements in current page
         * @type  {HTMLElement}
         */
        this._inputElems = elements || document.getElementsByTagName('input');

        /**
         * State value for detect to use 'placeholder' property 
         * @type  {Boolean}
         */
        this._propState = this._checkAvailableProp();

        if (!this._propState) {
            this._generatePlaceholder();
        }
    },

    /**
     * Detect to use 'placeholder' property
     * @returns {Boolean} [state]
     */
    _checkAvailableProp: function() {
        return ('placeholder' in document.createElement('input'));
    },

    /**
     * Generator virtual placeholders for browser not supported 'placeholder' property
     */
    _generatePlaceholder: function() {
        var i = 0,
            len = this._inputElems.length;

        for (; i < len; i += 1) {
            if (this._inputElems[i].placeholder) {
                this._attachSpanTag(this._inputElems[i]);
            }
        }
    },

    /**
     * Attach a new 'span' tag after a selected 'input' tag
     * @param  {HTMLElement} target [input tag]
     */
    _attachSpanTag: function(target) {
        var spanTag = document.createElement('span'),
            cssText = 'position:absolute;left:' + target.offsetLeft + 'px;width:' + target.offsetWidth + 'px;',
            self = this;

        spanTag.innerHTML = target.placeholder;
        spanTag.style.cssText = cssText;

        target.parentNode.insertBefore(spanTag, target.nextSibling);

        this._bindEvent(spanTag, 'click', function() {
            target.focus();
        });

        this._bindEvent(target, 'focus', function() {
            self._onToggleState(target, spanTag);
        });

        this._bindEvent(target, 'keyup', function() {
            self._onToggleState(target, spanTag);
        });;
    },

    /**
     * Change 'span' tag's display state by 'input' tag's value
     * @param  {HTMLElement} inputTag [input tag]
     * @param  {HTMLElement} spanTag [span tag]
     */
    _onToggleState: function(inputTag, spanTag) {
        spanTag.style.display = (inputTag.value !== '') ? 'none' : 'inline-block';
    },

    /**
     * Bind event to element
     * @param  {HTMLElement} target    [tag]
     * @param  {String} eventType [description]
     * @param  {Function} callback  []
     */
    _bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = null;
        }
    }
});

module.exports = Placeholder;
