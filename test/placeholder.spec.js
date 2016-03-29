'use strict';

var instance = require('../src/placeholder.js');

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';
jasmine.getStyleFixtures().fixturesPath = 'base/test/fixtures';

describe('placeholder.js', function() {
    var browser = tui.util.browser,
        isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11),
        expected;

    beforeEach(function() {
        jasmine.getFixtures().clearCache();
        jasmine.getFixtures().cleanUp();

        loadFixtures('placeholder.html');
    });

    it('placeholder 컴포넌트를 생성한다.', function() {
        spyOn(instance, 'init');
        instance.init();
        expect(instance.init).toHaveBeenCalled();
    });

    it('IE9,11 && webkit 브라우저에서 css rule을 추가하기 위해 style 태그가 생성된다.', function() {
        var styleTagLen = $('style').length,
            expected = (browser.msie && (browser.version > 9 && browser.version <= 11)) ? 1 : 0;

        expect(styleTagLen).toEqual(expected);
    });

    it('native 기능 제공하지 않으면서 클릭 시 placeholder 내용 사라지는 브라우저는 커스텀 placeholder가 생성된다.', function() {
        var customPlaceholderLen,
            expected = !isSupportPlaceholder ? 3 : 0; // span (wrapper tag) > span (custom placeholder tag)

        instance.add(document.getElementsByTagName('input'));

        customPlaceholderLen = $('span > span').length;

        expect(customPlaceholderLen).toEqual(expected);
    });

    it('커스텀 placeholder가 생성되면 keydown 이벤트가 바인딩된다.', function() {

        instance.add(document.getElementsByTagName('input'));

        var inputSelector = 'span > input:eq(0)',
            inputSpyEvent = spyOnEvent(inputSelector, 'keydown');

        $(inputSelector).keydown();

        if (!isSupportPlaceholder) {
            expect('keydown').toHaveBeenTriggeredOn(inputSelector);
            expect(inputSpyEvent).toHaveBeenTriggered();
        } else {
            expect('keydown').not.toHaveBeenTriggeredOn(inputSelector);
            expect(inputSpyEvent).not.toHaveBeenTriggered();
        }
    });

    it('커스텀 placeholder가 생성되면 keyup 이벤트가 바인딩된다.', function() {
        var inputSelector = 'span > input:eq(0)',
            inputSpyEvent = spyOnEvent(inputSelector, 'keyup');

        $(inputSelector).keyup();

        if (!isSupportPlaceholder) {
            expect('keyup').toHaveBeenTriggeredOn(inputSelector);
            expect(inputSpyEvent).toHaveBeenTriggered();
        } else {
            expect('keyup').not.toHaveBeenTriggeredOn(inputSelector);
            expect(inputSpyEvent).not.toHaveBeenTriggered();
        }
    });
});
