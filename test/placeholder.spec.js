'use strict';

// simulant library needs polyfills for IE8
require('./util/polyfill');

/* eslint-disable vars-on-top */
var simulant = require('simulant');
var snippet = require('tui-code-snippet');

var placeholder = require('../src/js/placeholder');
var util = require('../src/js/util');

var browser = snippet.browser;
var supportIE = browser.msie && browser.version <= 11;
var otherBrowser = browser.others;
var supportPlaceholder = 'placeholder' in document.createElement('input') &&
                            'placeholder' in document.createElement('textarea');
var supportPropertychange = browser.msie && browser.version < 11;
var generatePlaceholder = supportIE || (!supportIE && !supportPlaceholder) ||
                        (otherBrowser && !supportPlaceholder);
/* eslint-enable vars-on-top */

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

describe('placeholder.js', function() {
    beforeEach(function() {
        loadFixtures('placeholder.html');

        placeholder.generate();
    });

    it('Create and append the <style> element for adding css rule on IE9 to IE11.', function() {
        var styleTagLen = $('style').length;
        var expected = (browser.msie && (browser.version > 9 && browser.version <= 11)) ? 1 : 0;

        expect(styleTagLen).toEqual(expected);
    });

    it('When placeholder property is not supported on the browser, generating the virtual placeholder.', function() {
        var $placeholder = $('span > span');

        expect($placeholder.length).toEqual(generatePlaceholder ? 5 : 0);
    });

    describe('When the virtual placeholder is generated,', function() {
        it('elements have an inline style.', function() {
            var $placeholder = $('span > span[style]');

            expect($placeholder.length).toEqual(generatePlaceholder ? 5 : 0);
        });

        it('elements that have already value are hidden.', function() {
            var $placeholder = $('span > span:hidden');

            expect($placeholder.length).toEqual(generatePlaceholder ? 2 : 0);
        });

        it('elements set the special attribute that don\'t copy and drag.', function() {
            var $placeholder = $('span > span[unselectable="on"]');

            expect($placeholder.length).toEqual(generatePlaceholder ? 5 : 0);
        });
    });

    it('When call add api with arguments, the virtual placeholder append on dynamically created elements.', function() {
        var $parent = $('#jasmine-fixtures');
        var i = 0;
        var len = 3;
        var expected = generatePlaceholder ? len : 0;

        for (; i < len; i += 1) {
            $parent.append('<input type="text" class="addon" placeholder="test" />');
        }

        placeholder.generate($('.addon'));

        expect($('span > .addon').length).toEqual(expected);
    });

    describe('remove(): ', function() {
        it('If called without arguments, removes all generated virtual elements', function() {
            placeholder.remove();
            expect($('span > span').length).toEqual(0);
        });

        it('If called with arguments, removes virtual elements related to given elements', function() {
            var $targets = $('input').slice(0, 2); // first two input elements

            placeholder.remove($targets.toArray());
            expect($('span > span').length).toEqual(generatePlaceholder ? 3 : 0);
        });
    });
});

