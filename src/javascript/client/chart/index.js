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
    chart.hasLegend = false; // Currently overridden in chart type.
    chart.baseFontSize = false;
    chart.legendWidth = 0;
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

    // Do some setup.
    chart.init();

    // Record the initial dimensions of the chart
    // so that scales can be caculated and calls
    // to chart.onResize will work the first time.
    chart.recordDimensions();

    // Record the width of the current breakpoint if any.
    chart.recordbreakpointWidth();

    chart.positionElements();

    chart.addRawData(data);

    chart.setAccessors();

    chart.deriveCurrentData();

    chart.calculateScales();
}


Chart.prototype.init = function() {
    console.warn('Chart.init has not been overriden with a chart type specific method.');
};


Chart.prototype.positionElements = function() {
    console.warn('Chart.positionElements has not been overriden with a chart type specific method.');
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


Chart.prototype.drawAxes = function() {
    console.warn('Chart.drawAxes has not been overriden with a chart type specific method.');
};


Chart.prototype.positionAxesLabels = function() {
    console.warn('Chart.positionAxesLabels has not been overriden with a chart type specific method.');
};


Chart.prototype.setLegendWidth = function() {
    console.warn('Chart.setLegendWidth has not been overriden with a chart type specific method.');
};


Chart.prototype.positionLegend = function() {
    console.warn('Chart.positionLegend has not been overriden with a chart type specific method.');
};


Chart.prototype.setChartPadding = function() {
    console.warn('Chart.setChartPadding has not been overriden with a chart type specific method.');
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
    var chart = this;
    var currentRecordedDimensions = chart.dimensions;
    var newDimensions = chart.getDimensionsFromDom();

    if (newDimensions.width !== currentRecordedDimensions.width || newDimensions.height !== currentRecordedDimensions.height) {
        chart.dimensions = newDimensions;
        return true;
    }
    return false;
};


/**
 * Set the base font size
 *
 * The base font size of the document is driven by
 * CSS media queries. Having this property and
 * recalculating it on resize events allows page
 * elements to be dynamically resized in relative
 * units.
 *
 * @return {undefined}
 */
Chart.prototype.recordBaseFontsize = function() {
    this.baseFontSize = Number(getComputedStyle(document.body).fontSize.match(/(\d*(\.\d*)?)px/)[1]);
};


Chart.prototype.recordbreakpointWidth = function() {

    // If no breakpoint is set replace the empty string with false.
    this.breakpointWidth = getbreakpointWidth() || false;
};


/**
 * If resizing the viewport has resized the SVG then re-draw.
 *
 * @return {undefined}
 */
Chart.prototype.onResize = function() {
    if (this.recordDimensions()) {
        this.recordBaseFontsize();
        this.recordbreakpointWidth();

        if (this.hasLegend) {
            this.setLegendWidth();
        }

        this.setChartPadding(); // Depends on legend width which defaults to 0px.

        this.positionElements();
        this.calculateScales();
        this.drawAxes();
        this.positionAxesLabels();
        this.rescaleDataPoints();

        if (this.hasLegend) {
            this.positionLegend();
        }
    }
};


/* HELPERS */


/**
 * Read the width of the breakpointHint element
 * which matches the CSS media query rule which
 * set it.
 *
 * @return {string} breakpointWidth
 */
function getbreakpointWidth() {
    var hintCssId = 'breakpointHint';
    var breakpointHintEl = document.getElementById(hintCssId);

    // If it's not there insert it into the DOM.
    if (!breakpointHintEl) {
        breakpointHintEl = document.createElement('div');
        breakpointHintEl.id = hintCssId;
        document.body.appendChild(breakpointHintEl);
    }

    var matchingStylesheets = window.getMatchedCSSRules(breakpointHintEl);
    var lastStyleSheet = matchingStylesheets[matchingStylesheets.length -1].style;

    var breakpointWidth = lastStyleSheet.width;

    return breakpointWidth;
}