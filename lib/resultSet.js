const jinst = require('./jinst');
const ResultSetMetaData = require('./resultSetMetaData');

const java = jinst.getInstance();

const isNull = require('lodash/isNull');
const range = require('lodash/range');
const map = require('lodash/map');

const { promiseForMethod } = require('./utils');

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
}

class ResultSet {
    constructor(resultSet) {
        this.rs = resultSet;
        this.holdability = (() => {
            const h = [];
            h[java.getStaticFieldValue('java.sql.ResultSet', 'CLOSE_CURSORS_AT_COMMIT')] = 'CLOSE_CURSORS_AT_COMMIT';
            h[java.getStaticFieldValue('java.sql.ResultSet', 'HOLD_CURSORS_OVER_COMMIT')] = 'HOLD_CURSORS_OVER_COMMIT';

            return h;
        })();
        this.types = (() => {
            const typeNames = [];

            typeNames[java.getStaticFieldValue("java.sql.Types", "BIT")] = "Boolean";
            typeNames[java.getStaticFieldValue("java.sql.Types", "TINYINT")] = "Short";
            typeNames[java.getStaticFieldValue("java.sql.Types", "SMALLINT")] = "Short";
            typeNames[java.getStaticFieldValue("java.sql.Types", "INTEGER")] = "Int";
            typeNames[java.getStaticFieldValue("java.sql.Types", "BIGINT")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "FLOAT")] = "Float";
            typeNames[java.getStaticFieldValue("java.sql.Types", "REAL")] = "Float";
            typeNames[java.getStaticFieldValue("java.sql.Types", "DOUBLE")] = "Double";
            typeNames[java.getStaticFieldValue("java.sql.Types", "NUMERIC")] = "BigDecimal";
            typeNames[java.getStaticFieldValue("java.sql.Types", "DECIMAL")] = "BigDecimal";
            typeNames[java.getStaticFieldValue("java.sql.Types", "CHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "VARCHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "LONGVARCHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "DATE")] = "Date";
            typeNames[java.getStaticFieldValue("java.sql.Types", "TIME")] = "Time";
            typeNames[java.getStaticFieldValue("java.sql.Types", "TIMESTAMP")] = "Timestamp";
            typeNames[java.getStaticFieldValue("java.sql.Types", "BOOLEAN")] = "Boolean";
            typeNames[java.getStaticFieldValue("java.sql.Types", "NCHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "NVARCHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "LONGNVARCHAR")] = "String";
            typeNames[java.getStaticFieldValue("java.sql.Types", "BINARY")] = "Bytes";
            typeNames[java.getStaticFieldValue("java.sql.Types", "VARBINARY")] = "Bytes";
            typeNames[java.getStaticFieldValue("java.sql.Types", "LONGVARBINARY")] = "Bytes";
            typeNames[java.getStaticFieldValue("java.sql.Types", "BLOB")] = "Bytes";

            return typeNames;
        })();
    }

    getMetaData() {
        return promiseForMethod(() => new ResultSetMetaData(this.rs.getMetaDataSync()));
    }
    close() {
        this.rs.closeSync();
    }

    async toObjArray() {
        const rows = await this.toObject();
        return rows.rows;
    }

    async toObject() {
        const rs = await this.toObjectIter();
        const rowIter = rs.rows();
        const rows = [];
        let row = rowIter.next();

        while (!row.done) {
            rows.push(row.value);
            row = rowIter.next();
        }

        rs.rows = rows;
        return rs;
    }

    async toObjectIter() {
        const columnsMetaData = [];
        const rsmd = await this.getMetaData();
        const columnCount = await rsmd.getColumnCount();
        range(1, columnCount + 1).forEach(i => {
            columnsMetaData.push({
                label: rsmd.rsmd.getColumnLabelSync(i),
                type: rsmd.rsmd.getColumnTypeSync(i)
            });
        });

        const self = this;
        const rows = function* () {
            while (self.rs.nextSync()) {
                const result = {};
                range(1, columnCount + 1).forEach(i => {
                    const cmd = columnsMetaData[i - 1];
                    const type = self.types[cmd.type] || 'String';
                    const getter = 'get' + type + 'Sync';

                    if (type === 'Date' || type === 'Time' || type === 'Timestamp') {
                        const dateVal = self.rs[getter](i);
                        result[cmd.label] = dateVal ? dateVal.toString() : null;
                    }
                    else {
                        // If the column is an integer and is null, set result to null and continue
                        if (type === 'Int' && isNull(self.rs.getObjectSync(i))) {
                            result[cmd.label] = null;
                            return;
                        }

                        result[cmd.label] = self.rs[getter](i);
                    }
                });
                yield result;
            }
        };

        return {
            labels: map(columnsMetaData, 'label'),
            types: map(columnsMetaData, 'type'),
            rows
        };
    }
}

module.exports = ResultSet;