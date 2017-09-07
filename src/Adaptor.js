/** @module Adaptor */

/**
* @typedef {Object} State
* @property {object} data JSON Data.
* @property {Array<Reference>} references History of all previous operations.
*/

/**
* @typedef {Function} Operation
* @param {State} state
*/

import { execute as commonExecute } from 'language-common';
import jsforce from 'jsforce';
import { curry, mapValues, flatten } from 'lodash-fp';

/**
 * Outputs basic information about an sObject to `STDOUT`.
 * @public
 * @example
 *  describe(
 *    'obj_name',
 *    state
 *  )
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {State} state - Runtime state.
 * @returns {State}
 */
export const describe = curry(function(sObject, state) {
  let {connection} = state;

  return connection.sobject(sObject).describe()
  .then(function(meta) {
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);

    return state;
  })
  .catch(function(err) {
    console.error(err);
    return err;
  })

});

/**
 * Create a new object.
 * @public
 * @example
 *  create(
 *    'obj_name',
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    },
 *    state)
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const create = curry(function(sObject, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  console.info(`Creating ${sObject}`, finalAttrs);

  return connection.create(sObject, finalAttrs)
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })

});

/**
 * Create a new object if conditions are met.
 * @public
 * @example
 *  createIf(
 *    true,
 *    'obj_name',
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    },
 *    state)
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const createIf = curry(function(logical, sObject, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  if (logical) {
    console.info(`Creating ${sObject}`, finalAttrs);
  } else {
    console.info(`Not creating ${sObject} because logical is false.`);
  };

  if (logical) {
    return connection.create(sObject, finalAttrs)
    .then(function(recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return {
        ...state, references: [recordResult, ...state.references]
      }
    })
  } else {
    return {
      ...state
    }
  }

});

/**
 * Upsert an object.
 * @public
 * @example
 *  upsert(
 *    'obj_name',
 *    'ext_id',
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    },
 *    state)
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const upsert = curry(function(sObject, externalId, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  console.info(
    `Upserting ${sObject} with externalId`, externalId, ":" , finalAttrs
  );

  return connection.upsert(sObject, finalAttrs, externalId)
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })

})

/**
 * Upsert if conditions are met.
 * @public
 * @example
 *  upsert(
 *    true,
 *    'obj_name',
 *    'ext_id',
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    },
 *    state)
 * @function
 * @param {boolean} logical - a logical statement that will be evaluated.
 * @param {String} sObject - API name of the sObject.
 * @param {String} externalId - ID.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const upsertIf = curry(function(logical, sObject, externalId, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  if (logical) {
    console.info(
      `Upserting ${sObject} with externalId`, externalId, ":" , finalAttrs
    );
  } else {
    console.info(`Not upserting ${sObject} because logical is false.`);
  };

  if (logical) {
    return connection.upsert(sObject, finalAttrs, externalId)
    .then(function(recordResult) {
      console.log('Result : ' + JSON.stringify(recordResult));
      return {
        ...state, references: [recordResult, ...state.references]
      }
    })
  } else {
    return {
      ...state
    }
  }

});

/**
 * Update an object.
 * @public
 * @example
 *  update(
 *    'obj_name',
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    },
 *    state)
 * @function
 * @param {String} sObject - API name of the sObject.
 * @param {Object} attrs - Field attributes for the new object.
 * @param {State} state - Runtime state.
 * @returns {Operation}
 */
export const update = curry(function(sObject, attrs, state) {
  let {connection, references} = state;
  const finalAttrs = expandReferences(state, attrs)
  console.info(`Updating ${sObject}`, finalAttrs);

  return connection.update(sObject, finalAttrs)
  .then(function(recordResult) {
    console.log('Result : ' + JSON.stringify(recordResult));
    return {
      ...state, references: [recordResult, ...state.references]
    }
  })

});

/**
 * Get a reference ID by an index.
 * @public
 * @function
 * @param {number} position - Position for references array.
 * @param {State} state - Array of references.
 * @returns {State}
 */
export const reference = curry(function(position, state) {
  const { references } = state;
  return references[position].id;
})

/**
 * Creates a connection.
 * @example
 *  createConnection(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */
function createConnection(state) {
  const { loginUrl } = state.configuration;

  if (!loginUrl) {
    throw new Error("loginUrl missing from configuration.")
  }

  return { ...state, connection: new jsforce.Connection({ loginUrl }) }
}

/**
 * Performs a login.
 * @example
 *  login(state)
 * @function
 * @param {State} state - Runtime state.
 * @returns {State}
 */
function login(state) {

  const {username, password, securityToken} = state.configuration
  let { connection } = state;
  console.info(`Logging in as ${username}.`);

  return connection.login( username, password + securityToken )
    .then(() => state)

}

/**
 * Executes an operation.
 * @function
 * @param {Operation} operations - Operations
 * @returns {State}
 */
export function execute(...operations) {

  const initialState = {
    logger: {
      info: console.info.bind(console),
      debug: console.log.bind(console)
    },
    references: [],
    data: null,
    configuration: {}
  }

  return state => {
    // Note: we no longer need `steps` anymore since `commonExecute`
    // takes each operation as an argument.
    return commonExecute(
      createConnection,
      login,
      ...flatten(operations),
      cleanupState
    )({ ...initialState, ...state })

  };

}


/**
 * Removes unserializable keys from the state.
 * @example
 *  cleanupState(state)
 * @function
 * @param {State} state
 * @returns {State}
 */
function cleanupState(state) {
  delete state.connection;
  return state;
}

/**
 * Flattens an array of operations.
 * @public
 * @example
 *  steps(
 *    createIf(params),
 *    update(params)
 *  )
 * @function
 * @returns {Array}
 */
export function steps(...operations) {
  return flatten(operations);
}

/**
 * Expands references.
 * @example
 *  expandReferences(
 *    state,
 *    {
 *      attr1: "foo",
 *      attr2: "bar"
 *    }
 *  )
 * @function
 * @param {State} state - Runtime state.
 * @param {Object} attrs - Field attributes for the new object.
 * @returns {State}
 */
function expandReferences(state, attrs) {
  return mapValues(function(value) {
    return typeof value == 'function' ? value(state) : value;
  })(attrs);
}

export { lookup, relationship } from './sourceHelpers';

export {
  each, join, fields, field, source, sourceValue, map, combine,
  merge, dataPath, dataValue, referencePath, lastReferenceValue,
  index, beta, toArray, arrayToString, alterState
} from 'language-common';
