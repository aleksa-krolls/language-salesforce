'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = exports.sourceValue = undefined;
exports.source = source;
exports.each = each;
exports.combine = combine;
exports.join = join;
exports.fields = fields;
exports.field = field;

var _lodashFp = require('lodash-fp');

var _JSONPath = require('JSONPath');

var _JSONPath2 = _interopRequireDefault(_JSONPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Picks out a single value from source data.
 * If a JSONPath returns more than one value for the reference, the first
 * item will be returned.
 * @constructor
 * @param {String} path - JSONPath referencing a point in `state`.
 * @param {State} state - Runtime state.
 * @returns {String}
 */
var sourceValue = exports.sourceValue = (0, _lodashFp.curry)(function (path, state) {
  return _JSONPath2.default.eval(state, path)[0];
});

/**
 * Picks out a value from source data.
 * Will return whatever JSONPath returns, which will always be an array.
 * If you need a single value use `sourceValue` instead.
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state`.
 * @param {State} state - Runtime state.
 * @returns {Array.<String|Object>}
 */
function source(path) {
  return function (state) {
    return _JSONPath2.default.eval(state, path);
  };
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 * @example <caption>Simple Map</caption>
 * map("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state.data`.
 * @param {function} operation - The operation needed to be repeated.
 * @param {State} state - Runtime state.
 * @returns {<State>}
 */
var map = exports.map = (0, _lodashFp.curry)(function (path, operation, state) {

  switch (typeof path === 'undefined' ? 'undefined' : _typeof(path)) {
    case 'string':
      source(path)(state).map(function (data) {
        return operation({ data: data, references: state.references });
      });
      return state;

    case 'object':
      path.map(function (data) {
        return operation({ data: data, references: state.references });
      });
      return state;

  }
});

/**
 * Simple switcher allowing other expressions to use either a JSONPath or
 * object literals as a data source.
 * @constructor
 * @param {string|object|function} data 
 * - JSONPath referencing a point in `state`
 * - Object Literal of the data itself.
 * - Function to be called with state.
 * @param {object} state - The current state.
 * @returns {array}
 */
function asData(data, state) {
  switch (typeof data === 'undefined' ? 'undefined' : _typeof(data)) {
    case 'string':
      return source(data)(state);
    case 'object':
      return data;
    case 'function':
      return data(state);
  }
}

/**
 * Scopes an array of data based on a JSONPath.
 * Useful when the source data has `n` items you would like to map to
 * an operation.
 * The operation will receive a slice of the data based of each item
 * of the JSONPath provided.
 *
 * It also ensures the results of an operation make their way back into
 * the state's references.
 *
 * @example <caption>Simple Example</caption>
 * each("$.[*]",
 *   create("SObject",
 *     field("FirstName", sourceValue("$.firstName"))
 *   )
 * )
 * @constructor
 * @param {string} path - JSONPath referencing a point in `state`.
 * @param {function} operation - The operation needed to be repeated.
 * @returns {<Operation>}
 */
function each(path, operation) {
  return function (state) {
    return asData(path, state).reduce(function (state, data) {
      if (state.then) {
        return state.then(function (state) {
          return operation(_extends({}, state, { data: data }));
        });
      } else {
        return operation(_extends({}, state, { data: data }));
      }
    }, state);
  };
}

/**
 * Combines two operations into one
 * @constructor
 * @param {...operations} operations - Any unfufilled operation.
 * @returns {<Operation>}
 */
function combine() {
  for (var _len = arguments.length, operations = Array(_len), _key = 0; _key < _len; _key++) {
    operations[_key] = arguments[_key];
  }

  return function (state) {
    return operations.reduce(function (state, operation) {
      var result = operation(state);
      return result;
    }, state);
  };
}

function join(targetPath, sourcePath, targetKey) {
  return function (state) {
    return source(targetPath)(state).map(function (i) {
      return _extends(_defineProperty({}, targetKey, sourceValue(sourcePath, state)), i);
    });
  };
}

function fields() {
  for (var _len2 = arguments.length, fields = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fields[_key2] = arguments[_key2];
  }

  return (0, _lodashFp.zipObject)(fields, undefined);
}

function field(key, value) {
  return [key, value];
}