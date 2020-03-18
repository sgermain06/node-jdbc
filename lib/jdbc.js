const Pool = require("./pool");

class JDBC extends Pool {
    constructor(config) {
        super(config);
    }
}

module.exports = JDBC;
