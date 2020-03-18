var _ = require('lodash');
const lolex = require("lolex");
const jinst = require('../lib/jinst');
const Pool = require('../lib/pool');

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
  minPoolSize: 1,
  maxPoolSize: 1
};

const configWithMaxIdle = {
  url: 'jdbc:hsqldb:hsql://localhost/xdb',
  user : 'SA',
  password: '',
  minPoolSize: 1,
  maxPoolSize: 1,
  maxIdle: 20*60*1000 //20 minutes
};

const configWithMaxIdleAndKeepAlive = {
  url: 'jdbc:hsqldb:hsql://localhost/xdb',
  user : 'SA',
  password: '',
  minPoolSize: 1,
  maxPoolSize: 1,
  maxIdle: 20*60*1000,
  keepAlive: {
    interval: 45*60*1000,
    query: 'select 1',
    enabled: true
  }
};

let testPool = null;
let conn1Uuid = null;
let clock = null;

module.exports = {
    group1: {
        setUp: async function(callback) {
            try {
                clock = lolex.install();
                testPool = new Pool(config);

                const conn = await testPool.reserve();
                conn1Uuid = conn.uuid;
                await testPool.release(conn);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                callback();
            }
        },
        tearDown: function(callback) {
            clock.uninstall();
            testPool = null;
            callback();
        },
        testreserve_normal: async function(test) {
            try {
                clock.tick("20:00");
                const conn = await testPool.reserve();
                test.expect(3);
                //expect the same connection to be returned
                test.equal(conn1Uuid, conn.uuid);
                test.equal(testPool.pool.length, 0);
                test.equal(testPool.reserved.length, 1);
                test.done();
            }
            catch (err) {
                console.log(err);
            }
        }
    },
    group2: {
        setUp: async function(callback) {
            try {
                clock = lolex.install();
                testPool = new Pool(configWithMaxIdle);

                const conn = await testPool.reserve();
                conn1Uuid = conn.uuid;
                await testPool.release(conn);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                callback();
            }
        },
        tearDown: function(callback) {
            clock.uninstall();
            callback();
        },
        testreserve_after_max_idle_time: async function(test) {
            try {
                clock.tick("40:00");
                const conn = await testPool.reserve();
                test.expect(3);
                //expect a new connection
                test.notEqual(conn1Uuid, conn.uuid);
                test.equal(testPool.pool.length, 0);
                test.equal(testPool.reserved.length, 1);
                test.done();
            }
            catch (err) {
                console.log(err);
            }
        }
    },
    group3: {
        setUp: async function(callback) {
            try {
                clock = lolex.install();
                testPool = new Pool(configWithMaxIdleAndKeepAlive);

                const conn = await testPool.reserve();
                conn1Uuid = conn.uuid;
                await testPool.release(conn);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                callback();
            }
        },
        tearDown: function(callback) {
            clock.uninstall();
            callback();
        },
        testreserve_after_max_idle_time_with_keepalive: async function(test) {
            try {
                clock.tick("40:00");
                const conn = await testPool.reserve();
                test.expect(3);
                //we expect the same connection to be retrieved
                test.equal(conn1Uuid, conn.uuid);
                test.equal(testPool.pool.length, 0);
                test.equal(testPool.reserved.length, 1);
                test.done();
            }
            catch (err) {
                console.log(err);
            }
        }
    }
};
