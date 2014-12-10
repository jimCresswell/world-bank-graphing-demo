/**
 * Legend functionality.
 *
 * To be mixed into the parent chart prototype.
 *
 * Tight coupling to chart index.js module
 *   * this.wide()
 *   * chart.dimensions
 *   * chart.d3Objects
 *   * chart.data
 *   * chart.scales
 *   * chart.baseFontSize
 *   * chart.config
 */
'use strict';


exports.drawLegend = function() {
    this.populateLegend();
    this.positionLegend();
};


// Position the legend on the chart.
exports.positionLegend = function() {
    var chart = this;
    var legend = chart.d3Objects.legend;
    var xOffset = Math.max(0, chart.dimensions.width/2 - chart.legendWidth/2);
    var legendHeight = legend.node().getBoundingClientRect().height;
    var yOffset = chart.legendAboveChart() ? 0 : (chart.dimensions.height - legendHeight);

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

    // Only include region descriptions up to any opening bracket.
    legendRegions.append('text')
        .text(function(d) {return (/[^\()]*/.exec(d))[0];})
        .attr({
            x: 5,
            y: rectHeight/1.25
        });

    // Set a title with the full region value.
    legendRegions.append('title')
        .text(function(d) {return d;});
};


exports.resetLegendDimensions = function() {
    this.setLegendWidth();
    this.setLegendRectWidth();
    this.positionLegendItems();
};


// Calculate the current optimum number
// of columns for the legend.
exports.numLegendColumns = function() {
    var chart = this;
    if (chart.isAtleastMedium()) {
        return 3;
    } else if (chart.isAtleastNarrow()) {
        return 2;
    }
    return 1;
};


exports.setLegendWidth = function() {
    var chart = this;
    var singleColumnEms = 12;
    var numColumns = chart.numLegendColumns();

    if (numColumns > 1) {
        chart.legendWidth = chart.baseFontSize * singleColumnEms * numColumns;
    } else {
        chart.legendWidth = chart.dimensions.width;
    }
};


exports.setLegendRectWidth = function() {
    var chart = this;
    var numColumns = chart.numLegendColumns();
    var rectWidth;

    rectWidth = (chart.legendWidth/numColumns) - chart.config.legendItemPadding*(numColumns-1);

    // Set the width on the legend item rectangles.
    chart.d3Objects.legend.selectAll('.legend__item rect')
        .attr({
            width: rectWidth
        });
};


exports.positionLegendItems = function () {
    var chart = this;
    var legendItems = chart.d3Objects.legend.selectAll('.legend__item');
    var numColumns = chart.numLegendColumns();
    var maxItemsInColumn = Math.ceil(legendItems.size()/numColumns);
    var groupXoffset = chart.legendWidth/numColumns;
    var groupYOffset = 20;

    legendItems
        .attr({
            transform: function(d, index) {
                var column, row, xOffset, yOffset;

                // Wide legend with multi-column layout.
                column = Math.floor(index/maxItemsInColumn); // 0 .. numColumns-1
                row = index % maxItemsInColumn; // 0 .. maxItemsInColumn-1

                xOffset = groupXoffset * column;
                yOffset = groupYOffset * row;

                return 'translate(' + xOffset + ','+ yOffset + ')';
            }
        });
};
