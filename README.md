language-salesforce [![Build Status](https://travis-ci.org/OpenFn/language-salesforce.svg?branch=master)](https://travis-ci.org/OpenFn/language-salesforce)
===================

Salesforce Language Pack for OpenFn

Intent
------

Allow communication with Salesforce using a set of Lisp compatible expressions.

Using simple functions we can create a simplified API, simple enough to generate
code from data.

Expressions
-----------

Expressions are a simplified set of function calls. Outlining the operations
needed to be performed.

An uncompiled expression has no knowledge of the internals of the adaptor,
credentials or runtime environment.

It's the responsibility of the build process to provide a wrapper that will
inject the functions in.

For example:

```javascript
describe('vera__Test_Event__c'),
create('vera__Test_Event__c', {
  vera__Test_Event_Name_Unique__c: "hello from jsforce"
}),
create('vera__Boat__c', {
  Name: "Catatafish redux!",
  vera__Test_Event__c: reference(0)
})
```

API
---

`field("key","value")`
Returns `{ "key": "value" }`

`create(sObject, fields ...)`
Returns `state`

`createIf(logical, sObject, fields ...)`
Returns `state`

`upsert(sObject, externalID, fields ...)`
Returns `state`

`steps( operations ... )`
Returns `Array<Operation>`

`map(<JSONPath>, <Operation>, state)`
Wraps an operation around an iterable.
Each operation receives a scoped version of the data for each of items
found at the given path.

Returns `state`


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
