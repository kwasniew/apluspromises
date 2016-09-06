var Promise = require("../promises_ES6");

module.exports = {
    resolved: Promise.resolve,
    rejected: Promise.reject,
    deferred: function () {
        var resolve, reject;
        var promise = new Promise((f, g) => {
            resolve = f;
            reject = g
        });
        return {promise, resolve, reject}
    }
};