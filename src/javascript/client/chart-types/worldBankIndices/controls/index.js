/**
 * Chart type sepecific controls logic.
 *
 * To be mixed in to the generic controls prototype.
 */
'use strict';


var d3 = require('d3');


/**
 * Chart-type specific initialisation tasks.
 * @param  {object} options Options for the chart controls.
 * @return {undefined}
 */
exports.init = function(options) {
    var controls = this;
    var d3Objects = controls.d3Objects;

    var form = d3Objects.form = d3.select(controls.form);

    // Controls.
    d3Objects.horizontal = form.select('#' + options.idSelectHorizontal);
    d3Objects.vertical = form.select('#' + options.idSelectVertical);
    d3Objects.radius = form.select('#' + options.idSelectRadius);
    d3Objects.yearRange = form.select('#' + options.idRangeYear);
    var yearSelect = d3Objects.yearSelect = form.select('#' + options.idSelectYear);

    // Dynamic control labelling.
    // Get D3 references to the min-year span and the max-year span.
    ['Min', 'Max'].forEach(function(extreme) {
        d3Objects['year' + extreme + 'Span'] = d3.select(yearSelect.node().parentNode)
            .select('.' + options['class' + extreme + 'Year']);
    });
};


/**
 * Populate the UI controls with appropriate data.
 * @param  {object} data The chart data.
 * @return {undefined}
 */
exports.populate = function(data) {
    var controls = this;

    controls.populateIndices(data);
    controls.populateYears(data);
};


// Indices select options.
exports.populateIndices = function(data) {
    var d3Objects = this.d3Objects;
    var indices;

    indices = Object.keys(data.indices).map(function(key) {
        return data.indices[key].descriptor;
    });

    ['horizontal', 'vertical', 'radius'].forEach(function(dimension) {
        var d3SelectEl = d3Objects[dimension];
        appendOptions(d3SelectEl, indices);
    });
};


// Years control options.
exports.populateYears = function(data) {
    var d3Objects = this.d3Objects;
    var years = data.years;
    var minYear = years[0];
    var maxYear = years[years.length-1];

    // Year min-max hints.
    d3Objects.yearMinSpan.text(minYear);
    d3Objects.yearMaxSpan.text(maxYear);

    // years range control.
    d3Objects.yearRange
        .attr({
            min: function() {return minYear;},
            max: function() {return maxYear;},
            step: 1
        });

    // Years select.
    appendOptions(d3Objects.yearSelect, years);
};


/**
 * Given a D3 reference to a select element populate its options
 * according the values in the data array.
 * @param  {object} d3SelectEl A D3 selection representing a select element.
 * @param  {array} data       An arrray of data to populate the options with.
 * @return {undefined}
 */
function appendOptions(d3SelectEl, data) {
    d3SelectEl.selectAll('option')
            .data(data)
            .enter()
                .append('option')
                    .attr({
                        value: function(d) {return d;},
                        title: function(d) {return d;}
                    })
                    .text(function(d) {return truncateString(d, 14);});
}


/**
 * Take a string and return a string no longer than maxNewL characters.
 * Truncated strings have their last 3 characters replaced with dots.
 * @param  {string} string The input string.
 * @return {string}        The possibly modified string.
 */
function truncateString(string, maxNewL) {
    string = string.toString();
    maxNewL = maxNewL || 16;
    var maxL = maxNewL - 3;
    var l = string.length;
    if (l > maxL) {
        return string.substring(0, maxL-1) + '...';
    }
    return string;
}