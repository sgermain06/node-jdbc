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
  url: 'jdbc:derby://localhost:1527/testdb;create=true',
};

const derby = new JDBC(config);
let testConn = null;

module.exports = {
    setUp: async function(callback) {
        if (testConn === null && derby.pool.length > 0) {
            testConn = await derby.reserve();
        }
        callback();
    },
    tearDown: async function(callback) {
        if (testConn) {
            await derby.release(testConn);
        }
        callback();
    },
    testinitialize: async function(test) {
        const result = await derby.initialize();
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testcreatetable: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('CREATE TABLE fake (id int, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP)');
            test.expect(2);
            test.ok(statement);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testinsert: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('INSERT INTO fake VALUES (1, \'Jason\', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)');
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            await testConn.conn.commit();
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
            test.ok(result);
            await testConn.conn.commit();
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
    testdeleterollback: async function(test) {
        try {
            // Make sure that we turn off autocommit so we can rollback the delete.
            const command = await testConn.conn.setAutoCommit(false);
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('DELETE FROM fake WHERE id = 2');
            test.expect(4);
            test.equal(null, command);
            test.ok(statement);
            test.equal(1, result);
            test.ok(result);
            await testConn.conn.rollback();
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselectpostrollback: async function(test) {
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
    testdroptable: async function(test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('DROP TABLE fake');
            test.expect(1);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    }
};
