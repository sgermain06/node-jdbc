const jinst = require('../lib/jinst');
const dm = require('../lib/driverManager.js');
const java = jinst.getInstance();

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

module.exports = {
    testgetconnection: async function(test) {
        const connection = await dm.getConnection(config.url + ';user=' + config.user + ';password=' + config.password);
        test.expect(1);
        test.ok(connection);
        test.done();
    },
    testgetconnectionwithprops: async function(test) {
        const Properties = java.import('java.util.Properties');
        const props = new Properties();

        props.putSync('user', config.user);
        props.putSync('password', config.password);

        const connection = dm.getConnection(config.url, props);
        test.expect(1);
        test.ok(connection);
        test.done();
    },
    testgetconnectionwithuserpass: async function(test) {
        const connection = await dm.getConnection(config.url, config.user, config.password);
        test.expect(1);
        test.ok(connection);
        test.done();
    },
    testsetlogintimeout: async function(test) {
        const timeout = await dm.setLoginTimeout(60);
        test.expect(1);
        test.ok(timeout);
        test.done();
    },
    testgetlogintimeout: async function(test) {
        const seconds = await dm.getLoginTimeout();
        test.expect(2);
        test.ok(seconds);
        test.equal(60, seconds);
        test.done();
    }
};
