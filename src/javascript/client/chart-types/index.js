/**
 * Manually add new chart prototypes here.
 */

module.exports = {
    worldBankIndices: {
        model: require('./worldBankIndices/model'),
        controls: require('./worldBankIndices/controls'),
        chart: require('./worldBankIndices/chart')
    }
};