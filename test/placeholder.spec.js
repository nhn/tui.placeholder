'use strict';

var placeholder = require('../src/placeholder.js');
var browser = tui.util.browser;
var isSupportPlaceholder = 'placeholder' in document.createElement('input') &&
                            !(browser.msie && browser.version <= 11);

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

        expect($placeholder.length).toEqual(!isSupportPlaceholder ? 5 : 0);
    });

    describe('When the virtual placeholder is generated,', function() {
        it('elements have an inline style.', function() {
            var $placeholder = $('span > span[style]');

            expect($placeholder.length).toEqual(!isSupportPlaceholder ? 5 : 0);
        });

        it('elements that have already value are hidden.', function() {
            var $placeholder = $('span > span:hidden');

            expect($placeholder.length).toEqual(!isSupportPlaceholder ? 2 : 0);
        });

        it('elements set the special attribute that don\'t copy and drag.', function() {
            var $placeholder = $('span > span[unselectable="on"]');

            expect($placeholder.length).toEqual(!isSupportPlaceholder ? 5 : 0);
        });
    });

    it('When call add api with arguments, the virtual placeholder append on dynamically created elements.', function() {
        var $parent = $('#jasmine-fixtures');
        var i = 0;
        var len = 3;
        var expected = !isSupportPlaceholder ? len : 0;

        for (; i < len; i += 1) {
            $parent.append('<input type="text" class="addon" placeholder="test" />');
        }

        placeholder.generate($('.addon'));

        expect($('span > .addon').length).toEqual(expected);
    });

    it('When "hideOnHasValueInput" method is called, placeholder changes the status to hidden.', function() {
        $('input:eq(2)').val('history back'); // input tag

        expect($('span > span:hidden').length).toEqual(!isSupportPlaceholder ? 2 : 0);

        placeholder.hideOnInputHavingValue();

        expect($('span > span:hidden').length).toEqual(!isSupportPlaceholder ? 3 : 0);
    });
});
