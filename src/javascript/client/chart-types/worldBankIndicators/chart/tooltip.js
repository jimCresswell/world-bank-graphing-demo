/**
 * Tooltip functionality.
 *
 * To be mixed into the parent chart prototype.
 */
'use strict';

var d3 = require('d3');
var formatValuesFactory = require('./helpers').formatValuesFactory;


/**
 * Populate and show the tooltip.
 *
 * @param  {D3 selection} dataPoint
 * @return {undefined}
 */
exports.showTooltip = function(dataPoint) {
    var chart = this;
    var tooltip = chart.d3Objects.tooltip;

    // Make sure the tooltip is on top of the chart.
    var node = tooltip.node();
    node.parentNode.appendChild(node);

    // Share the data point data with the
    // tooltip in a D3 friendly format.
    var dataObject = dataPoint.data()[0];
    var data = [];
    data.push(dataObject.region);
    ['x','y','z'].forEach(function(dimension) {
        var accessor = chart.accessors[dimension];
        var indicatorObject = chart.data.indicators[accessor];
        var descriptor = indicatorObject.descriptor;
        var labelString = accessor.length > 40 ? descriptor : accessor;
        var formatter = formatValuesFactory(indicatorObject.symbol);
        data.push(labelString + ': ' + formatter(dataObject[dimension]));
    });

    // Build the tooltip content.
    var updateSelection = tooltip.selectAll('text').data(data);

    updateSelection.enter()
        .append('text');

    updateSelection.exit()
        .remove();

    updateSelection
        .text(function(d) {return d;})
        .attr({
           y: function(d, i) {return 20*i;}
        });

    // Calculate the offset directions for
    // tooltip according to which chart
    // quadrant the data point is in.
    // The default tooltip offset (in the
    // top left quadrant) is down and to
    // the right.
    var xOffsetSign = 1;
    var yOffsetSign = 1;
    var textAnchor = 'start';
    var plotWidth = chart.dimensions.width - chart.padding.left - chart.padding.right;
    var plotHeight = chart.dimensions.height - chart.padding.top - chart.padding.bottom;
    var translate = d3.transform(dataPoint.attr('transform')).translate;
    var xTranslate = translate[0];
    var yTranslate = translate[1];
    if (xTranslate >= plotWidth/2) {
        xOffsetSign = -1;
        textAnchor = 'end';
    }
    if (yTranslate >= plotHeight/2) {
        yOffsetSign = -1;
    }

    // Have to set display initial before measuring
    // tooltip bounding box or IE will claim the
    // height is 0.
    tooltip.style('display', 'initial');

    // Position the tooltip according to
    // its offset directions.
    tooltip
        .attr('transform', function() {
            var circleRadius = chart.scales.z(dataObject.z);

            // Default, move the tooltip down a bit.
            var yOffset = yTranslate + yOffsetSign * circleRadius * 0.5;

            // Move the tooltip up.
            if (yOffsetSign === -1) {
                yOffset = yTranslate + yOffsetSign * (tooltip.node().getBoundingClientRect().height - circleRadius);
            }

             // DEBUG
            console.log(yOffsetSign, yTranslate, tooltip.node().getBoundingClientRect().height, yOffset);

            // Horizontal displacement, acts together with
            // text-anchor: start/end.
            // Offset by circle radius plus a constant.
            var xOffset = xTranslate + xOffsetSign * (circleRadius + 4);

            return 'translate(' + xOffset + ',' + yOffset + ')';
        })
        .style({
            'text-anchor': textAnchor
        });
};

exports.hideTooltip = function() {
    this.d3Objects.tooltip.style('display', 'none');
};
