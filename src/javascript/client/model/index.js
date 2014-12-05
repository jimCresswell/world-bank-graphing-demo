/**
 * The shared model.
 */
'use strict';

var _assign = require('lodash.assign');

var chartPrototypes = require('../chart-types');

module.exports = Model;


function Model(modelOptions, data) {
    var model = this;

    // Cope with lack of 'new' keyword.
    if (!(model instanceof Model)){
        return new Model(modelOptions, data);
    }

    if (!data) {
        throw new TypeError('Please suppply data for the model.');
    }

    // Turn this into the appropriate type of Chart object.
    // Methods in the chart type will override default
    // Chart object prototype methods.
    _assign(Model.prototype, chartPrototypes[modelOptions.chartType].model);

    model.addRawData(data);
}


// Can be overriden in the chart-type specific model methods.
Model.prototype.addRawData = function(data) {
    this.data = data;
};


Model.prototype.getData = function() {
    return this.data;
};
