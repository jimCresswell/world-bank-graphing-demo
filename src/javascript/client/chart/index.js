/**
 * Chart module initialisation, housekeeping, event listeners.
 *
 */
'use strict';

var _assign = require('lodash.assign');

var chartPrototypes = require('../chart-types');

module.exports = Chart;


/**
 * Creates a new chart.
 * @class
 * @param {object} chartOptions Chart construction options
 *                              id: [required, string] id of svg element to target.
 *                              model: [required, object] the model for the chart.
 */
function Chart(chartOptions, model) {
    var chart = this;

    // Cope with lack of 'new' keyword.
    if (!(chart instanceof Chart)){
        return new Chart(chartOptions, model);
    }

    if (chartOptions.svg.tagName.toLowerCase() !== 'svg') {
        throw new TypeError('Please make sure the supplied id is for an SVG element.');
    }

    if (!model) {
        throw new TypeError('Please suppply a model for the chart.');
    }


    // Assign the data.
    chart.data = model.getData();


    // Turn this into the appropriate type of Chart object.
    // Methods in the chart type will override default
    // Chart object prototype methods.
    _assign(Chart.prototype, chartPrototypes[chartOptions.chartType].chart);


    // Chart *constructor* prototype properties which can be overriden by chart options.
    Chart.prototype.config.hasLegend = (chartOptions.hasLegend !== undefined) ? chartOptions.hasLegend : (Chart.prototype.config.hasLegend || false);


    // Chart object properties expected to exist.
    chart.accessors = {};
    chart.baseFontSize = false;
    chart.legendWidth = 0;
    chart.dimensions = {};
    chart.scales = {};
    chart.d3Objects = {};


    // Chart object properties defined by passed in chart options.
    chart.id = chartOptions.id;
    chart.svg = chartOptions.svg;
    chart.defaultAccessors = chartOptions.defaultAccessors;
    chart.zRange = chartOptions.zRange || [10, 20];


    // Do some setup as defined by the chart type prototype.
    chart.init();

    // Record the initial dimensions of the chart
    // so that scales can be caculated and calls
    // to chart.onResize will work the first time.
    chart.recordDimensions();

    chart.recordBaseFontsize();

    // Record the width of the current breakpoint if any.
    chart.recordbreakpointWidth();

    // Depends viewport width and breakpoint.
    if (chart.config.hasLegend) {
        chart.setLegendWidth();
    }

    // Data operations.
    // Defaults to default accessors.
    chart.setAccessors();
    chart.deriveCurrentData();
    chart.findDataExtremes();

    // Ordinal scales only dependent on the data.
    chart.calculateOrdinalScales();

    // Draw the legend.
    if (chart.config.hasLegend) {
        chart.drawLegend();
    }

    // The chart area padding depends on the computed legend dimensions.
    chart.setAreaChartPadding();

    // Position the chart area and the axes. Depends on chart area padding.
    chart.positionChartElements();

    // Dependent on data and chart are dimensions and necessary drawing chart area.
    chart.calculateScales();

    // Draw the chart.
    chart.drawChart();
}


Chart.prototype.init = function() {
    console.warn('Chart.init has not been overriden with a chart type specific method.');
};


Chart.prototype.positionChartElements = function() {
    console.warn('Chart.positionChartElements has not been overriden with a chart type specific method.');
};

Chart.prototype.draw = function() {
    console.warn('Chart.draw has not been overriden with a chart type specific method.');
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


Chart.prototype.resetLegendDimensions = function() {
    console.warn('Chart.resetLegendDimensions has not been overriden with a chart type specific method.');
};


Chart.prototype.positionLegend = function() {
    console.warn('Chart.positionLegend has not been overriden with a chart type specific method.');
};


Chart.prototype.setAreaChartPadding = function() {
    console.warn('Chart.setAreaChartPadding has not been overriden with a chart type specific method.');
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

    // If no breakpoint is set replace the empty string with 0.
    this.breakpointWidth = getbreakpointWidth() || 0;
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

        if (this.config.hasLegend) {
            this.resetLegendDimensions();
            this.positionLegend();
        }

        this.setAreaChartPadding(); // Depends on legend dimensions.

        this.positionChartElements();
        this.calculateScales();
        this.drawAxes();
        this.positionAxesLabels();
        this.rescaleDataPoints();
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

    var breakpointWidth = window.getComputedStyle(breakpointHintEl).width;

    return breakpointWidth;
}