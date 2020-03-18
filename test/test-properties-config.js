const jinst = require('../lib/jinst');
const JDBC = require('../lib/jdbc');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./drivers/hsqldb.jar',
                        './drivers/derby.jar',
                        './drivers/derbyclient.jar',
                        './drivers/derbytools.jar']);
}

const config = {
  url: 'jdbc:hsqldb:hsql://localhost/xdb',
  properties: {
    user: 'SA',
    password: ''
  }
};

const hsqldb = new JDBC(config);
let testConn = null;

module.exports = {
    setUp: async function(callback) {
        if (testConn === null && hsqldb.pool.length > 0) {
            testConn = await hsqldb.reserve();
        }
        callback();
    },
    tearDown: async function(callback) {
        if (testConn) {
            await hsqldb.release(testConn);
        }
        callback();
    },
    testinitialize: async function(test) {
        const result = await hsqldb.initialize();
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testcreatetable: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('CREATE TABLE fake (id int, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP);');
                test.expect(2);
                test.equal(0, result);
                test.ok(statement);
                test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testinsert: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('INSERT INTO fake VALUES (1, \'Jason\', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP);');
            test.expect(2);
            test.equal(1, result);
            test.ok(statement);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testupdate: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('UPDATE fake SET id = 2 WHERE name = \'Jason\'');
            test.expect(2);
            test.equal(1, result);
            test.ok(statement);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselect: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const resultSet = await statement.executeQuery('SELECT * FROM fake');
            test.expect(7);
            test.ok(statement);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.equal(results[0].NAME, 'Jason');
            test.ok(results[0].DATE);
            test.ok(results[0].TIME);
            test.ok(results[0].TIMESTAMP);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdelete: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('DELETE FROM fake WHERE id = 2');
            test.expect(2);
            test.ok(statement);
            test.equal(1, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdroptable: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('DROP TABLE fake');
            test.expect(2);
            test.ok(statement);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    }
};
