/**
 * Controller for the inputs which determine which data are charted.
 */
'use strict';

module.exports = Controls;

function Controls(controlsOptions, data) {
    var controls = this;
    controls.id = '';
    controls.form = null;

    // Cope with lack of 'new' keyword.
    if (!(controls instanceof Controls)){
        return new Controls(controlsOptions, data);
    }

    if (!data) {
        throw new TypeError('Please suppply data for the controls.');
    }

    controls.populate(data);
}

Controls.prototype.populate = function(data) {
    console.warn('populate not implemented.');
};


/**
 * Bind updates on the controls to a method on the chart object
 * to update the chart x and y accessors and cause a redraw.
 *
 * Could do this via pub-sub but I think
 * tight coupling is okay in this case.
 *
 * @param  {object} chart A Chart object.
 * @return {undefined}
 */
Controls.prototype.bindToChart = function(chart) {
    console.warn('bindToChart not implemented.');

    // TODO: call a function on the chart to
    // update the x and y accessors and
    // cause a redraw.
};