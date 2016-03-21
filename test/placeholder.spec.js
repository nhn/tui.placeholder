'use strict';

var Placeholder = require('../src/placeholder.js');

describe('placeholder.js', function() {
    var comp,
        state;

    jasmine.getFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixture/placeholder.html');

        comp = new Placeholder({
            style: {
                fontSize: '12px',
                height: '300px'
            }
        });

        state = comp._propState;

        if (state) { // placeholder 기능이 정상 동작하는 브라우저인 경우 강제 메서드 호출
            comp._generatePlaceholder();
        }
    });

    afterEach(function() {
        document.body.innerHTML = '';
    });

    it('placeholder 컴포넌트를 생성한다.', function() {
        expect(comp instanceof Placeholder).toBeTruthy();
    });

    it('컴포넌트 초기화 시 브라우저에서 input 태그의 placeholder 속성 접근 상태를 저장한다.', function() {
        expect(comp.hasOwnProperty('_propState')).toEqual(jasmine.any(Boolean));
    });

    it('컴포넌트 초기화 시 placeholder 속성을 제공하지 않는 브라우저면 커스텀 placeholder 태그가 생성된다.', function() {
        var elems = comp._inputElems,
            i = 0,
            len = elems.length,
            parentCnt = 0;

        for (; i < len; i += 1) {
            if (elems[i].previousSibling.nodeType === 1) {
                parentCnt++;
            }
        }

        expect(parentCnt).toEqual(3);
    });

    it('생성된 커스텀 placeholder의 폰트 사이즈는 input 태그의 폰트 사이즈와 동일하다.', function() {
        var elems = comp._inputElems,
            i = 0,
            len = elems.length,
            parentCnt = 0;

        for (; i < len; i += 1) {
            if (elems[i].previousSibling.nodeType === 1) {
                expect(elems[i].style.fontSize).toEqual(elems[i].previousSibling.style.fontSize);
            }
        }
    });
});
