/**
 * Chart type sepecific controls logic.
 *
 * To be mixed in to the generic controls prototype.
 */
'use strict';

var d3 = require('d3');
var _assign = require('lodash.assign');
var _clone = require('lodash.clone');

var inputNamesMap = {
    horizontal: 'x',
    vertical: 'y',
    radius: 'z',
    yearSelect: 'year',
    yearRange: 'year'
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
    d3Objects.play = form.select('#' + options.idPlay);
    d3Objects.stop = form.select('#' + options.idStop);
    d3Objects.rewind = form.select('#' + options.idRewind);
    var yearRange = d3Objects.yearRange = form.select('#' + options.idRangeYear);
    var yearSelect = d3Objects.yearSelect = form.select('#' + options.idSelectYear);

    // Dynamic control labelling.
    // Get D3 references to the min-year span and the max-year span.
    ['Min', 'Max'].forEach(function (extreme) {
        d3Objects['year' + extreme + 'Span'] = d3.select(yearSelect.node().parentNode)
            .select('.' + options['class' + extreme + 'Year']);
    });

    // Two way binding between the year range and year select controls values.
    // Note: Firefox currently seems to be firing 'input' twice on range inputs.
    // Chrome and Firefox fire input on thumb drag and change on thumb release
    // IE fires change on thumb drag and never fires input... so have to bind to both.
    twoWayValueBind(yearRange, yearSelect, ['input', 'change'], undefined);
};


WorldBankIndicatorControlsPrototype.addDomEventListeners = function() {
    var controls = this;
    var d3Objects = this.d3Objects;

    // Generate a function which updates
    // the accessors with new values.
    function updateAccessorFromSelectFactory(selectInput) {
         return function updateAccessor() {
            /* jshint validthis: true */

            var element = this;
            var newAccessors = {};
            newAccessors[inputNamesMap[selectInput]] = element.value;
            controls.setAccessors(newAccessors);
        };
    }

    // Listeners for input select controls.
    ['horizontal', 'vertical', 'radius', 'yearSelect'].forEach(function(selectInput) {
        var d3SelectEl = d3Objects[selectInput];
        var node = d3SelectEl.node();
        var updateAccessorFromSelect = updateAccessorFromSelectFactory(selectInput);

        // Listen to change events on the input elements.
        node.addEventListener('change', updateAccessorFromSelect);

        // Listen to programmatically fired change events.
        // The name is different from 'change' to avoid recursive event calling in Firefox.
        node.addEventListener('programmaticChange', updateAccessorFromSelect);
    });

    // Listener for the play button.
    var d3PlayButton = d3Objects.play;
    d3PlayButton.on('click', function() {
        var node = this;
        var minYear = node.dataset.minYear;
        var maxYear = node.dataset.maxYear;

        // If the current year is the max year
        // then rewind to the min year.
        if (maxYear === controls.accessors.year) {
            controls.setYear(minYear);
        }
        controls.playYears(maxYear);
    });

    // Listener for the rewind button.
    var d3RewindButton = d3Objects.rewind;
    d3RewindButton.on('click', function() {
        var minYear = d3PlayButton.node().dataset.minYear;
        controls.setYear(minYear);
    });
};


/**
 * Set the years, in order, from the current year to endYear,
 * with a delay of `delay`.
 * @param {string} endYear The final year to set.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.playYears = function(endYear) {
    var controls = this;
    var transitionDuration = controls.transitionDuration;
    var timeoutId;

    // Idempotent.
    if (controls.playing) {
        return;
    }
    controls.playing = true;

    // Stop if the stop button is clicked.
    controls.d3Objects.stop.on('click', stop);

    // Start progressing through years after a delay.
    timeoutId = setTimeout(progressYears, transitionDuration);

    // Using timeouts, progress through the years.
    function progressYears() {
        var nextYear = parseInt(controls.accessors.year) + 1;

        if (nextYear <= endYear) {
            controls.setYear(nextYear);
            timeoutId = setTimeout(progressYears, transitionDuration);
        } else {
            controls.playing = false;
        }
    }

    // Stop progressing through the years.
    function stop() {
        clearTimeout(timeoutId);
        controls.playing = false;
    }
};


/**
 * Set the year in the accessors object and the UI controls.
 * @param {string|number} year The year to set.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.setYear = function(year) {
    var controls = this;
    var accessors = controls.accessors;
    var newAccessors = _clone(accessors);
    newAccessors.year = year.toString();

    // Update UI control values.
    // Hackety hack.
    controls.d3Objects.yearRange.property('value', year);
    controls.d3Objects.yearSelect.property('value', year);

    // Update the accessors, this will trigger
    // an event which will trigger the chart
    // to update.
    controls.setAccessors(newAccessors);
};


/**
 * Set the data accessors for the chart.
 * @param {object} accessors {x:'', y:'', z:'', year:''}
 */
