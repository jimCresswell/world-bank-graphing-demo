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


var WorldBankIndicatorControlsPrototype = module.exports = {};

/**
 * Chart-type specific initialisation tasks.
 * @param  {object} options Options for the chart controls.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.init = function(options) {
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
    twowayValueBind(yearRange, yearSelect, 'input');
};


/**
 * Populate the UI controls with appropriate data.
 * @param  {object} data The chart data.
 * @param  {object} defaultAccessors The chart default accessors.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.populate = function(data, defaultAccessors) {
    this.populateIndices(data, defaultAccessors);
    this.populateYears(data, defaultAccessors);
};


// Indices select options.
WorldBankIndicatorControlsPrototype.populateIndices = function(data, defaultAccessors) {
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
WorldBankIndicatorControlsPrototype.populateYears = function(data, defaultAccessors) {
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


WorldBankIndicatorControlsPrototype.addHooks = function(chart) {
    var controls = this;

    // DEBUG
    controls.on = function() {};

    controls.on('accessorsUpdated', function(event) {
        var newAccessors = event.data;

        // Limited knowledge of Chart API within a known chart-type.
        chart.updateAccessors(newAccessors);
    });

    controls.on('yearUpdated', function(event) {
        var year = event.data;

        // Limited knowledge of Chart API within a known chart-type.
        chart.updateYear(year);
    });
};


/* Helpers. */


/**
 * Provide 'onChange' value binding between two D3 objects representing input controls.
 * @param  {object} d3El1 D3 object representing the first input control.
 * @param  {object} d3El2 D3 object representing the second input control.
 * @param  {string} event1 Optional event type to bind to element 1.
 * @param  {string} event2 Optional event type to bind to element 2.
 * @return {undefined}
 */
function twowayValueBind(d3El1, d3El2, event1, event2) {
    event1 = event1 || 'change';
    event2 = event2 || 'change';

    // Use the DOM event API because the D3 event API
    // only allows one binding of each event type.
    d3El1.node().addEventListener(event1, bindValueFactory(d3El2));
    d3El2.node().addEventListener(event2, bindValueFactory(d3El1));
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
