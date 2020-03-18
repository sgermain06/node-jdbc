const jinst = require('../lib/jinst');
const JDBC = require('../lib/jdbc');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./drivers/hsqldb.jar',
    './drivers/derby.jar',
    './drivers/derbyclient.jar',
    './drivers/derbytools.jar']);
}

const derby = new JDBC({
  url: 'jdbc:derby://localhost:1527/testdb;create=true'
});

let testConn = null;

module.exports = {
    setUp: async function (callback) {
        if (testConn === null && derby.pool.length > 0) {
            testConn = await derby.reserve();
        }
        callback();
    },
    tearDown: async function (callback) {
        if (testConn) {
            await derby.release(testConn);
        }
        callback();
    },
    testinitialize: async function (test) {
        const result = await derby.initialize();
        test.expect(1);
        test.equal(result, null);
        test.done();
    },
    testcreatetable: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const create = 'CREATE TABLE fakeMax (id int, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP)';
            const result = await statement.executeUpdate(create);
            test.expect(1);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testMultipleInserts: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const results = [];
            for (let i = 0; i < 50; i++) {
                results.push(await statement.executeUpdate(
                    `INSERT INTO fakeMax VALUES (${i}, 'Jason_${i}', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)`));
            }
            test.expect(3);
            test.ok(statement);
            test.equal(50, results.length);
            test.ok(results);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselect: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const resultSet = await statement.executeQuery('SELECT * FROM fakeMax');
            test.expect(7);
            test.ok(statement);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 50);
            test.equal(results[0].NAME, 'Jason_0');
            test.ok(results[0].DATE);
            test.ok(results[0].TIME);
            test.ok(results[0].TIMESTAMP);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselectWithMax10Rows: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const command = await statement.setMaxRows(10);
            const resultSet = await statement.executeQuery('SELECT * FROM fakeMax');
            test.expect(5);
            test.equal(null, command);
            test.ok(statement);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 10);
            test.equal(results[0].NAME, 'Jason_0');
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselectWithMax70Rows: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const command = await statement.setMaxRows(70);
            const resultSet = await statement.executeQuery('SELECT * FROM fakeMax');
            test.expect(5);
            test.equal(null, command);
            test.ok(statement);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 50);
            test.equal(results[0].NAME, 'Jason_0');
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdroptable: async function (test) {
        try {
            const statement = await testConn.conn.createStatement();
            const result = await statement.executeUpdate('DROP TABLE fakeMax');
            test.expect(1);
            test.equal(result, 0);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    }
};
