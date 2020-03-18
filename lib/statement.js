const ResultSet = require('./resultSet');
const jinst = require('./jinst');
const java = jinst.getInstance();

const isString = require('lodash/isString');
const isNil = require('lodash/isNil');

const { promiseForMethod } = require('./utils');

jinst.events.once('initialized', function onInitialized() {
    // The constant indicating that the current ResultSet object should be closed
    // when calling getMoreResults.
    Statement.CLOSE_CURRENT_RESULT = java.getStaticFieldValue('java.sql.Statement', 'CLOSE_CURRENT_RESULT');

    // The constant indicating that the current ResultSet object should not be
    // closed when calling getMoreResults.
    Statement.KEEP_CURRENT_RESULT = java.getStaticFieldValue('java.sql.Statement', 'KEEP_CURRENT_RESULT');

    // The constant indicating that all ResultSet objects that have previously been
    // kept open should be closed when calling getMoreResults.
    Statement.CLOSE_ALL_RESULTS = java.getStaticFieldValue('java.sql.Statement', 'CLOSE_ALL_RESULTS');

    // The constant indicating that a batch statement executed successfully but that
    // no count of the number of rows it affected is available.
    Statement.SUCCESS_NO_INFO = java.getStaticFieldValue('java.sql.Statement', 'SUCCESS_NO_INFO');

    // The constant indicating that an error occured while executing a batch
    // statement.
    Statement.EXECUTE_FAILED = java.getStaticFieldValue('java.sql.Statement', 'EXECUTE_FAILED');

    // The constant indicating that generated keys should be made available for
    // retrieval.
    Statement.RETURN_GENERATED_KEYS = java.getStaticFieldValue('java.sql.Statement', 'RETURN_GENERATED_KEYS');

    // The constant indicating that generated keys should not be made available for
    // retrieval.
    Statement.NO_GENERATED_KEYS = java.getStaticFieldValue('java.sql.Statement', 'NO_GENERATED_KEYS');
});

class Statement {

    constructor(stmt) {
        this.s = stmt;
    }

    addBatch() {
        throw new Error('NOT IMPLEMENTED');
    }

    cancel() {
        return this.s.cancelSync();
    }
    clearBatch() {
        return this.s.clearBatchSync();
    }
    close() {
        this.s.closeSync();
    }
    executeUpdate(sql, arg1) {
        const args = Array.prototype.slice.call(arguments);
        return promiseForMethod(() => {
            if (!((isString(sql) || isNil(sql)) && isNil(arg1))) throw new Error('INVALID ARGUMENTS');
            return this.s.executeUpdateSync.apply(this.s, args);
        });
    }
    executeQuery(sql) {
        const args = Array.prototype.slice.call(arguments);
        return promiseForMethod(() => {
            if (!(isString(sql) || isNil(sql))) throw new Error('INVALID ARGUMENTS');
            return new ResultSet(this.s.executeQuerySync.apply(this.s, args));
        });
    }
    execute(sql) {
        const args = Array.prototype.slice.call(arguments);
        return promiseForMethod(() => {
            if (!(isString(sql) || isNil(sql))) throw new Error('INVALID ARGUMENTS');
            const isResultSet = this.s.executeSync.apply(this.s, args);
            if (isResultSet) {
                return new ResultSet(this.s.getResultSetSync());
            }
            else {
                return this.s.getUpdateCountSync();
            }
        });
    }
    getFetchSize() {
        return this.s.getFetchSizeSync();
    }
    setFetchSize(rows) {
        return this.s.setFetchSizeSync(rows);
    }
    getMaxRows() {
        return this.s.getMaxRowsSync();
    }
    setMaxRows(max) {
        return this.s.setMaxRowsSync(max);
    }
    getQueryTimeout() {
        return this.s.getQueryTimeoutSync();
    }
    setQueryTimeout(timeout) {
        return this.s.setQueryTimeoutSync(timeout);
    }
    getGeneratedKeys() {
        return this.s.getGeneratedKeysSync();
    }
}

module.exports = Statement;
