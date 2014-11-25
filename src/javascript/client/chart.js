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
 */
function Chart(chartOptions) {
    var chart = this;

    // Cope with lack of 'new' keyword.
    if (!(chart instanceof Chart)){
        return new Chart(chartOptions);
    }

    chart.id = '';
    chart.dimensions = {};
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

    chart.recordDimensions();

    if (!chartOptions.data) {
        throw new TypeError('Please suppply data for the chart.');
    }
    chart.data = chartOptions.data;

    chart.addResizeListener();

    chart.draw();
}


Chart.prototype.draw = function() {
    // TODO draw the chart with d3.
    console.log('Drawing...');
};


Chart.prototype.getDimensionsFromDom = function() {
    var dimensions = this.svg.getBoundingClientRect();

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
        this.draw();
    }
};


Chart.prototype.addResizeListener = function() {
    var throttleLimit = 100; // Milliseconds.

    // Call onResize at most once every throttleLimit milliseconds.
    window.addEventListener('resize', throttle(this.onResize.bind(this), throttleLimit, {trailing: true}));
};