if (generatePlaceholder) {
    /* eslint-disable max-nested-callbacks */
    describe('placeholder.js', function() {
        describe('generate(): ', function() {
            var DEF_VALUE = 'Holding Value';
            var $input;

            beforeEach(function() {
                $input = $('<input placeholder="' + DEF_VALUE + '" />');
                jasmine.getFixtures().set($input);
            });

            it('If called with wrapperClassName option, add given className to the wrapper', function() {
                placeholder.generate(null, {
                    wrapperClassName: 'my-custom-class'
                });
                expect($input.parent()).toHaveClass('my-custom-class');
            });

            it('holder element has a placeholder value', function() {
                placeholder.generate();
                expect($input.prev().text()).toBe(DEF_VALUE);
            });

            describe('holder element should be visible if input does not have a value ', function() {
                var $holder;

                beforeEach(function() {
                    placeholder.generate();
                    $holder = $input.prev();
                });

                it('initially', function() {
                    expect($holder).toBeVisible();
                });

                it('and blur event occurs on the input element', function() {
                    $holder.hide();
                    simulant.fire($input[0], 'blur');
                    expect($holder).toBeVisible();
                });

                it('and keyup event occurs on the input element', function() {
                    $holder.hide();
                    simulant.fire($input[0], 'keyup');
                    expect($holder).toBeVisible();
                });
            });

            describe('holder element should not be visible if input has a value ', function() {
                var $holder;

                beforeEach(function() {
                    $input.val('Some value');
                    placeholder.generate();
                    $holder = $input.prev();
                });

                it('initially', function() {
                    expect($holder).not.toBeVisible();
                });

                it('and blur event occurs on the input element', function() {
                    simulant.fire($input[0], 'blur');
                    expect($holder).not.toBeVisible();
                });

                it('and keyup event occurs on the input element', function() {
                    simulant.fire($input[0], 'keyup');
                    expect($holder).not.toBeVisible();
                });
            });

            it('should focus to input element when click holder element', function() {
                placeholder.generate();
                simulant.fire($input.prev()[0], 'click');
                expect($input[0]).toBe(document.activeElement);
            });

            it('holder should be hidden when keydown event occurs on the input element', function() {
                placeholder.generate();
                simulant.fire($input[0], 'keydown', {
                    which: 65,
                    keyCode: 65
                });
                expect($input.prev()).not.toBeVisible();
            });
        });

        describe('remove(): ', function() {
            it('should restore original state', function() {
                var $input = $('<input placeholder="Holding Value" />');
                var $prevEl = $('<span>');
                var $nextEl = $('<span>');
                var $parentEl = $('<div>');

                $parentEl.append([$prevEl, $input, $nextEl]);
                jasmine.getFixtures().set($parentEl);

                placeholder.generate();
                placeholder.remove();

                expect($input.prev()[0]).toBe($prevEl[0]);
                expect($input.next()[0]).toBe($nextEl[0]);
                expect($input.parent()[0]).toBe($parentEl[0]);
            });

            // It's impossible to test if handlers are actually unbound, so test this spec just by
            // confirming util.bindEvent and util.unbindEvent is called with specific events
            it('should unbind events', function() {
                var $input = $('<input placeholder="Holding Value" />');
                var events = (supportPropertychange) ? ['keydown', 'keyup', 'blur', 'propertychange'] : ['keydown', 'keyup', 'blur', 'change'];
                var callArgs;

                spyOn(util, 'bindEvent');
                spyOn(util, 'unbindEvent');
                jasmine.getFixtures().set($input);

                placeholder.generate();

                // test if bindEvent is called with [keydown, keyup, blur] event
                callArgs = util.bindEvent.calls.allArgs();
                callArgs = snippet.filter(callArgs, function(args) {
                    return args[0] === $input[0];
                });
                snippet.forEach(callArgs, function(args) {
                    expect(events).toContain(args[1]);
                });

                placeholder.remove();

                // test if unbindEvent is called with [keydown, keyup, blur] event
                callArgs = util.unbindEvent.calls.allArgs();
                callArgs = snippet.filter(callArgs, function(args) {
                    return args[0] === $input[0];
                });
                snippet.forEach(callArgs, function(args) {
                    expect(events).toContain(args[1]);
                });
            });
        });
    });

    describe('Using "usageStatistics" option', function() {
        beforeEach(function() {
            spyOn(snippet, 'imagePing');
        });

        it('when the value set to true by default, the host name is send to server.', function() {
            placeholder.generate();
            expect(snippet.imagePing).toHaveBeenCalled();
        });

        it('when the value set to false, the host name is not send to server.', function() {
            placeholder.generate(null, {
                usageStatistics: false
            });

            expect(snippet.imagePing).not.toHaveBeenCalled();
        });
    });
    /* eslint-enable max-nested-callbacks */
}
