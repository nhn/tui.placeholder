'use strict';

var instance = require('../src/placeholder.js');

describe('placeholder.js', function() {
    var browser = tui.util.browser,
        isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11),
        expected;

    jasmine.getFixtures().fixturesPath = 'base';
    jasmine.getStyleFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixtures/placeholder.html');
    });

    afterEach(function() {
        document.innerHTML = '';
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

    it('native 기능을 제공하지 않고 클릭 시 placeholder 내용 사라지는 브라우저는 커스텀 placeholder가 생성된다.', function() {
        var customPlaceholderLen = $('span > span').length,
            expected = !isSupportPlaceholder ? 3 : 0; // span (wrapper tag) > span (custom placeholder tag)

        expect(customPlaceholderLen).toEqual(expected);
    });

    it('생성된 커스텀 placeholder의 input 태그는 inline-style을 가진다.', function() {
        var expected = !isSupportPlaceholder ? {'font-size': '11px', 'line-height': 'normal'} : '';

        $('span > input').each(function(index) {
            expect($(this)).toHaveCss(expected);
        });
    });

    it('style이 정의된 경우 생성된 커스텀 placeholder의 inline-style은 상속 상태로 생성된다.', function() {
        var expected = !isSupportPlaceholder ? {'font-size': '24px', 'line-height': '24px'} : '';

        loadStyleFixtures('test/fixtures/placeholder.css');

        expect($('span > input:eq(0)')).toHaveCss(expected);
    });

    it('커스텀 placeholder가 생성되면 keydown 이벤트가 바인딩된다.', function() {
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
