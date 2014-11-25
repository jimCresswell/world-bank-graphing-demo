/**
 * The top level client-side JavaScript file.
 */

(function() {
    'use strict';

    var dataService = require('./dataService');
    var Chart = require('./Chart');

    var dataUrlPath = '/data/world-growth-indicators-by-region_Data.json';

    dataService.getData(dataUrlPath)
        .then(function(data) {
            var chartOptions = {
                id: 'chart1--svg',
                data: data
            };

            // DEBUG
            console.log(data);

            // new Chart(chartOptions);
        })
        .done();
})();
