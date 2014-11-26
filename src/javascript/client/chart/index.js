/**
 * Chart module initialisation, housekeeping, event listeners.
 *
 */
'use strict';

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

    chart.id = '';
    chart.dimensions = {};
    chart.svg = null;
    chart.data = false;

    // Cope with lack of 'new' keyword.
    if (!(chart instanceof Chart)){
        return new Chart(chartOptions, data);
    }

    chart.id = chartOptions.id;
    chart.svg = chartOptions.svg;

    if (chart.svg.tagName !== 'svg') {
        throw new TypeError('Please make sure the supplied id is for an SVG element.');
    }

    chart.recordDimensions();

    if (!data) {
        throw new TypeError('Please suppply data for the chart.');
    }

    chart.data = data;

    // TODO instantiate an event delegate.
    // TODO add chart type specific event listeners, pass in an event delegate to add them to.
    // TODO override the draw method with the chart type specific method.
}


Chart.prototype.update = function() {
    // TODO Re-slice and bind data according to accessors
    // possibly from passed in parameters here.

    this.draw();
};


Chart.prototype.draw = function() {
    // TODO draw the chart with d3.
    console.warn('Chart.draw has not been overriden with a chart type specific method.');
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
