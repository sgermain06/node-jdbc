class ResultSetMetaData {

    constructor(rsmd) {
        this.rsmd = rsmd;
    }

    getColumnCount() {
        return this.rsmd.getColumnCountSync();
    }
    getColumnName(column) {
        return this.rsmd.getColumnNameSync(column);
    }
}

module.exports = ResultSetMetaData;