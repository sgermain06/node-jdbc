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
