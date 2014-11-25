/**
 * Chart module.
 *
 * Browser only.
 */
'use strict';

var throttle = require('lodash.throttle');

module.exports = Chart;

/**
 * Creates a new chart.
 * @class
 * @param {object} chartOptions Chart construction options
 *                              id: [required, string] id of svg element to target.
 *                              data: [required, object] the data to chart.
 *                              width: [optional, number|string] svg width in pixels.
 *                              height: [optional, number|string] svg height in pixels.
 */
function Chart(chartOptions) {
    var chart = this;
    var dimensions;

    chart.id = '';
    chart.width = 0;
    chart.height = 0;
    chart.sizeSupplied = false;
    chart.svg = null;

    if (!chartOptions.id) {
        throw new TypeError('Please supply a chart id.');
    }

    chart.id = chartOptions.id;
    chart.svg = document.getElementById(chartOptions.id);

    if (chart.svg.tagName !== 'svg') {
        throw new TypeError('Please make sure the supplied id is for an SVG element.');
    }

    if (chartOptions.width && chartOptions.height) {
        chart.sizeSupplied = true;
        chart.width = parseInt(chartOptions.width);
        chart.height = parseInt(chartOptions.height);
    } else {
        dimensions = chart.getDimensionsFromDom();
        chart.width = dimensions.width;
        chart.height = dimensions.height;
    }

    if (!chart.width || !chart.height) {
        throw new RangeError(
            'The chart size options, width: ' +
            chart.width +
            ', height: ' +
            chart.height +
            ' are invalid'
        );
    }

    // If explicit sizes were supplied then
    // set the style on the SVG object.
    if (chart.sizeSupplied) {
        chart.setDimensionStyles();
    }

    if (!chartOptions.data) {
        throw new TypeError('Please suppply data for the chart.');
    }
    chart.data = chartOptions.data;

    chart.addResizeListener();

    chart.draw();
}


Chart.prototype.getDimensionsFromDom = function() {
    return this.svg.getBoundingClientRect();
};


Chart.prototype.setDimensionStyles = function() {
    // TODO set the width and height on the svg element using d3.
};


Chart.prototype.draw = function() {
    // TODO draw the chart with d3.
    console.log('Drawing...');
};


Chart.prototype.onResize = function() {
    var dimensions = this.getDimensionsFromDom();

    // If resizing the viewport has resized the SVG then re-draw.
    if (this.width !== dimensions.width || this.height !== dimensions.height) {
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.draw();
    }
};


Chart.prototype.addResizeListener = function() {
    var throttleLimit = 100; // Milliseconds.

    // Call onResize at most once every throttleLimit milliseconds.
    window.addEventListener('resize', throttle(this.onResize.bind(this), throttleLimit, {trailing: true}));
};
