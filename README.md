# node-jdbc
JDBC API Wrapper for node.js

## Latest Version
- **0.8.0*

## Installation
- Release: ```npm i --save jdbc```
- Development: ```npm i --save jdbc@next``` (this will install code from the master branch).

Please visit [node-jdbc](https://www.npmjs.org/package/jdbc) for information on installing with npm.

## Status
[![Build Status](https://travis-ci.org/sgermain06/node-jdbc.svg?branch=master)](https://travis-ci.org/sgermain06/node-jdbc)

## Major API Refactor

#### ES6 Classes

All the code was refactored to use US6 classes.

#### Async/Await model

Converted everything to using sync methods on the JDBC drivers and wrapped everything in promises. This has for effect
to eliminate the crazy trees of callbacks and makes for much more readable and manageable code.

Another main reason for converting everything to calling sync methods is that the callbacks were never being called
when using older drivers (needed to use Hive 1.21 JAR). This way, everything works and remains asynchronous.

#### Eliminated need for AsyncJS

Using promises makes it easier for things to be chained without needing to use AsyncJS. Refactored the code to eliminate this dependency.

#### One Instance to Rule Them All (JVM)

[node-java](https://github.com/joeferner/node-java) spins up one JVM instance only.  Due to this fact, any JVM options
and classpath setup have to happen before the first java call.  I've created a
small wrapper (jinst.js) to help out with this.  See below for example
usage.  I usually add this to every file that may be an entry point.  The
[unit tests](https://github.com/sgermain06/node-jdbc/tree/master/test)
are setup like this due to the fact that order can't be guaranteed.

```javascript
const jinst = require('jdbc/lib/jinst');

// isJvmCreated will be true after the first java call.  When this happens, the
// options and classpath cannot be adjusted.
if (!jinst.isJvmCreated()) {
  // Add all java options required by your project here.  You get one chance to
  // setup the options before the first java call.
  jinst.addOption("-Xrs");
  // Add all jar files required by your project here.  You get one chance to
  // setup the classpath before the first java call.
  jinst.setupClasspath(['./drivers/hsqldb.jar',
                        './drivers/derby.jar',
                        './drivers/derbyclient.jar',
                        './drivers/derbytools.jar']);
}
```


#### Connection Pooling

Everyone gets a pool now.  By default with no extra configuration, the pool
is created with one connection that can be reserved/released.  Currently, the
pool is configured with two options: `minpoolsize` and `maxpoolsize`.  If
`minpoolsize` is set, when the pool is initialized, `minpoolsize` connections
will be created.  If `maxpoolsize` is set (the default value is `minpoolsize`),
and you try and reserve a connection and there aren't any available, the pool
will be grown.  This can happen until `maxpoolsize` connections have been
reserved.  The pool should be initialized after configuration is set with the
`initialize()` function.  JDBC connections can then be acquired with the
`reserve()` function and returned to the pool with the `release()` function.
Below is the unit test for the pool that demonstrates this behavior.

```javascript
const jinst = require('../lib/jinst');
const Pool = require('../lib/pool');
const isNil = require('lodash/isNil');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./drivers/hsqldb.jar',
                        './drivers/derby.jar',
                        './drivers/derbyclient.jar',
                        './drivers/derbytools.jar']);
}

const config = {
  url: 'jdbc:hsqldb:hsql://localhost/xdb',
  user : 'SA',
  password: '',
  minPoolSize: 2,
  maxPoolSize: 3
};

let testPool;

module.exports = {
    setUp: async function(callback) {
        testPool = new Pool(config);
        await testPool.initialize();
        callback();
    },
    tearDown: function(callback) {
        testPool = null;
        callback();
    },
    teststatus: async function(test) {
        await testPool.reserve();
        const status = await testPool.status();
        test.expect(2);
        test.equal(status.available, 1);
        test.equal(status.reserved, 1);
        test.done();
    },
    testreserverelease: async function(test) {
        const connection = await testPool.reserve();
        await testPool.release(connection);
        test.expect(2);
        test.equal(testPool.pool.length, 2);
        test.equal(testPool.reserved.length, 0);
        test.done();
    },
    testreservepastmin: async function(test) {
        const results = [];
        for (let i = 0; i < 3; i++) {
            results.push(await testPool.reserve());
        }
        test.expect(2);
        test.equal(testPool.pool.length, 0);
        test.equal(testPool.reserved.length, 3);
        for (let conn of results) {
            await testPool.release(conn);
        }
        test.done();
    },
    testovermax: async function(test) {
        const results = [];
        try {
            for (let i = 0; i < 4; i++) {
                results.push(await testPool.reserve());
            }
        }
        catch (err) {
            test.expect(3);
            test.equal(testPool.pool.length, 0);
            test.equal(testPool.reserved.length, 3);
            test.equal(err.message, 'No more pool connections available.');
        }
        finally {
            for (let conn of results) {
                if (!isNil(conn)) {
                    await testPool.release(conn);
                }
            }
            test.done();
        }
    },
    testpurge: async function(test) {
        await testPool.purge();
        test.expect(2);
        test.equal(testPool.pool.length, 0);
        test.equal(testPool.reserved.length, 0);
        test.done();
    },
};
```

#### Fully Wrapped Connection API

The Java Connection API has almost been completely wrapped.  See
[connection.js](https://github.com/sgermain06/node-jdbc/blob/master/lib/connection.js)
for a full list of functions.

```javascript
try {
    await conn.setAutoCommit(false);
}
catch (err) {
    console.log('Error occured:', err);
}
```

#### ResultSet processing separated from statement execution

`ResultSet` processing has been separated from statement execution to allow for
more flexibility.  The ResultSet returned from executing a select query can
still be processed into an object array using the `toObjArray()` function on the
`ResultSet` object.

```javascript
// Select statement example.
try {
    const statement = await conn.createStatement();
    const resultSet = await statement.executeQuery('SELECT * FROM table');
    const results = await resultSet.toObjArray();
    if (results.length > 0) {
        console.log('ID:', results[0].ID);
    }
}
catch (err) {
    console.log('Error occured:', err);
}
```

#### Automatically Closing Idle Connections

If you pass a `maxIdle` property in the config for a new connection pool,
`pool.reserve()` will close stale connections, and will return a sufficiently fresh connection, or a new connection.  `maxIdle` can be number representing the maximum number of milliseconds since a connection was last used, that a connection is still considered alive (without making an extra call to the database to check that the connection is valid).  If `maxIdle` is a falsy value or is absent from the config, this feature does not come into effect.  This feature is useful, when connections are automatically closed from the server side after a certain period of time, and when it is not appropriate to use the connection keepalive feature.

## Usage

### Initialize
```javascript
const JDBC = require('jdbc');
const jinst = require('jdbc/lib/jinst');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./drivers/hsqldb.jar',
                        './drivers/derby.jar',
                        './drivers/derbyclient.jar',
                        './drivers/derbytools.jar']);
}

const config = {
  // Required
  url: 'jdbc:hsqldb:hsql://localhost/xdb',

  // Optional
  driverName: 'my.jdbc.DriverName',
  minPoolSize: 10,
  maxPoolSize: 100,

  // Note that if you specify the user and password as below, they get
  // converted to properties and submitted to getConnection that way.  That
  // means that if your driver doesn't support the 'user' and 'password'
  // properties this will not work.  You will have to supply the appropriate
  // values in the properties object instead.
  user: 'SA',
  password: '',
  properties: {}
};

// or user/password in url
// var config = {
//   // Required
//   url: 'jdbc:hsqldb:hsql://localhost/xdb;user=SA;password=',
//
//   // Optional
//   driverName: 'my.jdbc.DriverName',
//   minPoolSize: 10
//   maxPoolSize: 100,
//   properties: {}
// };

// or user/password in properties
// var config = {
//   // Required
//   url: 'jdbc:hsqldb:hsql://localhost/xdb',
//
//   // Optional
//   driverName: 'my.jdbc.DriverName',
//   minPoolSize: 10,
//   maxPoolSize: 100,
//   properties: {
//     user: 'SA',
//     password: ''
//     // Other driver supported properties can be added here as well.
//   }
// };

const hsqldb = new JDBC(config);

(async () => {
    try {
        await hsqldb.initialize();
    }
    catch (err) {
        console.log(err);
    }
})();
```

### Reserve Connection, Execute Queries, Release Connection
```javascript
// This assumes initialization as above.
try {
    // The reserved connection returned from the pool is an object with two fields
    // {uuid: <uuid>, conn: <Connection>}
    const reservedConnection = await hsqldb.reserve();
    console.log('Using connection:', reservedConnection.uuid);
    const connection = reservedConnection.conn;

    // Adjust some connection options.  See connection.js for a full set of
    // supported methods.
    await connection.setAutoCommit(false);
    await setSchema('test');

    // SQL queries
    const createSql = 'CREATE TABLE fake (id int, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP)';
    const insertSql = 'INSERT INTO fake VALUES (1, \'Jason\', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)';
    const updateSql = 'UPDATE fake SET id = 2 WHERE name = \'Jason\'';
    const selectSql = 'SELECT * FROM fake';
    const deleteSql = 'DELETE FROM fake WHERE id = 2';
    const dropSql   = 'DROP TABLE fake';

    // Create the table
    const createStatement = await connection.createStatement();
    await createStatement.executeUpdate(createSql);

    // Insert a record in the table
    const insertStatement = await connection.createStatement();
    await insertStatement.executeUpdate(insertSql);

    // Update the record
    const updateStatement = await connection.createStatement();
    await updateStatement.executeUpdate(updateSql);

    // Select from the table
    const selectStatement = await connection.createStatement();
    const resultSet = await selectStatement.executeQuery(selectSql);
    const results = await resultSet.toObjArray();
    if (results.length > 0) {
        console.log("ID: " + results[0].ID);
    }

    // Delete from the table
    const deleteStatement = await connection.createStatement();
    await deleteStatement.executeUpdate(deleteSql);

    // Drop the table
    const dropStatement = await connection.createStatement();
    await dropStatement.executeUpdate(dropSql);

    // Release the reserved connection
    await hsqldb.release(reservedConnection);
}
catch (err) {
    console.log(err);
}
```
