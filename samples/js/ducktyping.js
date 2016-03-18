
'use strict';
(function() {
var placeholder = {
    init: function() {
        this.state = this._checkPlaceholderProp();

        if (!this.state) {
            this._generateCustomPlaceholder();
        }
    },

    _checkPlaceholderProp: function() {
        return ('placeholder' in document.createElement('input'));
    },

    _generateCustomPlaceholder: function() {
        var elements = document.getElementsByTagName('input'),
            i = 0,
            len = elements.length;

        this._createStyleTag();

        for (; i < len; i += 1) {
            if (elements[i].placeholder) {
                this._attachCustomPlaceholderTag(elements[i]);
            }
        }
    },

    _attachCustomPlaceholderTag: function(target) {
        var newElement = document.createElement('span'),
            newElStyle = newElement.style;

        newElement.appendChild(document.createTextNode(target.placeholder));

        target.parentNode.insertBefore(newElement, target.nextSibling);
        newElement.className = 'placeholder';

        newElStyle.left = target.offsetLeft + 'px';
        newElStyle.width = target.offsetWidth + 'px';

        this._bindEvent(newElement, 'click', function() {
            target.focus();
        });

        this._bindEvent(target, 'focus', function() {
            if (target.value !== '') {
                newElStyle.display = 'none';
            }
        });

        this._bindEvent(target, 'keyup', function() {
            if (target.value === '') {
                newElStyle.display = 'inline-block';
            } else {
                newElStyle.display = 'none';
            }
        });
    },

    _createStyleTag: function() {
        var styleTag = document.createElement('style'),
            styleSheet,
            selector,
            css;

        if (document.head) {
            document.head.appendChild(styleTag);
        } else {
            document.getElementsByTagName('head')[0].appendChild(styleTag);
        }

        styleSheet = styleTag.sheet || styleTag.styleSheet;

        selector = '.placeholder';
        css = 'position:absolute;border:1px solid blue;';

        if (styleSheet.insertRule) {
            styleSheet.insertRule(selector + '{' + css + '}', 0);
        } else {
            styleSheet.addRule(selector, css, 0);
        }
    },

    _bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = null;
        }
    }
};

placeholder.init();
})();
