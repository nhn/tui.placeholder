'use strict';

// var instance =

require('../src/index.js');

jasmine.getFixtures().fixturesPath = 'base/test/fixtures';

describe('placeholder.js', function() {
    var browser = tui.util.browser,
        isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

    beforeEach(function() {
        loadFixtures('placeholder.html');

        tui.component.placeholder.add();
    });

    afterEach(function() {
        jasmine.getFixtures().clearCache();
        jasmine.getFixtures().cleanUp();
    });

    it('IE9,11 && webkit 브라우저에서 css rule을 추가하기 위해 style 태그가 생성된다.', function() {
        var styleTagLen = $('style').length,
            expected = (browser.msie && (browser.version > 9 && browser.version <= 11)) ? 1 : 0;

        expect(styleTagLen).toEqual(expected);
    });

    it('native 기능 제공하지 않으면서 클릭 시 placeholder 내용 사라지는 브라우저는 커스텀 placeholder가 생성된다.', function() {
        var customPlaceholderLen = $('span > span').length,
            expected = !isSupportPlaceholder ? 3 : 0; // span (wrapper tag) > span (custom placeholder tag)

        expect(customPlaceholderLen).toEqual(expected);
    });

    it('add() 메서드로 동적 앨리먼트를 추가하면 추가된 input에 커스텀 placeholder가 생성된다.', function() {
        var $parent = $('#jasmine-fixtures'),
            i = 0,
            len = 3,
            expected = !isSupportPlaceholder ? len : 0;

        for (; i < len; i += 1) {
            $parent.append('<input type="text" class="addon" placeholder="test" />');
        }

        tui.component.placeholder.add($('.addon'));

        expect($('span > .addon').length).toEqual(expected);
    });

    xit('커스텀 placeholder를 생성하면 태그에 inline style이 생성된다.', function() {
        var customPlaceholderElems = $('span > span').eq(0),
            expected = !isSupportPlaceholder ? {position: 'absolute'} : 0;

        customPlaceholderElems.each(function() {
            expect($(this)).toHaveCss({position: 'absolute'});
        });
    });

    it('커스텀 placeholder가 생성될 때 이미 value 값이 있으면 비활성화된 상태로 생성된다.', function() {
        var customPlaceholderElems = $('span > span');

        customPlaceholderElems.each(function(idx) {
            if (idx === 1) {
                expect($(this).css('display')).toEqual('none');
            }
        });
    });

    it('커스텀 placeholder는 드래그 또는 복사할 수 없다.', function() {
        var customPlaceholderElems = $('span > span');

        customPlaceholderElems.each(function() {
            expect($(this).attr('unselectable')).toEqual('on');
        });
    });

    it('커스텀 placeholder를 클릭하면 input 태그가 포커싱된다.', function() {
        var customPlaceholderElems = $('span > span');

        customPlaceholderElems.each(function() {
            $(this).click();
            expect($(this).next()).toBeFocused();
        });
    });

    it('input에 컨텐츠가 입력되면 커스텀 placeholder가 비활성화 된다.', function() {
        var inputElem = $('input:eq(1)'),
            specificValue = browser.firefox ? 'inline' : 'inline-block',
            expected = !isSupportPlaceholder ? 'none' : specificValue,
            e = $.Event('keydown');

        e.which = 40;
        inputElem.keydown(e);

        expect(inputElem.prev().css('display')).toEqual(expected);
    });
});
