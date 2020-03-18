const jinst = require('../lib/jinst');
const JDBC = require('../lib/jdbc');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
  jinst.setupClasspath(['./drivers/hsqldb.jar',
                        './drivers/derby.jar',
                        './drivers/derbyclient.jar',
                        './drivers/derbytools.jar']);
}

const configWithUserInUrl = {
  url: 'jdbc:hsqldb:hsql://localhost/xdb;user=SA;password='
};

const configderby = {
  url: 'jdbc:derby://localhost:1527/testdb'
};

const hsqldb = new JDBC(configWithUserInUrl);
const derby = new JDBC(configderby);
let hsqldbConn = null;
let derbyConn = null;

const testDate = Date.now();

exports.hsqldb = {
    setUp: async function(callback) {
        if (hsqldbConn === null && hsqldb.pool.length > 0) {
            hsqldbConn = await hsqldb.reserve();
        }
        callback();
    },
    tearDown: async function(callback) {
        if (hsqldbConn) {
            await hsqldb.release(hsqldbConn);
        }
        callback();
    },
    testinitialize: async function(test) {
        try {
            const result = await hsqldb.initialize();
            test.expect(1);
            test.equal(null, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testcreatetable: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
            const create = 'CREATE TABLE fake (id int, bi bigint, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP)';
            const result = await statement.executeUpdate(create);
            test.expect(1);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testinsert: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
            const insert = 'INSERT INTO fake VALUES (1, 9223372036854775807, \'Jason\', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)';
            const result = await statement.executeUpdate(insert);
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testupdate: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
            const result = await statement.executeUpdate('UPDATE fake SET id = 2 WHERE name = \'Jason\'');
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselect: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
            const resultSet = await statement.executeQuery('SELECT * FROM fake');
            test.expect(7);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.equal(results[0].BI, '9223372036854775807');
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
    testpreparedselectsetstring: async function(test) {
        try {
            const statement = await hsqldbConn.conn.prepareStatement('SELECT * FROM fake WHERE name=?');
            const command = await statement.setString(1, 'Jason');
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsetint: async function(test) {
        try {
            const statement = await hsqldbConn.conn.prepareStatement('SELECT * FROM fake WHERE id=?');
            const command = await statement.setInt(1, 2);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedinsertsetdate: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlDate = myJava.newInstanceSync('java.sql.Date', myJava.newLong(testDate));

            const statement = await hsqldbConn.conn.prepareStatement('INSERT INTO fake (id,name,date) VALUES (3,\'Test\',?)');
            const command = await statement.setDate(1, sqlDate, null);
            const count = await statement.executeUpdate();
            test.expect(2);
            test.equal(null, command);
            test.equal(1, count);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsetdate: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlDate = myJava.newInstanceSync('java.sql.Date', myJava.newLong(testDate));
            const statement = await hsqldbConn.conn.prepareStatement('SELECT * FROM fake WHERE id = 3 AND date = ?');
            const command = await statement.setDate(1, sqlDate, null);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedinsertsettimestamp: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlTimestamp = myJava.newInstanceSync('java.sql.Timestamp', myJava.newLong(testDate));

            const statement = await hsqldbConn.conn.prepareStatement('INSERT INTO fake (id,name,timestamp) VALUES (4,\'Test\',?)');
            const command = await statement.setTimestamp(1, sqlTimestamp, null);
            const count = await statement.executeUpdate();
            test.expect(2);
            test.equal(null, command);
            test.equal(1, count);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsettimestamp: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlTimestamp = myJava.newInstanceSync('java.sql.Timestamp', myJava.newLong(testDate));
            const statement = await hsqldbConn.conn.prepareStatement('SELECT * FROM fake WHERE id = 4 AND timestamp = ?');
            const command = await statement.setTimestamp(1, sqlTimestamp, null);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdelete: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
            const result = await statement.executeUpdate('DELETE FROM fake WHERE id = 2');
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdroptable: async function(test) {
        try {
            const statement = await hsqldbConn.conn.createStatement();
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

exports.derby = {
    setUp: async function(callback) {
        if (derbyConn === null && derby.pool.length > 0) {
            derbyConn = await derby.reserve();
        }
        callback();
    },
    tearDown: async function(callback) {
        if (derbyConn) {
            await derby.release(derbyConn);
        }
        callback();
    },
    testinitialize: async function(test) {
        try {
            const result = await derby.initialize();
            test.expect(1);
            test.equal(null, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testcreatetable: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
            const create = 'CREATE TABLE fake (id int, bi bigint, name varchar(10), date DATE, time TIME, timestamp TIMESTAMP)';
            const result = await statement.executeUpdate(create);
            test.expect(1);
            test.equal(0, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testinsert: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
            const insert = 'INSERT INTO fake VALUES (1, 9223372036854775807, \'Jason\', CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)';
            const result = await statement.executeUpdate(insert);
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testupdate: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
            const result = await statement.executeUpdate('UPDATE fake SET id = 2 WHERE name = \'Jason\'');
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testselect: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
            const resultSet = await statement.executeQuery('SELECT * FROM fake');
            test.expect(7);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.equal(results[0].BI, '9223372036854775807');
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
    testpreparedselectsetstring: async function(test) {
        try {
            const statement = await derbyConn.conn.prepareStatement('SELECT * FROM fake WHERE name=?');
            const command = await statement.setString(1, 'Jason');
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsetint: async function(test) {
        try {
            const statement = await derbyConn.conn.prepareStatement('SELECT * FROM fake WHERE id=?');
            const command = await statement.setInt(1, 2);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedinsertsetdate: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlDate = myJava.newInstanceSync('java.sql.Date', myJava.newLong(testDate));

            const statement = await derbyConn.conn.prepareStatement('INSERT INTO fake (id,name,date) VALUES (3,\'Test\',?)');
            const command = await statement.setDate(1, sqlDate, null);
            const count = await statement.executeUpdate();
            test.expect(2);
            test.equal(null, command);
            test.equal(1, count);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsetdate: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlDate = myJava.newInstanceSync('java.sql.Date', myJava.newLong(testDate));
            const statement = await derbyConn.conn.prepareStatement('SELECT * FROM fake WHERE id = 3 AND date = ?');
            const command = await statement.setDate(1, sqlDate, null);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedinsertsettimestamp: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlTimestamp = myJava.newInstanceSync('java.sql.Timestamp', myJava.newLong(testDate));

            const statement = await derbyConn.conn.prepareStatement('INSERT INTO fake (id,name,timestamp) VALUES (4,\'Test\',?)');
            const command = await statement.setTimestamp(1, sqlTimestamp, null);
            const count = await statement.executeUpdate();
            test.expect(2);
            test.equal(null, command);
            test.equal(1, count);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testpreparedselectsettimestamp: async function(test) {
        try {
            const myJava = jinst.getInstance();
            const sqlTimestamp = myJava.newInstanceSync('java.sql.Timestamp', myJava.newLong(testDate));
            const statement = await derbyConn.conn.prepareStatement('SELECT * FROM fake WHERE id = 4 AND timestamp = ?');
            const command = await statement.setTimestamp(1, sqlTimestamp, null);
            const resultSet = await statement.executeQuery();
            test.expect(3);
            test.equal(null, command);
            test.ok(resultSet);
            const results = await resultSet.toObjArray();
            test.equal(results.length, 1);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdelete: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
            const result = await statement.executeUpdate('DELETE FROM fake WHERE id = 2');
            test.expect(2);
            test.equal(1, result);
            test.ok(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testdroptable: async function(test) {
        try {
            const statement = await derbyConn.conn.createStatement();
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
