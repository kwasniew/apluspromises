function isCallable(a) {
    return typeof a === "function";
}

function fulfil(promise, value) {
    if (promise.state === "pending") {

        if (value === promise) {
            reject(promise, new TypeError("Can't resolve a promise with itself."));
        }

        if(value) {
            var then = value.then;
        }
        if (then) {
            setTimeout(function () {
                then.call(value, function (x) {
                    return fulfil(promise, x);
                }, function (x) {
                    return reject(promise, x);
                });
            }, 0);
        } else {
            promise.state = "fulfilled";
            promise.value = value;
            var reactions = promise.fulfilReactions;
            promise.rejectReactions = [];
            promise.fulfilReactions = [];
            reactions.forEach(function (reaction) {
                setTimeout(function () {
                    reaction(value);
                }, 0);
            });
        }

    }
}

function reject(promise, value) {
    if (promise.state === "pending") {
        promise.state = "rejected";
        promise.value = value;
        var reactions = promise.rejectReactions;
        promise.rejectReactions = [];
        promise.fulfilReactions = [];
        reactions.forEach(function (reaction) {
            setTimeout(function () {
                reaction(value);
            }, 0);
        });
    }
}

function Promise(executor) {
    if (!isCallable(executor)) {
        throw new TypeError("executor must be a function.");
    }

    this.value = null;
    this.state = "pending";
    this.fulfilReactions = [];
    this.rejectReactions = [];

    try {
        executor(
            function (x) {
                fulfil(this, x);
            }.bind(this),
            function (x) {
                reject(this, x);
            }.bind(this)
        );
    } catch (e) {
        reject(this, e);
    }
}

Promise.prototype.then = function (onFulfilled, onFailure) {
    var originalPromise = this;

    return new Promise(function executor(resolve, reject) {

        if (!isCallable(onFulfilled)) {
            onFulfilled = function (x) {
                return x;
            }
        }

        if (!isCallable(onFailure)) {
            onFailure = function (x) {
                return reject(x);
            };
        }

        if (originalPromise.state === "pending") {
            originalPromise.fulfilReactions.push(function (value) {
                try {
                    resolve(onFulfilled(value));
                } catch (e) {
                    reject(e);
                }
            });
            originalPromise.rejectReactions.push(function (value) {
                try {
                    resolve(onFailure(value));
                } catch (e) {
                    reject(e);
                }
            });
        } else if (originalPromise.state === "fulfilled") {
            setTimeout(function () {
                try {
                    resolve(onFulfilled(originalPromise.value));
                } catch (e) {
                    reject(e);
                }
            }, 0);
        } else if (originalPromise.state === "rejected") {
            setTimeout(function () {
                try {
                    resolve(onFailure(originalPromise.value));
                } catch (e) {
                    reject(e);
                }
            }, 0);
        }
    });
};

Promise.resolve = function (x) {
    return new Promise(function (resolve, reject) {
        resolve(x);
    });
};

Promise.reject = function (x) {
    return new Promise(function (Resolve, reject) {
        reject(x);
    });
};

var count = 0;

Promise.resolve(1).then(function() {
    return Object.create(null, {
        then: {
            get: function () {
                count++;
                return function thenMethodForX(onFulfilled) {
                    onFulfilled("fulfilled");
                };
            }
        }
    });
}).then(function(data) {
    console.log("success ", data);
    console.log(count);
});


module.exports = Promise;