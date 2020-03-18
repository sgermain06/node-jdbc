const uuid = require('uuid');
const jinst = require("./jinst");
const winston = require('winston');

const java = jinst.getInstance();

const isNil = require('lodash/isNil');

const dm = require('./driverManager');
const Connection = require('./connection');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
}

const keepAlive = async function(connection, query) {
    try {
        const stmt = await connection.createStatement();
        await stmt.execute(query);
        winston.silly("%s - Keep-Alive", new Date().toUTCString());
    }
    catch (err) {
        winston.error(err);
    }
};

const addConnection = async function(url, props, ka, maxIdle) {
    const connection = await dm.getConnection(url, props);
    const connObj = {
        uuid: uuid.v4(),
        conn: new Connection(connection),
        keepalive: ka.enabled ? setInterval(keepAlive, ka.interval, connection, ka.query) : false
    };

    if (maxIdle) {
        connObj.lastIdle = new Date().getTime();
    }

    return connObj;
};

const connStatus = (acc, pool) => {
    pool.reduce((connections, connObj) => {
        const conn = connObj.conn;
        connections.push({
            uuid: connObj.uuid,
            closed: conn.isClosed(),
            readonly: conn.isReadOnly(),
            valid: conn.isValid(1000)
        });
        return connections;
    }, acc);
    return acc;
};

const closeIdleConnectionsInArray = async (array, maxIdle) => {
    const time = new Date().getTime();
    const maxLastIdle = time - maxIdle;

    for (let i = array.length - 1; i >=0; i--) {
        const connection = array[i];
        if (typeof connection === 'object' && connection.conn !== null) {
            if (connection.lastIdle < maxLastIdle) {
                await connection.conn.close();
                array.splice(i, 1);
            }
        }
    }
};

class Pool {

    constructor(config) {
        this.url = config.url;
        this.props = (config => {
            const javaProperties = java.import('java.util.Properties');
            const properties = new javaProperties();

            for (const name in config.properties) {
                properties.putSync(name, config.properties[name]);
            }

            // NOTE: https://docs.oracle.com/javase/7/docs/api/java/util/Properties.html#getProperty(java.lang.String)
            // if property does not exist it returns 'null' in the new java version, so we can use isNil to support
            // older versions as well

            if (config.user && isNil(properties.getPropertySync('user'))) {
                properties.putSync('user', config.user);
            }

            if (config.password && isNil(properties.getPropertySync('password'))) {
                properties.putSync('password', config.password);
            }

            return properties;
        })(config);

        this.driverName = config.driverName ? config.driverName : '';
        this.minPoolSize = config.minPoolSize ? config.minPoolSize : 1;
        this.maxPoolSize = config.maxPoolSize ? config.maxPoolSize : 1;
        this.keepAlive = config.keepAlive ? config.keepAlive : {
            interval: 60000,
            query: 'select 1',
            enabled: false
        };
        this.maxIdle = (!this.keepAlive.enabled && config.maxIdle) || null;
        this.logging = config.logging ? config.logging : {
            level: 'error'
        };
        this.pool = [];
        this.reserved = [];
    }
    initialize() {
        return new Promise(async (res, rej) => {
            try {
                winston.level = this.logging.level;
                // If a driverName is supplied, initialize the via the old method,
                // Class.forName()
                if (this.driverName) {
                    await dm.registerDriver(java.newInstanceSync(this.driverName));
                }
                this.pool = await this.addConnectionsOnInitialize();
                res();
            } catch (err) {
                rej(err);
            } finally {
                jinst.events.emit('initialized');
            }
        });
    }
    status() {
        return {
            available: this.pool.length,
            reserved: this.reserved.length,
            pool: connStatus([], this.pool),
            rpool: connStatus([], this.reserved)
        };
    }
    async addConnectionsOnInitialize() {
        const connections = [];
        for (let i = 0; i < this.minPoolSize; i++) {
            const connection = await addConnection(this.url, this.props, this.keepAlive, this.maxIdle);
            connections.push(connection);
        }
        return connections;
    }
    async closeIdleConnections() {
        if (!this.maxIdle) return;

        return await Promise.all([
            closeIdleConnectionsInArray(this.pool, this.maxIdle),
            closeIdleConnectionsInArray(this.reserved, this.maxIdle)
        ]);
    }

    async reserve() {
        let connection = null;
        await this.closeIdleConnections();
        if (this.pool.length > 0) {
            connection = this.pool.shift();
            if (connection.lastIdle) {
                connection.lastIdle = new Date().getTime();
            }
            this.reserved.unshift(connection);
        }
        else if (this.reserved.length < this.maxPoolSize) {
            try {
                connection = await addConnection(this.url, this.props, this.keepAlive, this.maxIdle);
                this.reserved.unshift(connection);
            }
            catch (err) {
                winston.error(err);
                connection = null;
                throw err;
            }
        }

        if (connection === null) {
            throw new Error('No more pool connections available.');
        }

        return connection;
    }
    async release(connection) {
        if (typeof connection !== 'object') throw new Error('INVALID CONNECTION');

        this.reserved = this.reserved.filter(x => x.uuid !== connection.uuid);

        if (connection.lastIdle) connection.lastIdle = new Date().getTime();

        this.pool.unshift(connection);
    }
    async purge() {
        await Promise.all([...this.pool, ...this.reserved].map(async connection => {
            if (typeof connection === 'object' && connection.conn !== null) {
                await connection.conn.close();
            }
        }));
        this.pool = [];
        this.reserved = [];
    }
}

module.exports = Pool;
