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

// Colours per region.
// 9 Colours, contrasting.
// From http://colorbrewer2.org/
var coloursRange = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)'];

// Legend configuration.
// The padding between side by side item groups in the legend in px.
var legendItemPadding = 10;

exports.init = function() {
    var chart = this;
    var d3Objects = chart.d3Objects;
    var d3Svg = d3Objects.svg = d3.select(chart.svg);

    chart.hasLegend = true;
    chart.legendItemPadding = legendItemPadding;

    chart.cssClass = cssClass;
    d3Svg.classed(cssClass, true);

    // Append the elements of the chart.
    d3Objects.axes = {x:null, y:null};
    d3Objects.axes.x = d3Svg.append('g').classed('axis x-axis', true);
    d3Objects.axes.y = d3Svg.append('g').classed('axis y-axis', true);
    d3Objects.legend = d3Svg.append('g').classed('legend', true);
    d3Objects.chartArea = d3Svg.append('g').classed('chart__area', true);
};


/**
 * Is the chart wide according to the current breakpoint width
 * and the expected breakpoints.
 *
 * @return {Boolean} Is the chart wide?
 */
exports.isWide = function() {
    return parseInt(this.breakpointWidth) >= this.breakPoints.wide;
};


exports.isVeryNarrow = function() {
    return parseInt(this.breakpointWidth) < this.breakPoints.narrow;
};


exports.resetLegendDimensions = function() {
    this.setLegendWidth();
    this.setLegendRectWidth();
    this.positionLegendItems();
};


exports.setLegendWidth = function() {
    var chart = this;

    chart.legendWidth = this.baseFontSize * 24;
};


exports.setLegendRectWidth = function() {
    var chart = this;
    var rectWidth;

    rectWidth = (chart.legendWidth/2) - chart.legendItemPadding;

    // Set the width on the legend item rectangles.
    chart.d3Objects.legend.selectAll('.legend__item rect')
        .attr({
            width: rectWidth
        });
};


// Chart area SVG padding in pixels.
// Depends on the computed dimensions of the legend.
exports.setAreaChartPadding = function() {
    var chart = this;
    var legend = chart.d3Objects.legend;

    var legendDimensions = legend.node().getBoundingClientRect();

    chart.padding = {
        top: 30 + legendDimensions.height,
        right: 20,
        bottom: 50,
        yAxis: 60
    };
    chart.padding.left = chart.padding.yAxis + 20;
};


exports.positionChartElements = function () {
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
            matches = unit.match(new RegExp('[%$£]|'+altPercentageString));
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


// Ordinal scales dependent only on the data.
exports.calculateOrdinalScales = function() {
    var scales = this.scales;

    // Ordinal scale mapping region name to a colour
    // from a range generated with
    // http://colorbrewer2.org/
    scales.regionColour = d3.scale.ordinal()
        .domain(this.data.regions)
        .range(coloursRange.map(function(colour) {return d3.rgb(colour);}));
};


// Dimensional scales dependent on the viewport dimensions.
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

    scales.x.range([0, chartDimensions.width - padding.left - padding.right]);
    scales.y.range([chartDimensions.height - padding.top - padding.bottom, 0]);
    scales.z.range(this.zRange || defaultZRange);
};



exports.draw = function() {
    this.drawLegend();
    this.drawChart();
};

/**
 * Draw the graph
 * @return {undefined}
 */
