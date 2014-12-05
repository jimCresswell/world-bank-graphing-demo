/**
 * The shared model.
 */
'use strict';

var _assign = require('lodash.assign');

// TODO require events ?

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

    // Turn this into the appropriate type of Chart object.
    // Methods in the chart type will override default
    // Chart object prototype methods.
    _assign(Controls.prototype, chartPrototypes[controlOptions.chartType].controls);

    controls.populate(model.getData());

    // TODO, some sort of generic 'controls updated' function
    // that the specific implementation can call and which
    // fires the event?
}


Controls.prototype.populate = function() {
    console.warn('Controls.populate has not been overriden with a chart type specific method.');
};