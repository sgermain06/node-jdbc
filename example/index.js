const JDBC = require('../lib/jdbc');
const jinst = require('../lib/jinst');

const config = {
    url: 'jdbc:hive2://localhost:10000/database_name',
    driverName: 'org.apache.hive.jdbc.HiveDriver',
    minPoolSize: 1,
    maxPoolSize: 10
};

(async (config) => {
    if (!jinst.isJvmCreated()) {
        jinst.addOption('-Xrs');
        jinst.setupClasspath([
            './drivers/hive-jdbc-1.2.1-standalone.jar',
            './drivers/hadoop-common-2.2.0.jar'
        ]);
    }

    const jdbc = new JDBC(config);
    await jdbc.initialize();

    const reservedInstance = await jdbc.reserve();

    const query = 'SELECT * FROM table LIMIT 1';
    const statement = await reservedInstance.conn.createStatement();
    const resultSet = await statement.executeQuery(query);

    console.log('Results:', await resultSet.toObjArray());
})(config);