'use strict';

require('../src/index.js');
/**
 * Event simulator in jasmine
 * @type {Object}
 */
var evtSimulator = {
    /**
     * Created event
     * @type {Object}
     */
    _event: null,

    /**
     * Fire event
     * @param  {Object} options - Event info for simulating
     */
    fire: function(options) {
        options = options || {};

        /**
         * Element bound event
         * @type {HTMLElement}
         */
        this._target = options.target;

        /**
         * Event type of simulating
         * @type {String}
         */
        this._type = options.type;

        if (!this._target) {
            return;
        }

        this._createEvent();

        if (this._type.match(/key+/g)) {
            this._setKeyValue(options.key || 1);
        }

        this._dispatchEvent();
    },

    /**
     * Create an virtual event
     */
    _createEvent: function() {
        if (document.createEvent) {
            this._event = document.createEvent('HTMLEvents');
            this._event.initEvent(this._type, true, true);
        } else {
            this._event = document.createEventObject();
            this._event.eventType = this._type;
        }

        this._event.eventName = this._type;
    },

    /**
     * Fire event on current element
     */
    _dispatchEvent: function() {
        if (this._target.dispatchEvent) {
            this._target.dispatchEvent(this._event);
        } else {
            this._target.fireEvent('on' + this._type, this._event);
        }
    },

    /**
     * Set a key value to event object
     * @param  {Number} key - key value formmated number
     */
    _setKeyValue: function(key) {
        if (this._event.keyCode) {
            this._event.keyCode = key;
        } else {
            this._event.which = key;
        }
    }
};

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

describe('placeholder.js', function() {
    var browser = tui.util.browser,
        isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

    beforeEach(function() {
        loadFixtures('placeholder.html');
    });

    afterEach(function() {
        jasmine.getFixtures().clearCache();
        jasmine.getFixtures().cleanUp();
    });

    xit('Create and append the <style> element for adding css rule on IE9 to IE11.', function() {
        var styleTagLen = $('style').length,
            expected = (browser.msie && (browser.version > 9 && browser.version <= 11)) ? 1 : 0;

        expect(styleTagLen).toEqual(expected);
    });

    xit('The user\'s browser on any condition generate the virtual placeholder.', function() {
        var $placeholder = $('span > span'),
            expected = !isSupportPlaceholder ? 3 : 0;

        expect($placeholder.length).toEqual(expected);
    });

    it('When call add api with arguments, the virtual placeholder append on dynamically created elements.', function() {
        var $parent = $('#jasmine-fixtures'),
            i = 0,
            len = 3,
            expected = !isSupportPlaceholder ? len : 0;

        for (; i < len; i += 1) {
            $parent.append('<input type="text" class="addon" placeholder="test" />');
        }

        tui.component.placeholder($('.addon'));

        expect($('span > .addon').length).toEqual(expected);
    });

    describe('When the virtual placeholder is generated', function() {
        xit('this element has an inline style.', function() {
            var $placeholder = $('span > span[style]'),
                expected = !isSupportPlaceholder ? 3 : 0;

            expect($placeholder.length).toEqual(expected);
        });

        xit('This element is hidden, if the <input> element has already value.', function() {
            var $placeholder = $('span > span:hidden'),
                expected = !isSupportPlaceholder ? 1 : 0;

            expect($placeholder.length).toEqual(expected);
        });

        xit('This element set the special attribute that don\'t copy and drag.', function() {
            var $placeholder = $('span > span[unselectable="on"]'),
                expected = !isSupportPlaceholder ? 3 : 0;

            expect($placeholder.length).toEqual(expected);
        });
    });

    xit('When the click event fires on the virtual placeholder, the next <input> element is focused.', function() {
        var inputElem = document.getElementsByTagName('input')[0],
            placeholder = inputElem.previousSibling;

        if (!isSupportPlaceholder) {
            spyOn(inputElem, 'focus');

            evtSimulator.fire({
                target: placeholder,
                type: 'click'
            });

            expect(inputElem.focus).toHaveBeenCalled();
        }
    });

    xit('When fire keydown event into the <input> element, the virtual placeholder is hidden.', function() {
        var inputElem = document.getElementsByTagName('input')[0],
            placeholder = inputElem.previousSibling;

        if (!isSupportPlaceholder) {
            evtSimulator.fire({
                target: inputElem,
                type: 'keydown',
                key: 65
            });

            expect(placeholder.style.display).toEqual('none');
        }
    });

    xit('When fire keyup event and <input> element have empty value, the virtual placeholder is visible.', function() {
        var inputElem = document.getElementsByTagName('input')[1],
            placeholder = inputElem.previousSibling;

        if (!isSupportPlaceholder) {
            evtSimulator.fire({
                target: inputElem,
                type: 'keyup'
            });

            expect(placeholder.style.display).not.toEqual('none');
        }
    });
});
