/**
 * Chart type sepecific controls logic.
 *
 * To be mixed in to the generic controls prototype.
 */
'use strict';


var d3 = require('d3');

var dimensionNamesMap = {
    horizontal: 'x',
    vertical: 'y',
    radius: 'z'
};


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
    var yearRange = d3Objects.yearRange = form.select('#' + options.idRangeYear);
    var yearSelect = d3Objects.yearSelect = form.select('#' + options.idSelectYear);

    // Dynamic control labelling.
    // Get D3 references to the min-year span and the max-year span.
    ['Min', 'Max'].forEach(function (extreme) {
        d3Objects['year' + extreme + 'Span'] = d3.select(yearSelect.node().parentNode)
            .select('.' + options['class' + extreme + 'Year']);
    });

    // Activate two way binding between the year range and year select controls.
    twowayValueBind(yearRange, yearSelect);
};


/**
 * Populate the UI controls with appropriate data.
 * @param  {object} data The chart data.
 * @param  {object} defaultAccessors The chart default accessors.
 * @return {undefined}
 */
exports.populate = function(data, defaultAccessors) {
    this.populateIndices(data, defaultAccessors);
    this.populateYears(data, defaultAccessors);
};


// Indices select options.
exports.populateIndices = function(data, defaultAccessors) {
    var d3Objects = this.d3Objects;


    // The key is needed to match on default values passed in
    // to the controls constructor. The descriptor is needed
    // so that the options in the select inputs are
    // 1) Shortish and
    // 2) Match the axes labels on the graph itself.
    var indices = Object.keys(data.indices).map(function(key) {
        return {
            name: key,
            value: data.indices[key].descriptor
        };
    });

    ['horizontal', 'vertical', 'radius'].forEach(function(dimension) {
        var d3SelectEl = d3Objects[dimension];
        var defaultValue = defaultAccessors[dimensionNamesMap[dimension]];
        appendOptions(d3SelectEl, indices, defaultValue);
    });
};


// Years control options.
exports.populateYears = function(data, defaultAccessors) {
    var d3Objects = this.d3Objects;
    var years = data.years;
    var defaultYear = defaultAccessors.year;
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
            value: defaultYear,
            step: 1
        });

    // Years select.
    appendOptions(d3Objects.yearSelect, years, defaultYear);
};


/**
 * Provide 'onChange' value binding between two D3 objects representing input controls.
 * @param  {object} d3El1 D3 object representing the first input control.
 * @param  {[type]} d3El2 D3 object representing the second input control.
 * @return {undefined}
 */
function twowayValueBind(d3El1, d3El2) {

    // Use the DOM event API because the D3 event API
    // only allows one binding of each event type.
    d3El1.node().addEventListener('change', bindValueFactory(d3El2));
    d3El2.node().addEventListener('change', bindValueFactory(d3El1));
}


/**
 * Given a D3 object representing an input control return a function
 * which maps that controls value to another element, for use with
 * an event listener.
 * @param  {object} d3El D3 object representing an input control.
 * @return {undefined}
 */
function bindValueFactory(d3El) {
    return function() {
        var otherEl = this;
        d3El.property('value', otherEl.value);
    };
}



/* Helpers. */


/**
 * Given a D3 reference to a select element populate its options
 * according the values in the data array.
 * @param  {object} d3SelectEl A D3 selection representing a select element.
 * @param  {array} data       An arrray of data to populate the options with.
 * @return {undefined}
 */
function appendOptions(d3SelectEl, data, defaultValue) {
    d3SelectEl.selectAll('option')
            .data(data)
            .enter()
                .append('option')
                    .attr({
                        value: getName,
                        title: getName,
                        selected: function(d) {
                            var value = getName(d);
                            return defaultValue === value ? 'select' : null;
                        }
                    })
                    .text(function(d) {return getValue(d);});

    // Datum can be strings or objects containing 'name' and 'value' properties.
    function getKey(key, d) {
        if (typeof d === 'object') {
            return d[key];
        }
        return d;
    }
    function getName(d) {
        return getKey('name', d);
    }
    function getValue(d) {
        return getKey('value', d);
    }
}
