'use strict';

var Placeholder = tui.util.defineClass({
    /**
     * Init setting
     * @param  {HTMLElement} elements [input tags]
     */
    init: function(elements) {
        this._inputElems = elements || document.getElementsByTagName('input');
        this._propState = this._checkAvailableProp();

        if (!this._propState) {
            this._generatePlaceholder();
        }
    },

    /**
     * Detect to use 'placeholder' property
     * @returns {boolean} [state]
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
            customEvt = new tui.util.CustomEvents;

        spanTag.innerHTML = target.placeholder;
        spanTag.style.cssText = cssText;

        target.parentNode.insertBefore(spanTag, target.nextSibling);

        customEvt.on('click', function() {
            this.nextSibling.focus();
        }, spanTag);

        customEvt.on({
            'focus': this._onToggleState,
            'keyup': this._onToggleState
        }, target);
    },

    /**
     * Change 'span' tag's display state
     * @param  {object} e [current event]
     */
    _onToggleState: function(e) {
        this.previousSibling.style.display = (this.value !== '') ? 'none' : 'inline-block';
    }
});

module.exports = Placeholder;
