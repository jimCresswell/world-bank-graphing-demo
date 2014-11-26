/**
 * World Bank Indices chart prototype.
 */
'use strict';

var assign = require('lodash.assign');
var d3 = require('d3');

var thisChartProto = {};
var cssClass = 'world-bank-indices';

exports.extend = function(baseChartProto) {
    // set some things, add the css class.

    return assign(baseChartProto, thisChartProto);
};


/**
 * Define the prototype
 */

thisChartProto.update = function() {
    // TODO Re-slice and bind data according to accessors
    // possibly from passed in parameters here.
    this.draw();
};

thisChartProto.draw = function() {
    d3.select(this.svg)
        .selectAll('cirlce')
        .data([10,20,30,40,50])
        .enter().append('circle')
            .attr({
                cx: function(d) {return d*6;},
                cy: function(d) {return d*6;},
                r: function(d) {return d;}
            });
};