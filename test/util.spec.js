'use strict';

// simulant library needs polyfills for IE8
require('./util/polyfill');

/* eslint-disable vars-on-top */
var simulant = require('simulant');
var util = require('../src/js/util');
/* eslint-enable vars-on-top */

describe('util.js', function() {
    describe('bindEvent', function() {
        it('should bind event handler to a target element', function() {
            var callback = jasmine.createSpy('callback');
            var input = $('<input>')[0];

            jasmine.getFixtures().set(input);
            util.bindEvent(input, 'click', callback);

            simulant.fire(input, 'click');

            expect(callback).toHaveBeenCalled();
        });

        it('should set callback function as a prop to a target element', function() {
            var input = $('<input>')[0];
            var propName = util._callbackPropName('click');
            var callback = function() {};

            util.bindEvent(input, 'click', callback);

            expect(input[propName]).toBe(callback);
        });
    });

    describe('unbindEvent', function() {
        it('should unbind event handler from a target element', function() {
            var callback = jasmine.createSpy('callback');
            var input = $('<input>')[0];

            jasmine.getFixtures().set(input);
            util.bindEvent(input, 'click', callback);
            util.unbindEvent(input, 'click');

            simulant.fire(input, 'click');

            expect(callback).not.toHaveBeenCalled();
        });

        it('should delete a callback prop from a target element', function() {
            var input = $('<input>')[0];
            var propName = util._callbackPropName('click');
            var callback = function() {};

            util.bindEvent(input, 'click', callback);
            util.unbindEvent(input, 'click');

            expect(input[propName]).toBeUndefined();
        });
    });
});