exports.drawChart = function() {
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


exports.drawLegend = function() {
    this.positionLegend();
    this.populateLegend();
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

    var xAccessor = chart.accessors.x;
    xLabel
        .append('text')
        .text(data.indices[xAccessor].descriptor);
    xLabel
        .append('title')
        .text(xAccessor);

    var yLabel = chart.d3Objects.axes.y
        .append('g')
        .classed('label yAxis__label', true);

    var yAccessor = chart.accessors.y;
    yLabel
        .append('text')
        .text(data.indices[yAccessor].descriptor);
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


// Position the legend on the chart.
exports.positionLegend = function() {
    var chart = this;
    var xOffset = Math.max(0, chart.dimensions.width/2 - chart.legendWidth/2);
    var yOffset = 0;

    chart.d3Objects.legend
        .attr({
            transform: 'translate(' + xOffset  + ',' + yOffset + ')'
        });
};


exports.populateLegend = function() {
    var chart = this;
    var data = chart.data;
    var legend = chart.d3Objects.legend;
    var rectHeight = 17;

    var legendRegions = legend.selectAll('g')
        .data(data.regions)
        .enter()
        .append('g')
            .classed('legend__item', true);

    chart.positionLegendItems();

    legendRegions.append('rect')
        .attr({
            height: rectHeight
        }).style({
            fill: function(d) {return chart.scales.regionColour(d);}
        });

    chart.setLegendRectWidth();

    legendRegions.append('text')
        .text(function(d) {return (/[^\()]*/.exec(d))[0];})
        .attr({
            x: 5,
            y: rectHeight/1.25,
            'text-rendering': 'optimizeLegibility'
        })
        .style({
            'font-size': '0.8em',
            'font-weight': 900
        });
};


exports.positionLegendItems = function () {
    var chart = this;
    var groupYOffset = 20;
    var maxItemsInColumn = 5;

    chart.d3Objects.legend.selectAll('.legend__item')
        .attr({
            transform: function(d, index) {
                var column, row, xOffset, yOffset;

                // Wide legend with multi-column layout.
                column = Math.floor(index/maxItemsInColumn); // 0 .. N
                row = index % maxItemsInColumn; // 0 .. maxItemsInColumn-1
                xOffset = (chart.legendWidth/2) * column;
                yOffset = groupYOffset * row;

                return 'translate(' + xOffset + ','+ yOffset + ')';
            }
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


/**
 * Given a node append a tooltip to it.
 *
 * Note: can't append node after setting content
 * because the content relies on the inherited
 * data from the parent node and because the
 * getBoundingClientRect method requires
 * the element to be in the DOM.
 *
 * @param  {DOMNode} node
 * @return {undefined}
 */
exports.appendTooltip = function(node) {
    var chart = this;
    var datapoint = d3.select(node);
    var tooltip = datapoint.append('g');

    tooltip
        .classed('tooltip', true);


    // Calculate the offset directions for
    // tooltips according to which chart
    // quadrant the datapoint is in.
    // The default tooltip offset (in the
    // top left quadrant) is down and to
    // the right.
    var xOffsetSign = 1;
    var yOffsetSign = 1;
    var textAnchor = 'start';
    var plotWidth = chart.dimensions.width - chart.padding.left - chart.padding.right;
    var plotHeight = chart.dimensions.height - chart.padding.top - chart.padding.bottom;
    var translate = d3.transform(datapoint.attr('transform')).translate;
    var xTranslate = translate[0];
    var yTranslate = translate[1];
    if (xTranslate >= plotWidth/2) {
        xOffsetSign = -1;
        textAnchor = 'end';
    }
    if (yTranslate >= plotHeight/2) {
        yOffsetSign = -1;
    }

    // Append the region tooltip content.
    tooltip.append('text')
        .text(function(d) {return d.region;});

    // Append the indices descriptors and values content
    // with a vertical offset.
    ['x','y','z'].forEach(function(dimension, i) {
        var indexObject = chart.data.indices[chart.accessors[dimension]];
        var descriptor = indexObject.descriptor;
        var formatter = formatValuesFactory(indexObject.symbol);
        tooltip.append('text')
            .text(function(d) {return descriptor + ': ' + formatter(d[dimension]);})
            .attr({
               y: 20*(i+1)
            });
    });

    // Position the tooltip according to
    // its offset directions.
    tooltip
        .attr('transform', function(d) {
            var circleRadius = chart.scales.z(d.z);

            // Default, move the tooltip down a bit.
            var yOffset = yOffsetSign * circleRadius * 0.5;

            // Move the tooltip up.
            if (yOffsetSign === -1) {
                yOffset = yOffsetSign * (tooltip.node().getBoundingClientRect().height - circleRadius);
            }

            // Horizontal displacement, acts together with
            // text-anchor: start/end.
            // Offset by circle radius plus a constant.
            var xOffset = xOffsetSign * (circleRadius + 4);

            return 'translate(' + xOffset + ',' + yOffset + ')';
        })
        .style({'text-anchor': textAnchor});
};



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
