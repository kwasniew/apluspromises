function Promise(executor) {
    if (!isFunction(executor)) {
        throw new TypeError("executor must be a function");
    }

    this.value = null;
    this.reason = null;
    this.state = "pending";
    this.fulfilReactions = [];
    this.rejectReactions = [];

    try {
        executor(x => resolve(this, x), x => reject(this, x));
    } catch (e) {
        reject(this, e);
    }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var originalPromise = this;

    return new Promise(function executor(resolve, reject) {

        function safelyResolve(callback, x) {
            try {
                resolve(callback(x));
            } catch (e) {
                reject(e);
            }
        }

        if (!isFunction(onFulfilled)) {
            onFulfilled = value => value;
        }

        if (!isFunction(onRejected)) {
            onRejected = reason => reject(reason);
        }

        if (originalPromise.state === "pending") {
            originalPromise.fulfilReactions.push(x => safelyResolve(onFulfilled, x));
            originalPromise.rejectReactions.push(x => safelyResolve(onRejected, x));
        } else if (originalPromise.state === "fulfilled") {
            async(() => safelyResolve(onFulfilled, originalPromise.value));
        } else if (originalPromise.state === "rejected") {
            async(() => safelyResolve(onRejected, originalPromise.reason));
        }
    });
};

Promise.resolve = function (x) {
    return new Promise(resolve => resolve(x));
};

Promise.reject = function (x) {
    return new Promise((_, reject) => reject(x));
};

function resolve(promise, x) {
    if (promise.state === "pending") {
        try {
            var then = x.then;
        } catch (e) {
            reject(promise, e);
        }
        if (typeof x === "object" && typeof then === "function") {
            resolveThenable(promise, x, then);
        } else {
            fulfil(promise, x);
        }
    }
}

function fulfil(promise, x) {
    promise.state = "fulfilled";
    promise.value = x;
    promise.fulfilReactions.forEach(reaction => async(()  => reaction(x)));
}

function reject(promise, x) {
    if (promise.state === "pending") {
        promise.state = "rejected";
        promise.reason = x;
        promise.rejectReactions.forEach(reaction => async(()  => reaction(x)));
    }
}

function resolveThenable(promise, thenable, then) {
    if (thenable === promise) {
        reject(promise, new TypeError("Can't resolve a promise with itself"));
    }

    var called = false;

    try {
        then.call(thenable, function resolvePromise(x) {
            if (called) return;
            called = true;
            return resolve(promise, x);
        }, function rejectPromise(x) {
            if (called) return;
            called = true;
            return reject(promise, x);
        });
    } catch (e) {
        if (called) return;
        called = true;
        return reject(promise, e);
    }
}

function isFunction(a) {
    return typeof a === "function";
}

function async(fn) {
    setTimeout(fn, 0);
}

module.exports = Promise;