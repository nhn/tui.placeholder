'use strict';

tui.util.defineNamespace('tui.component');
tui.component.Placeholder = require('../src/placeholder.js');

describe('placeholder.js', function() {
    var comp,
        state;

    jasmine.getFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixture/placeholder.html');

        comp = new tui.component.Placeholder();
        state = comp._propState;

        if (state) { // placeholder 기능이 정상 동작하는 브라우저인 경우 강제 메서드 호출
            comp._generatePlaceholder();
        }
    });

    afterEach(function() {
        document.body.innerHTML = '';
    });

    it('placeholder 컴포넌트를 생성한다.', function() {
        expect(comp instanceof tui.component.Placeholder).toBeTruthy();
    });

    it('컴포넌트 초기화 시 브라우저에서 input 태그의 placeholder 속성 접근 상태를 저장한다.', function() {
        expect(comp.hasOwnProperty('_propState')).toEqual(jasmine.any(Boolean));
    });

    it('컴포넌트 초기화 시 placeholder 속성을 제공하지 않는 브라우저면 span 태그가 생성된다.', function() {
        var elementsCnt = $('span').length;

        expect(elementsCnt).toBeGreaterThan(0);
    });

    it('placeholder 속성이 선언되어 있는 input 태그의 개수만큼 span 태그가 생성된다.', function() {
        var inputElemsCnt = $(':input[placeholder]').length,
            spanElemsCnt = $('span').length;

        expect(inputElemsCnt).toEqual(spanElemsCnt);
    });

    it('생성된 span 태그는 다음 input 태그와 width, left 값이 동일하다.', function() {
        var elements = $('span'),
            i = 0,
            len = elements.length,
            afterElement;

        for (; i < len; i += 1) {
            afterElement = $(elements[i]).after();

            expect($(elements[i]).offset().width).toEqual(afterElement.offset().width);
            expect($(elements[i]).offset().left).toEqual(afterElement.offset().left);
        }
    });

    it('생성된 span 태그에 click event가 바인딩된다.', function() {
        var target = $('span').eq(0),
            spyEvent = spyOnEvent(target, 'click');

        target.trigger('click');

        expect('click').toHaveBeenTriggeredOn(target);
        expect(spyEvent).toHaveBeenTriggered();
    });

    it('input 태그에 keyup event가 바인딩된다.', function() {
        var target = $('input').eq(0),
            spyEvent = spyOnEvent(target, 'keyup');

        target.trigger('keyup');

        expect('keyup').toHaveBeenTriggeredOn(target);
        expect(spyEvent).toHaveBeenTriggered();
    });

    xit('input 태그가 선택되었을 때 span 태그가 사라지지 않는다.', function() {
        var target = $('input').eq(0);

        target.trigger('focus');

        expect(target.before().style.display).not.toBeEqual('none');
    });

    xit('input 태그에 내용 입력 시 span 태그가 사라진다.', function() {
        var target = $('input').eq(0);

        target.trigger('keyup');

        expect(target.before().style.display).toBeEqual('none');
    });
});
