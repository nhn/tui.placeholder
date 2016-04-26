'use strict';

var Placeholder = require('./src/placeholder.js');
var sharedInstance = new Placeholder();
var component = tui.util.defineNamespace('tui.component');

component.placeholder = function(elements) {
    sharedInstance.add(elements);
    sharedInstance.generatePlaceholder();
};
