const jinst = require('../lib/jinst');
const dm = require('../lib/driverManager');
const Connection = require('../lib/connection');
const ResultSet = require('../lib/resultSet');

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
  password: ''
};

let testConn = null;

module.exports = {
    setUp: async function(callback) {
        try {
            if (testConn === null) {
                const connection = dm.getConnection(config.url, config.user, config.password);
                testConn = new Connection(connection);
            }
            callback();
        }
        catch (err) {
            console.log(err);
        }
    },
    testabort: async function(test) {
        try {
            await testConn.abort();
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testclearwarnings: async function(test) {
        const result = await testConn.clearWarnings();
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testclose: async function(test) {
        const result = await testConn.close();
        test.expect(1);
        test.equal(null, result);
        testConn = null;
        test.done();
    },
    testcloseclosed: async function(test) {
        testConn.conn = null;
        const result = await testConn.close();
        test.expect(1);
        test.equal(null, result);
        testConn = null;
        test.done();
    },
    testcommit: async function(test) {
        const result = await testConn.commit();
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testcreatearrayof: async function(test) {
        try {
            await testConn.createArrayOf(null, null);
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testcreateblob: async function(test) {
        try {
            await testConn.createBlob();
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testcreateclob: async function(test) {
        try {
            await testConn.createClob();
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testcreatenclob: async function(test) {
        try {
            await testConn.createNClob();
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testcreatesqlxml: async function(test) {
        try {
            testConn.createSQLXML();
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testcreatestatment: async function(test) {
        const statement = await testConn.createStatement();
        test.expect(1);
        test.ok(statement);
        test.done();
    },
    testcreatestatement1: async function(test) {
        const statement = await testConn.createStatement(0, 0);
        test.expect(1);
        test.ok(statement);
        test.done();
    },
    testcreatestatement2: async function(test) {
        const statement = await testConn.createStatement(0, 0, 0);
        test.expect(1);
        test.ok(statement);
        test.done();
    },
    testcreatestruct: async function(test) {
        try {
            await testConn.createStruct(null, null);
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testgetautocommit: async function(test) {
        const result = await testConn.getAutoCommit();
        test.expect(1);
        test.equal(true, result);
        test.done();
    },
    testgetcatalog: async function(test) {
        const catalog = await testConn.getCatalog();
        test.expect(1);
        test.ok(catalog);
        test.done();
    },
    testgetclientinfo: async function(test) {
        const props = await testConn.getClientInfo();
        test.expect(1);
        test.ok(props);
        test.done();
    },
    testgetholdability: async function(test) {
        const holdability = await testConn.getHoldability();
        test.expect(1);
        test.ok(holdability);
        test.done();
    },
    testgetmetadata: async function(test) {
        const metadata = await testConn.getMetaData();
        test.expect(1);
        test.ok(metadata);
        test.done();
    },
    testgetnetworktimeout: async function(test) {
        const ms = await testConn.getNetworkTimeout();
        test.expect(1);
        test.equal(0, ms);
        test.done();
    },
    testgetschema: async function(test) {
        const schema = await testConn.getSchema();
        test.expect(1);
        test.ok(schema);
        test.done();
    },
    testgettransactionisolation: async function(test) {
        const txniso = await testConn.getTransactionIsolation();
        test.expect(2);
        test.ok(txniso);
        test.equal(txniso, "TRANSACTION_READ_COMMITTED");
        test.done();
    },
    testgettypemap: async function(test) {
        const map = await testConn.getTypeMap();
        test.expect(1);
        test.ok(map);
        test.done();
    },
    testgetwarnings: async function(test) {
        const sqlWarning = await testConn.getWarnings();
        test.expect(1);
        test.ok(sqlWarning);
        test.done();
    },
    testisclosed: async function(test) {
        const closed = await testConn.isClosed();
        test.expect(1);
        test.equal(false, closed);
        test.done();
    },
    testisreadonly: async function(test) {
        const readonly = await testConn.isReadOnly();
        test.expect(1);
        test.equal(false, readonly);
        test.done();
    },
    testisvalid: async function(test) {
        const valid = await testConn.isValid(0);
        test.expect(1);
        test.ok(valid);
        test.done();
    },
    testnativesql: async function(test) {
        try {
            await testConn.nativeSQL(null);
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testpreparecallsql: async function(test) {
        const callablestatement = await testConn.prepareCall("{ call database() }");
        test.expect(1);
        test.ok(callablestatement);
        test.done();
    },
    testpreparestatement: async function(test) {
        const preparedstatement = await testConn.prepareCall("SELECT 1 FROM INFORMATION_SCHEMA.SYSTEM_USERS;");
        test.expect(1);
        test.ok(preparedstatement);
        test.done();
    },
    testreleasesavepoint: async function(test) {
        try {
            await testConn.setAutoCommit(false);
            const savePoint = await testConn.setSavepoint();
            const result = await testConn.releaseSavepoint(savePoint);
            test.expect(1);
            test.equal(null, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testrollback: async function(test) {
        try {
            await testConn.setAutoCommit(false);
            const result = await testConn.rollback();
            test.expect(1);
            test.equal(null, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testrollbacksavepoint: async function(test) {
        try {
            await testConn.setAutoCommit(false);
            const savePoint = await testConn.setSavepoint('fake-savepoint');
            const result = await testConn.rollback(savePoint);
            test.expect(1);
            test.equal(result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testsetcatalog: async function(test) {
        try {
            const result = await testConn.setCatalog('PUBLIC');
            test.expect(1);
            test.equal(null, result);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testsetclientinfo: async function(test) {
        // Note that HSQLDB doesn't support this feature so it errors.
        try {
            await testConn.setClientInfo(null, 'TEST', 'ME');
        }
        catch (err) {
            test.expect(1);
            test.ok(err);
            test.done();
        }
    },
    testsetholdability: async function(test) {
        const hold = (new ResultSet(null)).holdability.indexOf('HOLD_CURSORS_OVER_COMMIT');
        const result = await testConn.setHoldability(hold);
        test.expect(1);
        test.equal(result);
        test.done();
    },
    testsetnetworktimeout: async function(test) {
        try {
            await testConn.setNetworkTimeout(null, null);
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
    testsetreadonly: async function(test) {
        const result = await testConn.setReadOnly(true);
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testsetsavepoint: async function(test) {
        try {
            await testConn.setAutoCommit(false);
            const savePoint = await testConn.setSavepoint();
            test.expect(1);
            test.ok(savePoint);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testsetsavepointname: async function(test) {
        try {
            await testConn.setAutoCommit(false);
            const savePoint = await testConn.setSavepoint('SAVEPOINT');
            test.expect(1);
            test.ok(savePoint);
            test.done();
        }
        catch (err) {
            console.log(err);
        }
    },
    testsetschema: async function(test) {
        const result = await testConn.setSchema('PUBLIC');
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testsettransactionisolation: async function(test) {
        const txniso = await testConn.txniso.indexOf('TRANSACTION_SERIALIZABLE');
        const result = await testConn.setTransactionIsolation(txniso);
        test.expect(1);
        test.equal(null, result);
        test.done();
    },
    testsettypemap: async function(test) {
        try {
            await testConn.setTypeMap(null);
        }
        catch (err) {
            test.expect(2);
            test.ok(err);
            test.equal("NOT IMPLEMENTED", err.message);
            test.done();
        }
    },
};
