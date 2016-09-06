# apluspromises

Minimal Promises/A+ implementation based on executable spec from https://github.com/promises-aplus/promises-tests

<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant"  />
</a>

## Running tests
```
npm install
npm test
npm test:es6 // requires node 6+
```

## Notes and design goals

* created for learning purposes
* separate ES5 and ES6 implementation (arrow functions, classes)
* follows ubiquitous language from the spec
* easy to read at a cost of performance
* inspired by: https://github.com/robotlolita/robotlolita.github.io/blob/master/examples/promises/aplus/src/promises.js
