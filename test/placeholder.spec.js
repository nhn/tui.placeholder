'use strict';

var instance = require('../src/placeholder.js');

describe('placeholder.js', function() {
    var browsers = tui.util.browser,
        fakeValue;

    jasmine.getFixtures().fixturesPath = 'base';

    beforeEach(function() {
        loadFixtures('test/fixtures/placeholder.html');
    });

    afterEach(function() {
        document.body.innerHTML = '';
    });

    it('IE9,11 && webkit 브라우저에서 css rule을 추가하기 위해 style 태그가 생성된다.', function() {
        var styleTagLen = document.getElementsByTagName('style').length,
            type,
            expected;

        fakeValue = {
            chrome: 1,
            firefox: 0,
            msie: {
                7: 0,
                8: 0,
                9: 0,
                10: 1,
                11: 1,
                46: 0
            }
        };

        for (type in browsers) {
            if (browsers[type] === true) {
                expected = (type !== 'msei') ? fakeValue[type] : fakeValue[type][browsers.version];
                expect(styleTagLen).toEqual(expected);
            }
        }
    });

    it('placeholder 컴포넌트를 생성한다.', function() {
        spyOn(instance, 'init');
        instance.init();
        expect(instance.init).toHaveBeenCalled();
    });

    xit('native placeholder 기능을 제공하지 않는 브라우저는 커스텀 placeholder가 생성된다.', function() {
        var customPlaceholderLen,
            type,
            expected;

        fakeValue = {
            chrome: 0,
            firefox: 0,
            msie: {
                7: 3,
                8: 3,
                9: 3,
                10: 3,
                11: 3,
                46: 0
            }
        };

        instance.add(document.getElementsByTagName('input'));

        for (type in browsers) {
            if (browsers[type] === true) {
                customPlaceholderLen = $('input').before().length;
                expected = (type !== 'msei') ? fakeValue[type] : fakeValue[type][browsers.version];
                expect(customPlaceholderLen).toEqual(expected);
            }
        }
    });

    xit('컴포넌트 생성 시 add() 메서드가 호출되고 커스텀 placeholder가 자동 생성된다.', function() {
        var elemsCnt = 0;

        placeholder.add();

        if (state) {
            placeholder._generatePlaceholder();
        }

        placeholder._inputElems.forEach(function(elem) {
            if (elem.getAttribute('placeholder')) {
                elemsCnt += 1;
            }
        });

        expect(elemsCnt).toEqual(3);
    });

    xit('add() 메서드 호출 시 추가된 앨리먼트에만 커스텀 placeholder가 생성된다.', function() {
        var parent = document.getElementById('add-area'),
            i = 1,
            len = 5,
            html = '',
            selectedElems;

        for (; i <= len; i += 1) {
            html += '<div class="placeholder"><input type="text" placeholder="test" /></div>';
        }

        parent.innerHTML = html;

        selectedElems = parent.getElementsByTagName('input');

        placeholder.add(selectedElems);

        placeholder._inputElems.forEach(function(elem) {
            expect(elem.getAttribute('placeholder')).toEqual('test');
        });
    });

    xit('컴포넌트 초기화 시 브라우저에서 input 태그의 placeholder 속성 접근 상태를 저장한다.', function() {
        expect(comp.hasOwnProperty('_propState')).toEqual(jasmine.any(Boolean));
    });

    xit('컴포넌트 초기화 시 placeholder 속성을 제공하지 않는 브라우저면 커스텀 placeholder 태그가 생성된다.', function() {
        var elems = comp._inputElems,
            i = 0,
            len = elems.length,
            parentCnt = 0;

        for (; i < len; i += 1) {
            if (elems[i].previousSibling.nodeType === 1) {
                parentCnt += 1;
            }
        }

        expect(parentCnt).toEqual(3);
    });

    xit('생성된 커스텀 placeholder의 폰트 사이즈는 input 태그의 폰트 사이즈와 동일하다.', function() {
        var elems = comp._inputElems,
            i = 0,
            len = elems.length;

        for (; i < len; i += 1) {
            if (elems[i].previousSibling.nodeType === 1) {
                expect(elems[i].style.fontSize).toEqual(elems[i].previousSibling.style.fontSize);
            }
        }
    });
});