WorldBankIndicatorControlsPrototype.setAccessors = function(newAccessors) {
    var controls = this;

    // If there was no argument then use the defaults.
    if (!newAccessors) {
        controls.accessors = controls.defaultAccessors;
        controls.setControlTitles(controls.accessors);
        return;
    }

    // If the new accessors are the same as the current do nothing.
    if (Object.keys(newAccessors).every(function (key) {
        return controls.accessors[key] === newAccessors[key];
    })) {
        return;
    }

    // Else mix the supplied accessors with the current accessors
    _assign(controls.accessors, newAccessors);

    // Falling back to defaults for missing values.
    controls.accessors = _assign(_clone(controls.defaultAccessors), controls.accessors);

    // Set the titles on the input elements.
    controls.setControlTitles(controls.accessors);

    controls.emit('accessorsUpdated', _clone(controls.accessors));
};


WorldBankIndicatorControlsPrototype.setControlTitles = function(accessors) {
    var d3Objects = this.d3Objects;

    ['horizontal', 'vertical', 'radius', 'yearSelect', 'yearRange'].forEach(function(inputName) {
        var controlEl = d3Objects[inputName].node();
        controlEl.setAttribute('title', accessors[inputNamesMap[inputName]]);
    });
};


/**
 * Populate the UI controls with appropriate data.
 * @param  {object} data The chart data.
 * @param  {object} defaultAccessors The chart default accessors.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.populate = function(data, accessors) {
    this.populateIndicators(data, accessors);
    this.populateYears(data, accessors);
};


// Indicators select options.
WorldBankIndicatorControlsPrototype.populateIndicators = function(data, accessors) {
    var d3Objects = this.d3Objects;


    // The key is needed to match on default values passed in
    // to the controls constructor. The descriptor is needed
    // so that the options in the select inputs are
    // 1) Shortish and
    // 2) Match the axes labels on the graph itself.
    var indicators = Object.keys(data.indicators).map(function(key) {
        return {
            name: key,
            value: data.indicators[key].descriptor
        };
    });

    ['horizontal', 'vertical', 'radius'].forEach(function(dimension) {
        var d3SelectEl = d3Objects[dimension];
        var defaultValue = accessors[inputNamesMap[dimension]];
        appendOptions(d3SelectEl, indicators, defaultValue);
    });
};


// Years control options.
WorldBankIndicatorControlsPrototype.populateYears = function(data, accessors) {
    var d3Objects = this.d3Objects;
    var years = data.years;
    var year = accessors.year;
    var minYear = years[0];
    var maxYear = years[years.length-1];

    // Year min-max hints.
    d3Objects.yearMinSpan.text(minYear);
    d3Objects.yearMaxSpan.text(maxYear);

    // Play years button data.
    d3Objects.play.node().dataset.minYear = minYear;
    d3Objects.play.node().dataset.maxYear = maxYear;

    // years range control.
    d3Objects.yearRange
        .attr({
            min: function() {return minYear;},
            max: function() {return maxYear;},
            value: year,
            step: 1
        });

    // Years select.
    appendOptions(d3Objects.yearSelect, years, year);
};


/**
 * Given a chart object bind control events to chart methods.
 * Called in the context where the controls are instantiated.
 * @param {Chart Object} chart The chart object to control.
 * @return {undefined}
 */
WorldBankIndicatorControlsPrototype.addHooks = function(chart) {
    var controls = this;

    // EventEmitter events.
    controls.on('accessorsUpdated', chart.updateAccessorsAndChart.bind(chart));
};


/* Helpers. */


/**
 * Provide 'onChange' value binding between two D3 objects representing input controls.
 * @param  {object} d3El1 D3 object representing the first input control.
 * @param  {object} d3El2 D3 object representing the second input control.
 * @param  {string|array} event1 Optional event type(s) to bind to element 1.
 * @param  {string|array} event2 Optional event type(s) to bind to element 2.
 * @return {undefined}
 */
function twoWayValueBind(d3El1, d3El2, event1, event2) {
    event1 = event1 || ['change'];
    event2 = event2 || ['change'];

    if (typeof event1 === 'string') {
        event1 = [event1];
    }
    if (typeof event2 === 'string') {
        event2 = [event2];
    }

    // Use the DOM event API because the D3 event API
    // only allows one binding of each event type
    // without using D3 sepecific 'namespacing' notation.
    event1.forEach(function(eventType) {
        d3El1.node().addEventListener(eventType, bindValueFactory(d3El2, eventType));
    });
    event2.forEach(function(eventType) {
        d3El2.node().addEventListener(eventType, bindValueFactory(d3El1, eventType));
    });
}


/**
 * Given a D3 object representing an input control return a function
 * which copies that controls value to another element, for use with
 * an event listener.
 * @param  {object} d3El D3 object representing an input control.
 * @return {undefined}
 */
function bindValueFactory(d3El) {
    return function() {
        var otherEl = this;
        var event;
        d3El.property('value', otherEl.value);

        // Fire a custom event on the programmaticly
        // modified input element.
        event = document.createEvent('Event');
        event.initEvent('programmaticChange', true, true);
        d3El.node().dispatchEvent(event);
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
                            var isDefault = defaultValue === value;

                            // Set the select attribute on the default option.
                            // The atttribute won't be created for a null value.
                            return isDefault ? 'select' : null;
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
