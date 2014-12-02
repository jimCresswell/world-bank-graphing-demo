/**
 * World Bank Indices chart prototype.
 */
'use strict';

var d3 = require('d3');
var _isNaN = require('lodash.isnan');
var _compact = require('lodash.compact');

var cssClass = 'chart--world-bank-indices';

// Default Z range in pixels.
var defaultZRange = [10, 15];

// Tooltip config.
var tooltipXoffset = 25;

// Colours per region.
// 9 Colours, contrasting.
// From http://colorbrewer2.org/
var coloursRange = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)'];


exports.init = function() {
    var chart = this;
    var d3Objects = chart.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(chart.svg);

    chart.cssClass = cssClass;
    d3Svg.classed(cssClass, true);

    // Append the elements of the chart.
    d3Objects.axes = {x:null, y:null};
    d3Objects.axes.x = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.axes.y = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);

    // Chart area SVG padding in pixels.
    chart.padding = {
        top: 25,
        right: 20,
        bottom: 50,
        yAxis: 60
    };
    chart.padding.left = chart.padding.yAxis + 20;
};


exports.positionElements = function () {
    var chart = this;

    // Axes and plot shifted right by the padding.
    // X-axis and plot shifted right more so that data don't hit y-axis.
    // X-axis shifted down by the (chart height - padding).

    // Move the axes locations to account for padding on the plot area.
    chart.d3Objects.axes.x
        .attr('transform', 'translate(' + chart.padding.left + ', ' + (chart.dimensions.height-chart.padding.bottom) + ')');
    chart.d3Objects.axes.y
        .attr('transform', 'translate(' + chart.padding.yAxis + ',' + chart.padding.top + ')');

    // Move the plot area to account for padding on the plot area.
    chart.d3Objects.chartArea
        .attr('transform', 'translate(' + chart.padding.left + ', ' + chart.padding.top + ')');
};


