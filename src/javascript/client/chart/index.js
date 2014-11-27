/**
 * Chart module initialisation, housekeeping, event listeners.
 *
 */
'use strict';

var assign = require('lodash.assign');

var chartPrototypes = require('./chart-types');

module.exports = Chart;


/**
 * Creates a new chart.
 * @class
 * @param {object} chartOptions Chart construction options
 *                              id: [required, string] id of svg element to target.
 *                              data: [required, object] the data to chart.
 */
function Chart(chartOptions, data) {
    var chart = this;

    // Chart object properties.
    chart.id = chartOptions.id;
    chart.svg = chartOptions.svg;
    chart.defaultAccessors = chartOptions.defaultAccessors;
    chart.zRange = chartOptions.zRange || false;
    chart.accessors = {};
    chart.dimensions = {};
    chart.scales = {};
    chart.data = {};
    chart.d3Objects = {};

    // Cope with lack of 'new' keyword.
    if (!(chart instanceof Chart)){
        return new Chart(chartOptions, data);
    }

    if (chart.svg.tagName !== 'svg') {
        throw new TypeError('Please make sure the supplied id is for an SVG element.');
    }

    if (!data) {
        throw new TypeError('Please suppply data for the chart.');
    }

    // Turn this into the appropriate type of Chart object.
    // Methods in the chart type will override default
    // Chart object prototype methods.
    assign(Chart.prototype, chartPrototypes[chartOptions.chartType]);

    // Record the initial dimensions of the chart
    // so that scales can be caculated and calls
    // to chart.onResize will work the first time.
    chart.recordDimensions();

    // Do some setup.
    chart.init();

    chart.addRawData(data);

    chart.setAccessors();

    chart.deriveCurrentData();

    chart.calculateScales();
}


Chart.prototype.init = function() {
    console.warn('Chart.init has not been overriden with a chart type specific method.');
};


Chart.prototype.draw = function() {
    console.warn('Chart.draw has not been overriden with a chart type specific method.');
};


Chart.prototype.addRawData = function() {
    console.warn('Chart.addRawData has not been overriden with a chart type specific method.');
};


Chart.prototype.deriveCurrentData = function() {
    console.warn('Chart.deriveCurrentData has not been overriden with a chart type specific method.');
};


Chart.prototype.setAccessors = function() {
    console.warn('Chart.setAccessors has not been overriden with a chart type specific method.');
};


Chart.prototype.calculateScales = function() {
    console.warn('Chart.calculateScales has not been overriden with a chart type specific method.');
};

Chart.prototype.rescaleDataPoints = function() {
    console.warn('Chart.rescaleDataPoints has not been overriden with a chart type specific method.');
};

Chart.prototype.getDimensionsFromDom = function() {
    var dimensions;

    if (!this.svg) {
        throw new TypeError('Don\'t try and measure the SVG before assigning it to the Chart object.');
    }

    dimensions = this.svg.getBoundingClientRect();

    if (!dimensions.width || !dimensions.height) {
        throw new RangeError(
            'The chart sizes, width: ' +
            dimensions.width +
            ', height: ' +
            dimensions.height +
            ' are invalid. Please set the height and width styles on the SVG element inline or with CSS.'
        );
    }

    return dimensions;
};


/**
 * Record the chart dimensions take from the DOM.
 *
 * @return {boolean} true if the dimensions changed, false otherwise.
 */
Chart.prototype.recordDimensions = function() {
    var oldDimensions = this.dimensions;
    var newDimensions = this.getDimensionsFromDom();

    if (newDimensions.width !== oldDimensions.width || newDimensions.height !== oldDimensions.height) {
        this.dimensions = newDimensions;
        return true;
    }
    return false;
};


/**
 * If resizing the viewport has resized the SVG then re-draw.
 * @return {undefined}
 */
Chart.prototype.onResize = function() {
    if (this.recordDimensions()) {
        this.calculateScales();
        this.rescaleDataPoints();
    }
};
