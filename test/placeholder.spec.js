'use strict';

var placeholder = require('../src/placeholder.js');
var browser = tui.util.browser;
var isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

describe('placeholder.js', function() {
    beforeEach(function() {
        loadFixtures('placeholder.html');

        placeholder.generate();
    });

    afterEach(function() {
        jasmine.getFixtures().clearCache();
        jasmine.getFixtures().cleanUp();
    });

    it('Create and append the <style> element for adding css rule on IE9 to IE11.', function() {
        var styleTagLen = $('style').length;
        var expected = (browser.msie && (browser.version > 9 && browser.version <= 11)) ? 2 : 0;

        expect(styleTagLen).toEqual(expected);
    });

    it('When placeholder property is not supported on the browser, generating the virtual placeholder.', function() {
        var $placeholder = $('span > span');
        var expected = !isSupportPlaceholder ? 3 : 0;

        expect($placeholder.length).toEqual(expected);
    });

    describe('When the virtual placeholder is generated,', function() {
        it('this element has an inline style.', function() {
            var $placeholder = $('span > span[style]');
            var expected = !isSupportPlaceholder ? 3 : 0;

            expect($placeholder.length).toEqual(expected);
        });

        it('This element is hidden, if the <input> element has already value.', function() {
            var $placeholder = $('span > span:hidden');
            var expected = !isSupportPlaceholder ? 1 : 0;

            expect($placeholder.length).toEqual(expected);
        });

        it('This element set the special attribute that don\'t copy and drag.', function() {
            var $placeholder = $('span > span[unselectable="on"]');
            var expected = !isSupportPlaceholder ? 3 : 0;

            expect($placeholder.length).toEqual(expected);
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


    it('When "hidden" method is called, placeholder that has input value changes the status to hidden.', function() {
        $('input:eq(2)').val('history back'); // input tag

        expect($('span > span:hidden').length).toEqual(!isSupportPlaceholder ? 1 : 0);

        placeholder.hide();

        expect($('span > span:hidden').length).toEqual(!isSupportPlaceholder ? 2 : 0);
    });
});
