describe("Process World Bank Inidicator Data", function() {
    var processData = require('../../src/javascript/service/processWorldBankIndicatorData.js');

    var testData = require('./testData.js');

    it("should process World Bank CSV data into a nested JavaScript data structure", function(done) {
        processData(testData.csv, function(err, actualData) {
            expect(actualData).toEqual(testData.parsed);
            done();
        });
    });
});