// TODO: move to model or viewmodel.
exports.addRawData = function(rawData) {
    var data = this.data = {};

    // rawData[region][index] == [{year:, value:},{year:, value:},...]
    data.rawData = rawData;

    // Get the geographical regions.
    var regions = data.regions = Object.keys(rawData);

    // Each region has the same development indices
    // so no need to loop over regions.
    var indexKeys = Object.keys(rawData[regions[0]]);

    // Extract information about each index;
    data.indices = {};
    indexKeys.forEach(function (indexName) {
        var descriptor, unit, symbol, matches = [];

        // Some percentages are have a unit
        // of 'per 100 <something>'.
        var altPercentageString = 'per 100';

        // descriptor [(unit)]
        // e.g. GDP growth (annual %)
        // e.g. Population, total
        matches = indexName.match(/([^\(]+)\(?([^\)]*)/);
        descriptor = matches[1];
        unit = matches[2] || false;

        // Unit can be undefined for an index.
        // Unit does not have to contain a symbol.
        if (unit) {
            matches = unit.match(new RegExp('[\%\$\£]|'+altPercentageString));
            symbol = matches ? matches[0] : false;

            // Cope with some values being labelled
            // 'per 100' instead of %.
            if (symbol === altPercentageString) {
                symbol = '%';
            }
        }

        data.indices[indexName] = {
            descriptor: descriptor,
            unit: unit,
            symbol: symbol
        };
    });

    // Each index has the same years
    // so no need to loop.
    data.years = Object.keys(rawData[regions[0]][indexKeys[0]]);
};


// TODO: move to model or viewmodel.
/**
 * Set the data accessors for the chart.
 * @param {object} accessors {x:'', y:'', z:''}
 */
exports.setAccessors = function(accessors) {
    if (accessors) {
        this.accessors = accessors;
        return;
    }
    this.accessors = this.defaultAccessors;
};


// TODO: move to model or viewmodel.
exports.deriveCurrentData = function() {
    var chart = this;
    var data = this.data;
    var year= '2000'; // TODO map over years.
    var extremes = {
        minX: undefined,
        maxX: undefined,
        minY: undefined,
        maxY: undefined,
        minZ: undefined,
        maxZ: undefined
    };

    var derivedData = data.regions.map(function(region) {
        var values = {
            region: region,
            x: parseFloat(data.rawData[region][chart.accessors.x][year]),
            y: parseFloat(data.rawData[region][chart.accessors.y][year]),
            z: parseFloat(data.rawData[region][chart.accessors.z][year])
        };

        // If any of the values are missing then skip
        // this region and year combination.
        if (_isNaN(values.x) || _isNaN(values.y) || _isNaN(values.z)) {
            return false;
        }


        // Find the extremes over all data.
        ['min', 'max'].forEach(function(extreme) {
            ['X', 'Y', 'Z'].forEach(function(dimension) {
                var currentValue = values[dimension.toLowerCase()];
                if (extremes[extreme+dimension] === undefined) {
                    extremes[extreme+dimension] = currentValue;
                } else {
                    extremes[extreme+dimension] = Math[extreme](extremes[extreme+dimension], currentValue);
                }
            });
        });

        return values;
    });

    // Record the derived data with falsey values removed.
    data.derived = _compact(derivedData);

    // Record the extreme data values.
    data.extremes = extremes;
};


exports.calculateScales = function() {
    var extremes = this.data.extremes;
    var scales = this.scales;
    var chartDimensions = this.dimensions;
    var padding = this.padding;

    // Linear scales the three data accessors
    // where the Z accessor is mapped to the
    // radius of the datapoint.
    ['X', 'Y', 'Z'].forEach(function(dimension) {
        scales[dimension.toLowerCase()] = d3.scale
            .linear()
            .domain([
                extremes['min'+dimension] * 0.95,
                extremes['max'+dimension]
            ])
            .nice();
    });

    // Ordinal scale mapping region name to a colour
    // from a range generated with
    // http://colorbrewer2.org/
    scales.regionColour = d3.scale.ordinal()
        .domain(this.data.regions)
        .range(coloursRange.map(function(colour) {return d3.rgb(colour);}));

    scales.x.range([0, chartDimensions.width - padding.left - padding.right]);
    scales.y.range([chartDimensions.height - padding.top - padding.bottom, 0]);
    scales.z.range(this.zRange || defaultZRange);
};


/**
 * Draw the graph
 * @return {undefined}
 */
exports.draw = function() {
    // DEBUG
    console.log('drawing...');

    var chart = this;

    chart.drawAxes();
    chart.labelAxes();
    chart.positionAxesLabels();

    var chartArea = this.d3Objects.chartArea;
    var dataPoints = this.d3Objects.dataPoints = chartArea
        .selectAll('g')
        .data(this.data.derived)
        .enter().append('g')
            .attr({
                transform: function(d) {
                    return 'translate(' +
                        chart.scales.x(d.x) +
                        ',' +
                         chart.scales.y(d.y) +
                        ')';
                }
            });

    // Add interaction behaviour
    // The D3 event API only allows
    // one event of each type to be
    // added to an element.
    chart.enableDatapointInteractions();

    // Add circles to the datapoints.
    dataPoints.append('circle')
        .attr({
            r: function(d) { return chart.scales.z(d.z); }
        })
        .style({
            fill: function(d) {return chart.scales.regionColour(d.region); },
            stroke: function(d) {return chart.scales.regionColour(d.region).darker(); }
        });
};


exports.drawAxes = function() {
    var chart = this;
    var indices = chart.data.indices;
    var xAxisFactory = d3.svg.axis();
    var yAxisFactory = d3.svg.axis();
    var xSymbol = indices[chart.accessors.x].symbol;
    var ySymbol = indices[chart.accessors.y].symbol;

    xAxisFactory.scale(chart.scales.x);
    xAxisFactory.tickFormat(formatValuesFactory(xSymbol));

    yAxisFactory.scale(chart.scales.y);
    yAxisFactory.tickFormat(formatValuesFactory(ySymbol));
    yAxisFactory.orient('left');

    // Append the axes.
    chart.d3Objects.axes.x.call(xAxisFactory);
    chart.d3Objects.axes.y.call(yAxisFactory);
};


exports.labelAxes = function() {
    var chart = this;
    var data = chart.data;

    var xLabel = chart.d3Objects.axes.x
        .append('g')
        .classed('label xAxis__label', true);

    var xAccessor = chart.accessors.x
    xLabel
        .append('text')
        .text(data.indices[xAccessor].descriptor);
    xLabel
        .append('title')
        .text(xAccessor);

    var yLabel = chart.d3Objects.axes.y
        .append('g')
        .classed('label yAxis__label', true);

    var yAccessor = chart.accessors.y
    yLabel
        .append('text')
        .text(data.indices[yAccessor].descriptor)
    yLabel
        .append('title')
        .text(yAccessor);
};


exports.positionAxesLabels = function() {
    var chart = this;

    // Calculated values are dynamic centering of labels, hardcoded values are spacing away from axes.
    chart.d3Objects.axes.x.select('.label')
        .attr({transform: 'translate(' + (chart.dimensions.width-chart.padding.left-chart.padding.right)/2 + ', 40)'})
        .style({'text-anchor': 'middle'});

    // The rotation means the first coordinate in the translate is effectively y, second x.
    chart.d3Objects.axes.y.select('.label')
        .attr({transform: 'rotate(-90) translate(' + -(chart.dimensions.height-chart.padding.top-chart.padding.bottom)/2 + ', -50)'})
        .style({'text-anchor': 'middle'});
};


exports.enableDatapointInteractions = function() {
    var chart = this;
    var dataPoints = chart.d3Objects.dataPoints;

    dataPoints.on('mouseover', function() {
        var node = this;
        chart.appendTooltip(node);

        // When a datapoint is interacted with
        // bring it to the top of the drawing
        // stack.
        var parent = this.parentNode;
        parent.removeChild(this);
        parent.appendChild(this);
    });

    dataPoints.on('mouseout', function() {
        var tooltip = d3.select(this).select('.tooltip');
        tooltip.remove();
    });
};


/**
 * Update the data point attributes according to
 * the current chart scales.
 * @return {undefined}
 */
exports.rescaleDataPoints = function() {
    var chart = this;
    var dataPoints = this.d3Objects.dataPoints;

    dataPoints
        .attr({
            transform: function(d) {
                return 'translate(' +
                    chart.scales.x(d.x) +
                    ',' +
                     chart.scales.y(d.y) +
                    ')';
            }
        });

    dataPoints.selectAll('circles')
        .attr({
            r: function(d) {return chart.scales.z(d.z);}
        });
};


// Given a node append a tooltip to it.
exports.appendTooltip = function(node) {
    var chart = this;
    var tooltip = d3.select(node).append('g');
    tooltip
        .classed('tooltip', true)
        .attr({
           transform: 'translate(' + tooltipXoffset + ', 0)'
        });

    // Append the region.
    tooltip.append('text')
        .text(function(d) {return d.region;});

    // Append the indices descriptors and values
    // with a horizontal and vertical offset.
    ['x','y','z'].forEach(function(dimension, i) {
        var indexObject = chart.data.indices[chart.accessors[dimension]];
        var descriptor = indexObject.descriptor;
        var formatter = formatValuesFactory(indexObject.symbol);
        tooltip.append('text')
            .text(function(d) {return descriptor + ': ' + formatter(d[dimension]);})
            .attr({
               x: 10,
               y: 20*(i+1)
            });
    });
}


/**
 * Helpers
 */


 /**
  * Given a unit symbol return a function
  * to suitably format the values of the
  * axis ticks.
  * @param  {[string} symbol
  * @return {function} string formatting function.
  */
 function formatValuesFactory(symbol) {
     return function (d) {
         switch (symbol) {
             case '%':
                 return d3.format(',f')(d) + symbol;
             case '$':
             case '£':
                 return symbol + d3.format(',s')(d);
             default:
                 return d3.format(',.2s')(d);
         }
     };
 }
