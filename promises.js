function isFunction(a) {
    return typeof a === "function";
}

function resolve(promise, value) {
    if (promise.state === "pending") {

        if (value === promise) {
            reject(promise, new TypeError("Can't resolve a promise with itself"));
        }

        if (value) {
            try {
                var then = value.then;
            } catch (e) {
                return reject(promise, e);
            }
        }

        var ran = false;


        if (typeof value === 'object' && typeof then === 'function') {

            setTimeout(function () {
                try {
                    then.call(value, function (x) {
                        if (ran) return;
                        ran = true;
                        return resolve(promise, x);
                    }, function (x) {
                        if (ran) return;
                        ran = true;
                        return reject(promise, x);
                    });
                } catch (e) {
                    if (ran) return;
                    ran = true;
                    return reject(promise, e);
                }

            }, 0);


        } else {
            if (ran) return;
            ran = true;
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
    if (!isFunction(executor)) {
        throw new TypeError("executor must be a function");
    }

    this.value = null;
    this.state = "pending";
    this.fulfilReactions = [];
    this.rejectReactions = [];

    try {
        executor(
            function (x) {
                resolve(this, x);
            }.bind(this),
            function (x) {
                reject(this, x);
            }.bind(this)
        );
    } catch (e) {
        reject(this, e);
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var originalPromise = this;

    return new Promise(function executor(resolve, reject) {

        function safelyResolve(callback, value) {
            try {
                resolve(callback(value));
            } catch (e) {
                reject(e);
            }
        }

        if (!isFunction(onFulfilled)) {
            onFulfilled = function (x) {
                return x;
            }
        }

        if (!isFunction(onRejected)) {
            onRejected = function (x) {
                return reject(x);
            };
        }

        if (originalPromise.state === "pending") {
            originalPromise.fulfilReactions.push(function (value) {
                safelyResolve(onFulfilled, value);
            });
            originalPromise.rejectReactions.push(function (value) {
                safelyResolve(onRejected, value);
            });
        } else if (originalPromise.state === "fulfilled") {
            setTimeout(function () {
                safelyResolve(onFulfilled, originalPromise.value);
            }, 0);
        } else if (originalPromise.state === "rejected") {
            setTimeout(function () {
                safelyResolve(onRejected, originalPromise.value)
            }, 0);
        }
    });
};

Promise.resolve = function (x) {
    return new Promise(function (resolve, _) {
        resolve(x);
    });
};

Promise.reject = function (x) {
    return new Promise(function (_, reject) {
        reject(x);
    });
};


module.exports = Promise;