/**
 * The shared model.
 */
'use strict';

var EventEmitter = require('events').EventEmitter;

var _assign = require('lodash.assign');

var chartPrototypes = require('../chart-types');

module.exports = Controls;


function Controls(controlOptions, model) {
    var controls = this;


    // Cope with lack of 'new' keyword.
    if (!(controls instanceof Controls)){
        return new Controls(controlOptions, model);
    }

    if (controlOptions.form.tagName.toLowerCase() !== 'form') {
        throw new TypeError('Please make sure the supplied id is for an form element.');
    }

    if (!model) {
        throw new TypeError('Please suppply a model for the controls.');
    }


    controls.id = controlOptions.id;
    controls.form = controlOptions.form;


    // References to expected properties.
    controls.d3Objects = {};
    controls.accessors = {};
    controls.playing = false;

    // Configuration passed in through options.
    controls.defaultAccessors = controlOptions.defaultAccessors;
    controls.transitionDuration = controlOptions.transitionDuration;

    // Turn this into the appropriate type of Chart object.
    // Methods in the chart type will override default
    // Chart object prototype methods.
    _assign(Controls.prototype, chartPrototypes[controlOptions.chartType].controls);

    // Extend the controls object with the EventEmitter functionality.
    EventEmitter.call(controls);
    _assign(Controls.prototype, EventEmitter.prototype);


    // Control chart-type initialisation tasks.
    controls.init(controlOptions);

    // Set the default accessors
    controls.setAccessors();

    // Using the model add appropriate options to the controls.
    controls.populate(model.getData(), controls.accessors);

    // Add the listeners for the DOM events on the controls.
    controls.addDomEventListeners();
}


Controls.prototype.init = function() {
    console.warn('Controls.init has not been overriden with a chart type specific method.');
};


Controls.prototype.populate = function() {
    console.warn('Controls.populate has not been overriden with a chart type specific method.');
};

Controls.prototype.addHooks = function() {
    console.warn('Controls.addHooks has not been overriden with a chart type specific method.');
};