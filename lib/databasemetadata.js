const {
    isNil,
    isString,
    isInteger,
    isBoolean,
    isArray,
    isEmpty,
} = require('lodash');
const ResultSet = require('./resultSet');
const Connection = require('./connection');
const jinst = require('./jinst');
const java = jinst.getInstance();

const { promiseForMethod } = require('./utils');

class DatabaseMetaData {

    constructor(dbm) {
        this.dbm = dbm;
    }

    /**
     * Retrieves the schema names available in this database.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is a schema description
     */
    getSchema(catalog, schemaPattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getSchemasSync(catalog, schemaPattern));
        });
    }

    /**
     * Retrieves a description of the tables available in the given catalog.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} tableNamePattern - A table name pattern; must match the table name as it is stored in the database
     * @param {String[]} types -  A list of table types, which must be from the list of table types returned from getTableTypes(),to include; null returns all types
     * @returns {ResultSet} Via callback: each row is a table description
     */
    getTables(catalog, schemaPattern, tableNamePattern, types = []) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(tableNamePattern) || isString(tableNamePattern)) &&
                (isArray(types) || types.every(isString))
            )) {
                throw new Error("INVALID ARGUMENTS");
            }

            return new ResultSet(this.dbm.getTablesSync(catalog, schemaPattern, tableNamePattern, types));
        });
    }

    /**
     * Retrieves whether the current user can call all the procedures returned by
     * the method getProcedures.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    allProceduresAreCallable() {
        return promiseForMethod(() => this.dbm.allProceduresAreCallableSync());
    }

    /**
     * Retrieves whether the current user can use all the tables returned by the
     * method getTables in a SELECT statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    allTablesAreSelectable() {
        promiseForMethod(() => this.dbm.allTablesAreSelectableSync());
    }

    /**
     * Retrieves whether a SQLException while autoCommit is true indicates that all
     * open ResultSets are closed, even ones that are holdable.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    autoCommitFailureClosesAllResultSets() {
        return promiseForMethod(() => this.dbm.autoCommitFailureClosesAllResultSetsSync());
    }

    /**
     * Retrieves whether a data definition statement within a transaction forces
     * the transaction to commit.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    dataDefinitionCausesTransactionCommit() {
        return promiseForMethod(() => this.dbm.dataDefinitionCausesTransactionCommitSync());
    }

    /**
     * Retrieves whether this database ignores a data definition statement within a
     * transaction.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    dataDefinitionIgnoredInTransactions() {
        return promiseForMethod(() => this.dbm.dataDefinitionIgnoredInTransactionsSync());
    }

    /**
     * Retrieves whether or not a visible row delete can be detected by calling the
     * method ResultSet.rowDeleted.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if deletes are detected by the given result set type; false otherwise
     */
    deletesAreDetected(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');
            return this.dbm.deletesAreDetectedSync();
        });
    }

    /**
     * Retrieves whether the return value for the method getMaxRowSize includes the
     * SQL data types LONGVARCHAR and LONGVARBINARY.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    doesMaxRowSizeIncludeBlobs() {
        return promiseForMethod(() => this.dbm.doesMaxRowSizeIncludeBlobsSync());
    }

    /**
     * Retrieves whether a generated key will always be returned if the column
     * name(s) or index(es) specified for the auto generated key column(s) are
     * valid and the statement succeeds.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    generatedKeyAlwaysReturned() {
        return promiseForMethod(() => this.dbm.generatedKeyAlwaysReturnedSync());
    }

    /**
     * Retrieves a description of the given attribute of the given type for a
     * user-defined type (UDT) that is available in the given schema and catalog.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} typeNamePattern - A type name pattern; must match the type name as it is stored in the database
     * @param {String} attributeNamePattern - An attribute name pattern; must match the attribute name as it is declared in the database
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is an attribute description
     */
    getAttributes(catalog, schemaPattern, typeNamePattern, attributeNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(typeNamePattern) || isString(typeNamePattern)) &&
                (isNil(attributeNamePattern) || isString(attributeNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getAttributesSync(catalog, schemaPattern, typeNamePattern, attributeNamePattern));
        });
    }

    /**
     * Retrieves a description of a table's optimal set of columns that uniquely
     * identifies a row.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in the database
     * @param {Number} scope - The scope of interest; use same values as SCOPE
     * @param {Boolean} nullable - Include columns that are nullable
     * @returns {ResultSet} Via callback: each row is a column description
     */
    getBestRowIdentifier(catalog, schema, table, scope, nullable) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table)) &&
                isInteger(scope) &&
                isBoolean(nullable)
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getBestRowIdentifierSync(catalog, schema, table, scope, nullable));
        });
    }

    /**
     * Retrieves the catalog names available in this database.
     *
     * @returns {ResultSet} Via callback: a ResultSet object in which each row has a single String column that is a catalog name
     */
    getCatalogs() {
        return promiseForMethod(() => new ResultSet(this.dbm.getCatalogsSync()));
    }

    /**
     * Retrieves the String that this database uses as the separator between a
     * catalog and table name.
     *
     * @returns {String} Via callback: the separator string
     */
    getCatalogSeparator() {
        return promiseForMethod(() => this.dbm.getCatalogSeparatorSync());
    }

    /**
     * Retrieves the database vendor's preferred term for "catalog".
     *
     * @returns {String} Via callback: the vendor term for "catalog"
     */
    getCatalogTerm() {
        return promiseForMethod(() => this.dbm.getCatalogTermSync());
    }

    /**
     * Retrieves a list of the client info properties that the driver supports.
     *
     * @returns {ResultSet} Via callback: A ResultSet object; each row is a supported client info property
     */
    getClientInfoProperties() {
        return promiseForMethod(() => new ResultSet(this.dbm.getClientInfoPropertiesSync()));
    }

    /**
     * Retrieves a description of the access rights for a table's columns.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in the database
     * @param {String} columnNamePattern - A column name pattern; must match the column name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a column privilege description
     */
    getColumnPrivileges(catalog, schema, table, columnNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table)) &&
                (isNil(columnNamePattern) || isString(columnNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getColumnPrivilegesSync(catalog, schema, table, columnNamePattern));
        });
    }

    /**
     * Retrieves a description of table columns available in the specified catalog.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} tableNamePattern - A table name pattern; must match the table name as it is stored in the database
     * @param {String} columnNamePattern - A column name pattern; must match the column name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a column description
     */
    getColumns(catalog, schemaPattern, tableNamePattern, columnNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(tableNamePattern) || isString(tableNamePattern)) &&
                (isNil(columnNamePattern) || isString(columnNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getColumnsSync(catalog, schemaPattern, tableNamePattern, columnNamePattern));
        });
    }

    /**
     * Retrieves the connection that produced this metadata object.
     *
     * @returns {Connection} Via callback: the connection that produced this metadata object
     */
    getConnection() {
        return promiseForMethod(() => new Connection(this.dbm.getConnectionSync()));
    }

    /**
     * Retrieves a description of the foreign key columns in the given foreign key
     * table that reference the primary key or the columns representing a unique
     * constraint of the parent table (could be the same or a different table).
     *
     * @param {String} parentCatalog - A catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means drop catalog name from the selection criteria
     * @param {String} parentSchema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means drop schema name from the selection criteria
     * @param {String} parentTable - The name of the table that exports the key; must match the table name as it is stored in the database
     * @param {String} foreignCatalog - A catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means drop catalog name from the selection criteria
     * @param {String} foreignSchema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means drop schema name from the selection criteria
     * @param {String} foreignTable - The name of the table that imports the key; must match the table name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a foreign key column description
     */
    getCrossReference(parentCatalog, parentSchema, parentTable, foreignCatalog, foreignSchema, foreignTable) {
        return promiseForMethod(() => {
            if (!(
                (isNil(parentCatalog) || isString(parentCatalog)) &&
                (isNil(parentSchema) || isString(parentSchema)) &&
                (isString(parentTable) && !isEmpty(parentTable)) &&
                (isNil(foreignCatalog) || isString(foreignCatalog)) &&
                (isNil(foreignSchema) || isString(foreignSchema)) &&
                (isString(foreignTable) && !isEmpty(foreignTable))

            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getCrossReferenceSync(parentCatalog, parentSchema, parentTable, foreignCatalog, foreignSchema, foreignTable));
        });
    }

    /**
     * Retrieves the major version number of the underlying database.
     *
     * @returns {Number} Via callback: the underlying database's major version
     */
    getDatabaseMajorVersion() {
        return promiseForMethod(() => this.dbm.getDatabaseMajorVersionSync());
    }

    /**
     * Retrieves the minor version number of the underlying database.
     *
     * @returns {Number} Via callback: the underlying database's minor version
     */
    getDatabaseMinorVersion() {
        return promiseForMethod(() => this.dbm.getDatabaseMinorVersionSync());
    }

    /**
     * Retrieves the name of this database product.
     *
     * @returns {String} Via callback: database product name
     */
    getDatabaseProductName() {
        return promiseForMethod(() => this.dbm.getDatabaseProductNameSync());
    }

    /**
     * Retrieves the version number of this database product.
     *
     * @returns {String} Via callback: database version number
     */
    getDatabaseProductVersion() {
        return promiseForMethod(() => this.dbm.getDatabaseProductVersionSync());
    }

    /**
     * Retrieves this database's default transaction isolation level.
     *
     * @returns {Number} Via callback: the default isolation level
     */
    getDefaultTransactionIsolation() {
        return promiseForMethod(() => this.dbm.getDefaultTransactionIsolationSync());
    }

    /**
     * Retrieves this JDBC driver's major version number.
     *
     * @returns {Number} Via callback: JDBC driver major version
     */
    getDriverMajorVersion() {
        return promiseForMethod(() => this.dbm.getDriverMajorVersionSync());
    }

    /**
     * Retrieves this JDBC driver's minor version number.
     *
     * @returns {Number} Via callback: JDBC driver minor version
     */
    getDriverMinorVersion() {
        return promiseForMethod(() => this.dbm.getDriverMinorVersionSync());
    }

    /**
     * Retrieves the name of this JDBC driver.
     *
     * @returns {String} Via callback: JDBC driver name
     */
    getDriverName() {
        return promiseForMethod(() => this.dbm.getDriverNameSync());
    }

    /**
     * Retrieves the version number of this JDBC driver as a String.
     *
     * @returns {String} Via callback: JDBC driver version
     */
    getDriverVersion() {
        return promiseForMethod(() => this.dbm.getDriverVersionSync());
    }

    /**
     * Retrieves the major JDBC version number for this driver.
     *
     * @returns {Number} Via callback: JDBC version major number
     */
    getJDBCMajorVersion() {
        return promiseForMethod(() => this.dbm.getJDBCMajorVersionSync());
    }

    /**
     * Retrieves the minor JDBC version number for this driver.
     *
     * @returns {Number} Via callback: JDBC version minor number
     */
    getJDBCMinorVersion() {
        return promiseForMethod(() => this.dbm.getJDBCMinorVersionSync());
    }

    /**
     * Retrieves a description of the foreign key columns that reference the given
     * table's primary key columns (the foreign keys exported by a table).
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in this database
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is a foreign key column description
     */
    getExportedKeys(catalog, schema, table) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getExportedKeysSync(catalog, schema, table));
        });
    }

    /**
     * Retrieves all the "extra" characters that can be used in unquoted identifier
     * names (those beyond a-z, A-Z, 0-9 and _).
     *
     * @returns {String} Via callback: the string containing the extra characters
     */
    getExtraNameCharacters() {
        return promiseForMethod(() => this.dbm.getExtraNameCharactersSync());
    }

    /**
     * Retrieves a description of the given catalog's system or user function
     * parameters and return type.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} functionNamePattern - A procedure name pattern; must match the function name as it is stored in the database
     * @param {String} columnNamePattern - A column name pattern; must match the column name as it is stored in the database
     * @returns {ResultSet} Via callback: each row describes a user function parameter, column or return type
     */
    getFunctionColumns(catalog, schemaPattern, functionNamePattern, columnNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(functionNamePattern) || isString(functionNamePattern)) &&
                (isNil(columnNamePattern) || isString(columnNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getFunctionColumnsSync(catalog, schemaPattern, functionNamePattern, columnNamePattern));
        });
    }

    /**
     * Retrieves a description of the system and user functions available in the
     * given catalog.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} functionNamePattern - A procedure name pattern; must match the function name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a function description
     */
    getFunctions(catalog, schemaPattern, functionNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(functionNamePattern) || isString(functionNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getFunctionsSync(catalog, schemaPattern, functionNamePattern));
        });
    }

    /**
     * Retrieves the string used to quote SQL identifiers.
     *
     * @returns {String} Via callback: the quoting string or a space if quoting is not supported
     */
    getIdentifierQuoteString() {
        return promiseForMethod(() => this.dbm.getIdentifierQuoteStringSync());
    }

    /**
     * Retrieves a description of the primary key columns that are referenced by
     * the given table's foreign key columns (the primary keys imported by a
     * table).
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in this database
     * @returns {ResultSet} Via callback: each row is a primary key column description
     */
    getImportedKeys(catalog, schema, table) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getImportedKeysSync(catalog, schema, table));
        });
    }

    /**
     * Retrieves a description of the given table's indices and statistics.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in this database
     * @param {Boolean} unique - When true, return only indices for unique values; when false, return indices regardless of whether unique or not
     * @param {Boolean} approximate - When true, result is allowed to reflect approximate or out of data values; when false, results are requested to be accurate
     * @returns {ResultSet} Via callback: each row is an index column description
     */
    getIndexInfo(catalog, schema, table, unique, approximate) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table)) &&
                isBoolean(unique) &&
                isBoolean(approximate)
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getIndexInfoSync(catalog, schema, table, unique, approximate));
        });
    }

    /**
     * Retrieves the maximum number of hex characters this database allows in an
     * inline binary literal.
     *
     * @returns {Number} Via callback: the maximum length (in hex characters) for a binary literal; a result of zero means that there is no limit or the limit is not known
     */
    getMaxBinaryLiteralLength() {
        return promiseForMethod(() => this.dbm.getMaxBinaryLiteralLengthSync());
    }

    /**
     * Retrieves the maximum number of characters that this database allows in a
     * catalog name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed in a catalog name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxCatalogNameLength() {
        return promiseForMethod(() => this.dbm.getMaxCatalogNameLengthSync());
    }

    /**
     * Retrieves the maximum number of characters this database allows for a
     * character literal.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed for a character literal; a result of zero means that there is no limit or the limit is not known
     */
    getMaxCharLiteralLength() {
        return promiseForMethod(() => this.dbm.getMaxCharLiteralLengthSync());
    }

    /**
     * Retrieves the maximum number of characters this database allows for a column
     * name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed for a column name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnNameLength() {
        return promiseForMethod(() => this.dbm.getMaxColumnNameLengthSync());
    }

    /**
     * Retrieves the maximum number of columns this database allows in a GROUP BY
     * clause.
     *
     * @returns {Number} Via callback: the maximum number of columns allowed; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnsInGroupBy() {
        return promiseForMethod(() => this.dbm.getMaxColumnsInGroupBySync());
    }

    /**
     * Retrieves the maximum number of columns this database allows in an index.
     *
     * @returns {Number} Via callback: the maximum number of columns allowed; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnsInIndex() {
        return promiseForMethod(() => this.dbm.getMaxColumnsInIndexSync());
    }

    /**
     * Retrieves the maximum number of columns this database allows in an ORDER BY
     * clause.
     *
     * @returns {Number} Via callback: the maximum number of columns allowed; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnsInOrderBy() {
        return promiseForMethod(() => this.dbm.getMaxColumnsInOrderBySync());
    }

    /**
     * Retrieves the maximum number of columns this database allows in a SELECT
     * list.
     *
     * @returns {Number} Via callback: the maximum number of columns allowed; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnsInSelect() {
        return promiseForMethod(() => this.dbm.getMaxColumnsInSelectSync());
    }

    /**
     * Retrieves the maximum number of columns this database allows in a table.
     *
     * @returns {Number} Via callback: the maximum number of columns allowed; a result of zero means that there is no limit or the limit is not known
     */
    getMaxColumnsInTable() {
        return promiseForMethod(() => this.dbm.getMaxColumnsInTableSync());
    }

    /**
     * Retrieves the maximum number of concurrent connections to this database that
     * are possible.
     *
     * @returns {Number} Via callback: the maximum number of active connections possible at one time; a result of zero means that there is no limit or the limit is not known
     */
    getMaxConnections() {
        return promiseForMethod(() => this.dbm.getMaxConnectionsSync());
    }

    /**
     * Retrieves the maximum number of characters that this database allows in a
     * cursor name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed in a cursor name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxCursorNameLength() {
        return promiseForMethod(() => this.dbm.getMaxCursorNameLengthSync());
    }

    /**
     * Retrieves the maximum number of bytes this database allows for an index,
     * including all of the parts of the index.
     *
     * @returns {Number} Via callback: the maximum number of bytes allowed; this limit includes the composite of all the constituent parts of the index; a result of zero means that there is no limit or the limit is not known
     */
    getMaxIndexLength() {
        return promiseForMethod(() => this.dbm.getMaxIndexLengthSync());
    }

    /**
     * Retrieves the maximum number of characters that this database allows in a
     * procedure name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed in a procedure name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxProcedureNameLength() {
        return promiseForMethod(() => this.dbm.getMaxProcedureNameLengthSync());
    }

    /**
     * Retrieves the maximum number of bytes this database allows in a single row.
     *
     * @returns {Number} Via callback: the maximum number of bytes allowed for a row; a result of zero means that there is no limit or the limit is not known
     */
    getMaxRowSize() {
        return promiseForMethod(() => this.dbm.getMaxRowSizeSync());
    }

    /**
     * Retrieves the maximum number of characters that this database allows in a
     * schema name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed in a schema name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxSchemaNameLength() {
        return promiseForMethod(() => this.dbm.getMaxSchemaNameLengthSync());
    }

    /**
     * Retrieves the maximum number of characters this database allows in an SQL
     * statement.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed for an SQL statement; a result of zero means that there is no limit or the limit is not known
     */
    getMaxStatementLength() {
        return promiseForMethod(() => this.dbm.getMaxStatementLengthSync());
    }

    /**
     * Retrieves the maximum number of active statements to this database that can
     * be open at the same time.
     *
     * @returns {Number} Via callback: the maximum number of statements that can be open at one time; a result of zero means that there is no limit or the limit is not known
     */
    getMaxStatements() {
        return promiseForMethod(() => this.dbm.getMaxStatementsSync());
    }

    /**
     * Retrieves the maximum number of characters this database allows in a table
     * name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed for a table name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxTableNameLength() {
        return promiseForMethod(() => this.dbm.getMaxTableNameLengthSync());
    }

    /**
     * Retrieves the maximum number of tables this database allows in a SELECT
     * statement.
     *
     * @returns {Number} Via callback: the maximum number of tables allowed in a SELECT statement; a result of zero means that there is no limit or the limit is not known
     */
    getMaxTablesInSelect() {
        return promiseForMethod(() => this.dbm.getMaxTablesInSelectSync());
    }

    /**
     * Retrieves the maximum number of characters this database allows in a user
     * name.
     *
     * @returns {Number} Via callback: the maximum number of characters allowed for a user name; a result of zero means that there is no limit or the limit is not known
     */
    getMaxUserNameLength() {
        return promiseForMethod(() => this.dbm.getMaxUserNameLengthSync());
    }

    /**
     * Retrieves a comma-separated list of math functions available with this
     * database.
     *
     * @returns {String} Via callback: the list of math functions supported by this database
     */
    getNumericFunctions() {
        return promiseForMethod(() => this.dbm.getNumericFunctionsSync());
    }

    /**
     * Retrieves a description of the given table's primary key columns.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in this database
     * @returns {ResultSet} Via callback: each row is a primary key column description
     */
    getPrimaryKeys(catalog, schema, table) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getPrimaryKeysSync(catalog, schema, table));
        });
    }

    /**
     * Retrieves a description of the given catalog's stored procedure parameter
     * and result columns.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} procedureNamePattern - A procedure name pattern; must match the procedure name as it is stored in the database
     * @param {String} columnNamePattern - A column name pattern; must match the column name as it is stored in the database
     * @returns {ResultSet} Via callback: each row describes a stored procedure parameter or column
     */
    getProcedureColumns(catalog, schemaPattern, procedureNamePattern, columnNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(procedureNamePattern) || isString(procedureNamePattern)) &&
                (isNil(columnNamePattern) || isString(columnNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.procedureColumnsSync(catalog, schemaPattern, procedureNamePattern, columnNamePattern));
        });
    }

    /**
     * Retrieves a description of the stored procedures available in the given
     * catalog.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} procedureNamePattern - A procedure name pattern; must match the procedure name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a procedure description
     */
    getProcedures(catalog, schemaPattern, procedureNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(procedureNamePattern) || isString(procedureNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getProceduresSync(catalog, schemaPattern, procedureNamePattern));
        });
    }

    /**
     * Retrieves the database vendor's preferred term for "procedure".
     *
     * @returns {String} Via callback: the vendor term for "procedure"
     */
    getProcedureTerm() {
        return promiseForMethod(() => this.dbm.getProcedureTermSync());
    }

    /**
     * Retrieves a description of the pseudo or hidden columns available in a given
     * table within the specified catalog and schema.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} tableNamePattern - A table name pattern; must match the table name as it is stored in the database
     * @param {String} columnNamePattern - A column name pattern; must match the column name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a column description
     */
    getPseudoColumns(catalog, schemaPattern, tableNamePattern, columnNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(tableNamePattern) || isString(tableNamePattern)) &&
                (isNil(columnNamePattern) || isString(columnNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getPseudoColumnsSync(catalog, schemaPattern, tableNamePattern, columnNamePattern));
        });
    }

    /**
     * Retrieves this database's default holdability for ResultSet objects.
     *
     * @returns {Number} Via callback: the default holdability; either ResultSet.HOLD_CURSORS_OVER_COMMIT or ResultSet.CLOSE_CURSORS_AT_COMMIT
     */
    getResultSetHoldability() {
        return promiseForMethod(() => this.dbm.getResultSetHoldabilitySync());
    }

    /**
     * Indicates whether or not this data source supports the SQL ROWID type, and
     * if so the lifetime for which a RowId object remains valid.
     *
     * NOTE: This method should be used with caution for now. The RowIdLifetime object
     * returned is a Java object and is not wrapped by the node-jdbc library.
     *
     * @returns {RowIdLifetime} Via callback: the status indicating the lifetime of a RowId
     */
    getRowIdLifetime() {
        return promiseForMethod(() => this.dbm.getRowIdLifetimeSync());
    }

    /**
     * Retrieves the database vendor's preferred term for "schema".
     *
     * @returns {String} Via callback: the vendor term for "schema"
     */
    getSchemaTerm() {
        return promiseForMethod(() => this.dbm.getSchemaTermSync());
    }

    /**
     * Retrieves the string that can be used to escape wildcard characters.
     *
     * @returns {String} Via callback: the string used to escape wildcard characters
     */
    getSearchStringEscape() {
        return promiseForMethod(() => this.dbm.getSearchStringEscapeSync());
    }

    /**
     * Retrieves a comma-separated list of all of this database's SQL keywords that
     * are NOT also SQL:2003 keywords.
     *
     * @returns {String} Via callback: the list of this database's keywords that are not also SQL:2003 keywords
     */
    getSQLKeywords() {
        return promiseForMethod(() => this.dbm.getSQLKeywordsSync());
    }

    /**
     * Indicates whether the SQLSTATE returned by SQLException.getSQLState is
     * X/Open (now known as Open Group) SQL CLI or SQL:2003.
     *
     * @returns {Number} Via callback: the type of SQLSTATE; one of: sqlStateXOpen or sqlStateSQL
     */
    getSQLStateType() {
        return promiseForMethod(() => this.dbm.getSQLStateTypeSync());
    }

    /**
     * Retrieves a comma-separated list of string functions available with this
     * database.
     *
     * @returns {String} Via callback: the list of string functions supported by this database
     */
    getStringFunctions() {
        return promiseForMethod(() => this.dbm.getStringFunctionsSync());
    }

    /**
     * Retrieves a description of the table hierarchies defined in a particular
     * schema in this database.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} tableNamePattern - A table name pattern; must match the table name as it is stored in the database
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is a type description
     */
    getSuperTables(catalog, schemaPattern, tableNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(tableNamePattern) || isString(tableNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getSuperTablesSync(catalog, schemaPattern, tableNamePattern));
        });
    }

    /**
     * Retrieves a description of the user-defined type (UDT) hierarchies defined
     * in a particular schema in this database.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} typeNamePattern - A UDT name pattern; may be a fully-qualified name
     * @returns {ResultSet} Via callback: a ResultSet object in which a row gives information about the designated UDT
     */
    getSuperTypes(catalog, schemaPattern, typeNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(typeNamePattern) || isString(typeNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getSuperTypesSync(catalog, schemaPattern, typeNamePattern));
        });
    }

    /**
     * Retrieves a comma-separated list of system functions available with this
     * database.
     *
     * @returns {String} Via callback: a list of system functions supported by this database
     */
    getSystemFunctions() {
        return promiseForMethod(() => this.dbm.getSystemFunctionsSync());
    }

    /**
     * Retrieves a description of the access rights for each table available in a
     * catalog.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} tableNamePattern - A table name pattern; must match the table name as it is stored in the database
     * @returns {ResultSet} Via callback: each row is a table privilege description
     */
    getTablePrivileges(catalog, schemaPattern, tableNamePattern) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(tableNamePattern) || isString(tableNamePattern))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getTablePrivilegesSync(catalog, schemaPattern, tableNamePattern));
        });
    }

    /**
     * Retrieves the table types available in this database.
     *
     * @returns {ResultSet} Via callback: a ResultSet object in which each row has a single String column that is a table type
     */
    getTableTypes() {
        return promiseForMethod(() => this.dbm.getTableTypesSync());
    }

    /**
     * Retrieves a comma-separated list of the time and date functions available
     * with this database.
     *
     * @returns {String} Via callback: the list of time and date functions supported by this database
     */
    getTimeDateFunctions() {
        return promiseForMethod(() => this.dbm.getTimeDateFunctionsSync());
    }

    /**
     * Retrieves a description of all the data types supported by this database.
     *
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is an SQL type description
     */
    getTypeInfo() {
        return promiseForMethod(() => new ResultSet(this.dbm.getTypeInfoSync()));
    }

    /**
     * Retrieves a description of the user-defined types (UDTs) defined in a
     * particular schema.
     *
     * @param {String} catalog - A  catalog name; must match the catalog name as it is stored in the database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schemaPattern - A schema name pattern; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} typeNamePattern - A UDT name pattern; may be a fully-qualified name
     * @param {Number[]} types - A list of user-defined types (JAVA_OBJECT, STRUCT, or DISTINCT) to include; null returns all types
     * @returns {ResultSet} Via callback: ResultSet object in which each row describes a UDT
     */
    getUDTs(catalog, schemaPattern, typeNamePattern, types) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schemaPattern) || isString(schemaPattern)) &&
                (isNil(typeNamePattern) || isString(typeNamePattern)) &&
                (isArray(types) || types.every(isInteger))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getUDTsSync(catalog, schemaPattern, typeNamePattern, types));
        });
    }

    /**
     * Retrieves the URL for this DBMS.
     *
     * @returns {String} Via callback: the URL for this DBMS or null if it cannot be generated
     */
    getURL() {
        return promiseForMethod(() => this.dbm.getURLSync());
    }

    /**
     * Retrieves the user name as known to this database.
     *
     * @returns {String} Via callback: Retrieves the user name as known to this database
     */
    getUserName() {
        return promiseForMethod(() => this.dbm.getUserNameSync());
    }

    /**
     * Retrieves a description of a table's columns that are automatically updated
     * when any value in a row is updated.
     *
     * @param {String} catalog - A catalog name; must match the catalog name as it is stored in this database; "" retrieves those without a catalog; null means that the catalog name should not be used to narrow the search
     * @param {String} schema - A schema name; must match the schema name as it is stored in the database; "" retrieves those without a schema; null means that the schema name should not be used to narrow the search
     * @param {String} table - A table name; must match the table name as it is stored in this database
     * @returns {ResultSet} Via callback: a ResultSet object in which each row is a column description
     */
    getVersionColumns(catalog, schema, table) {
        return promiseForMethod(() => {
            if (!(
                (isNil(catalog) || isString(catalog)) &&
                (isNil(schema) || isString(schema)) &&
                (isString(table) && !isEmpty(table))
            )) {
                throw new Error('INVALID ARGUMENTS');
            }

            return new ResultSet(this.dbm.getVersionColumnsSync(catalog, schema, table));
        });
    }

    /**
     * Retrieves whether or not a visible row insert can be detected by calling the
     * method ResultSet.rowInserted.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if changes are detected by the specified result set type; false otherwise
     */
    insertsAreDetected(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.insertsAreDetectedSync(type);
        });
    }

    /**
     * Retrieves whether a catalog appears at the start of a fully qualified table
     * name.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    isCatalogAtStart() {
        return promiseForMethod(() => this.dbm.isCatalogAtStartSync());
    }

    /**
     * Retrieves whether this database is in read-only mode.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    isReadOnly() {
        return promiseForMethod(() => this.dbm.isReadOnlySync());
    }

    /**
     * Indicates whether updates made to a LOB are made on a copy or directly to
     * the LOB.
     *
     * @returns {Boolean} Via callback: true if updates are made to a copy of the LOB; false if updates are made directly to the LOB
     */
    locatorsUpdateCopy() {
        return promiseForMethod(() => this.dbm.locatorsUpdateCopySync());
    }

    /**
     * Retrieves whether this database supports concatenations between NULL and
     * non-NULL values being NULL.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    nullPlusNonNullIsNull() {
        return promiseForMethod(() => this.dbm.nullPlusNonNullIsNullSync());
    }

    /**
     * Retrieves whether NULL values are sorted at the end regardless of sort
     * order.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    nullsAreSortedAtEnd() {
        return promiseForMethod(() => this.dbm.nullsAreSortedAtEndSync());
    }

    /**
     * Retrieves whether NULL values are sorted at the start regardless of sort
     * order.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    nullsAreSortedAtStart() {
        return promiseForMethod(() => this.dbm.nullsAreSortedAtStartSync());
    }

    /**
     * Retrieves whether NULL values are sorted high.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    nullsAreSortedHigh() {
        return promiseForMethod(() => this.dbm.nullsAreSortedHighSync());
    }

    /**
     * Retrieves whether NULL values are sorted low.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    nullsAreSortedLow() {
        return promiseForMethod(() => this.dbm.nullsAreSortedLowSync());
    }

    /**
     * Retrieves whether deletes made by others are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if deletes made by others are visible for the given result set type; false otherwise
     */
    othersDeletesAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.othersDeletesAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether inserts made by others are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if inserts made by others are visible for the given result set type; false otherwise
     */
    othersInsertsAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.othersInsertsAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether updates made by others are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if updates made by others are visible for the given result set type; false otherwise
     */
    othersUpdatesAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.othersUpdatesAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether a result set's own deletes are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if deletes are visible for the given result set type; false otherwise
     */
    ownDeletesAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.ownDeletesAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether a result set's own inserts are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if inserts are visible for the given result set type; false otherwise
     */
    ownInsertsAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.ownInsertsAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether for the given type of ResultSet object, the result set's
     * own updates are visible.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if updates are visible for the given result set type; false otherwise
     */
    ownUpdatesAreVisible(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.ownUpdatesAreVisibleSync(type);
        });
    }

    /**
     * Retrieves whether this database treats mixed case unquoted SQL identifiers
     * as case insensitive and stores them in lower case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesLowerCaseIdentifiers() {
        return promiseForMethod(() => this.dbm.storesLowerCaseIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case quoted SQL identifiers as
     * case insensitive and stores them in lower case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesLowerCaseQuotedIdentifiers() {
        return promiseForMethod(() => this.dbm.storesLowerCaseQuotedIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case unquoted SQL identifiers
     * as case insensitive and stores them in mixed case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesMixedCaseIdentifiers() {
        return promiseForMethod(() => this.dbm.storesMixedCaseIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case quoted SQL identifiers as
     * case insensitive and stores them in mixed case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesMixedCaseQuotedIdentifiers() {
        return promiseForMethod(() => this.dbm.storesMixedCaseQuotedIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case unquoted SQL identifiers
     * as case insensitive and stores them in upper case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesUpperCaseIdentifiers() {
        return promiseForMethod(() => this.dbm.storesUpperCaseIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case quoted SQL identifiers as
     * case insensitive and stores them in upper case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    storesUpperCaseQuotedIdentifiers() {
        return promiseForMethod(() => this.dbm.storesUpperCaseQuotedIdentifiersSync());
    }

    /**
     * Retrieves whether this database supports ALTER TABLE with add column.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsAlterTableWithAddColumn() {
        return promiseForMethod(() => this.dbm.supportsAlterTableWithAddColumnSync());
    }

    /**
     * Retrieves whether this database supports ALTER TABLE with drop column.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsAlterTableWithDropColumn() {
        return promiseForMethod(() => this.dbm.supportsAlterTableWithDropColumnSync());
    }

    /**
     * Retrieves whether this database supports the ANSI92 entry level SQL grammar.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsANSI92EntryLevelSQL() {
        return promiseForMethod(() => this.dbm.supportsANSI92EntryLevelSQLSync());
    }

    /**
     * Retrieves whether this database supports the ANSI92 full SQL grammar
     * supported.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsANSI92FullSQL() {
        return promiseForMethod(() => this.dbm.supportsANSI92FullSQLSync());
    }

    /**
     * Retrieves whether this database supports the ANSI92 intermediate SQL grammar
     * supported.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsANSI92IntermediateSQL() {
        return promiseForMethod(() => this.dbm.supportsANSI92IntermediateSQLSync());
    }

    /**
     * Retrieves whether this database supports batch updates.
     *
     * @returns {Boolean} Via callback: true if this database supports batch updates; false otherwise
     */
    supportsBatchUpdates() {
        return promiseForMethod(() => this.dbm.supportsBatchUpdatesSync());
    }

    /**
     * Retrieves whether a catalog name can be used in a data manipulation
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCatalogsInDataManipulation() {
        return promiseForMethod(() => this.dbm.supportsCatalogsInDataManipulationSync());
    }

    /**
     * Retrieves whether a catalog name can be used in an index definition
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCatalogsInIndexDefinitions() {
        return promiseForMethod(() => this.dbm.supportsCatalogsInIndexDefinitionsSync());
    }

    /**
     * Retrieves whether a catalog name can be used in a privilege definition
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCatalogsInPrivilegeDefinitions() {
        return promiseForMethod(() => this.dbm.supportsCatalogsInPrivilegeDefinitionsSync());
    }

    /**
     * Retrieves whether a catalog name can be used in a procedure call statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCatalogsInProcedureCalls() {
        return promiseForMethod(() => this.dbm.supportsCatalogsInProcedureCallsSync());
    }

    /**
     * Retrieves whether a catalog name can be used in a table definition
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCatalogsInTableDefinitions() {
        return promiseForMethod(() => this.dbm.supportsCatalogsInTableDefinitionsSync());
    }

    /**
     * Retrieves whether this database supports column aliasing.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsColumnAliasing() {
        return promiseForMethod(() => this.dbm.supportsColumnAliasingSync());
    }

    /**
     * Retrieves whether this database supports the JDBC scalar function CONVERT
     * for the conversion of one JDBC type to another, or between the JDBC types
     * fromType and toType if both are given.
     *
     * @param {Number} [fromType] - The type to convert from; one of the type codes from the class java.sql.Types
     * @param {Number} [toType] - The type to convert to; one of the type codes from the class java.sql.Types
     * @returns {Boolean}  Via callback: true if so; false otherwise
     */
    supportsConvert(fromType, toType) {
        return promiseForMethod(() => {
            if (!isInteger(fromType) || !isInteger(toType)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.supportsConvertSync(type);
        });
    }

    /**
     * Retrieves whether this database supports the ODBC Core SQL grammar.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCoreSQLGrammar() {
        return promiseForMethod(() => this.dbm.supportsCoreSQLGrammarSync());
    }

    /**
     * Retrieves whether this database supports correlated subqueries.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsCorrelatedSubqueries() {
        return promiseForMethod(() => this.dbm.supportsCorrelatedSubqueriesSync());
    }

    /**
     * Retrieves whether this database supports both data definition and data
     * manipulation statements within a transaction.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsDataDefinitionAndDataManipulationTransactions() {
        return promiseForMethod(() =>
            this.dbm.supportsDataDefinitionAndDataManipulationTransactionsSync());
    }

    /**
     * Retrieves whether this database supports only data manipulation statements
     * within a transaction.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsDataManipulationTransactionsOnly() {
        return promiseForMethod(() => this.dbm.supportsDataManipulationTransactionsOnlySync());
    }

    /**
     * Retrieves whether, when table correlation names are supported, they are
     * restricted to being different from the names of the tables.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsDifferentTableCorrelationNames() {
        return promiseForMethod(() => this.dbm.supportsDifferentTableCorrelationNamesSync());
    }

    /**
     * Retrieves whether this database supports expressions in ORDER BY lists.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsExpressionsInOrderBy() {
        return promiseForMethod(() => this.dbm.supportsExpressionsInOrderBySync());
    }

    /**
     * Retrieves whether this database supports the ODBC Extended SQL grammar.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsExtendedSQLGrammar() {
        return promiseForMethod(() => this.dbm.supportsExtendedSQLGrammarSync());
    }

    /**
     * Retrieves whether this database supports full nested outer joins.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsFullOuterJoins() {
        return promiseForMethod(() => this.dbm.supportsFullOuterJoinsSync());
    }

    /**
     * Retrieves whether auto-generated keys can be retrieved after a statement has
     * been executed
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsGetGeneratedKeys() {
        return promiseForMethod(() => this.dbm.supportsGetGeneratedKeysSync());
    }

    /**
     * Retrieves whether this database supports some form of GROUP BY clause.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsGroupBy() {
        return promiseForMethod(() => this.dbm.supportsGroupBySync());
    }

    /**
     * Retrieves whether this database supports using columns not included in the
     * SELECT statement in a GROUP BY clause provided that all of the columns in
     * the SELECT statement are included in the GROUP BY clause.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsGroupByBeyondSelect() {
        return promiseForMethod(() => this.dbm.supportsGroupByBeyondSelectSync());
    }

    /**
     * Retrieves whether this database supports using a column that is not in the
     * SELECT statement in a GROUP BY clause.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsGroupByUnrelated() {
        return promiseForMethod(() => this.dbm.supportsGroupByUnrelatedSync());
    }

    /**
     * Retrieves whether this database supports the SQL Integrity Enhancement
     * Facility.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsIntegrityEnhancementFacility() {
        return promiseForMethod(() => this.dbm.supportsIntegrityEnhancementFacilitySync());
    }

    /**
     * Retrieves whether this database supports specifying a LIKE escape clause.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsLikeEscapeClause() {
        return promiseForMethod(() => this.dbm.supportsLikeEscapeClauseSync());
    }

    /**
     * Retrieves whether this database provides limited support for outer joins.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsLimitedOuterJoins() {
        return promiseForMethod(() => this.dbm.supportsLimitedOuterJoinsSync());
    }

    /**
     * Retrieves whether this database supports the ODBC Minimum SQL grammar.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMinimumSQLGrammar() {
        return promiseForMethod(() => this.dbm.supportsMinimumSQLGrammarSync());
    }

    /**
     * Retrieves whether this database treats mixed case unquoted SQL identifiers
     * as case sensitive and as a result stores them in mixed case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMixedCaseIdentifiers() {
        return promiseForMethod(() => this.dbm.supportsMixedCaseIdentifiersSync());
    }

    /**
     * Retrieves whether this database treats mixed case quoted SQL identifiers as
     * case sensitive and as a result stores them in mixed case.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMixedCaseQuotedIdentifiers() {
        return promiseForMethod(() => this.dbm.supportsMixedCaseQuotedIdentifiersSync());
    }

    /**
     * Retrieves whether it is possible to have multiple ResultSet objects returned
     * from a CallableStatement object simultaneously.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMultipleOpenResults() {
        return promiseForMethod(() => this.dbm.supportsMultipleOpenResultsSync());
    }

    /**
     * Retrieves whether this database supports getting multiple ResultSet objects
     * from a single call to the method execute.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMultipleResultSets() {
        return promiseForMethod(() => this.dbm.supportsMultipleResultSetsSync());
    }

    /**
     * Retrieves whether this database allows having multiple transactions open at
     * once (on different connections).
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsMultipleTransactions() {
        return promiseForMethod(() => this.dbm.supportsMultipleTransactionsSync());
    }

    /**
     * Retrieves whether this database supports named parameters to callable
     * statements.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsNamedParameters() {
        return promiseForMethod(() => this.dbm.supportsNamedParametersSync());
    }

    /**
     * Retrieves whether columns in this database may be defined as non-nullable.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsNonNullableColumns() {
        return promiseForMethod(() => this.dbm.supportsNonNullableColumnsSync());
    }

    /**
     * Retrieves whether this database supports keeping cursors open across
     * commits.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOpenCursorsAcrossCommit() {
        return promiseForMethod(() => this.dbm.supportsOpenCursorsAcrossCommitSync());
    }

    /**
     * Retrieves whether this database supports keeping cursors open across
     * rollbacks.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOpenCursorsAcrossRollback() {
        return promiseForMethod(() => this.dbm.supportsOpenCursorsAcrossRollbackSync());
    }

    /**
     * Retrieves whether this database supports keeping statements open across
     * commits.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOpenStatementsAcrossCommit() {
        return promiseForMethod(() => this.dbm.supportsOpenStatementsAcrossCommitSync());
    }

    /**
     * Retrieves whether this database supports keeping statements open across
     * rollbacks.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOpenStatementsAcrossRollback() {
        return promiseForMethod(() => this.dbm.supportsOpenStatementsAcrossRollbackSync());
    }

    /**
     * Retrieves whether this database supports using a column that is not in the
     * SELECT statement in an ORDER BY clause.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOrderByUnrelated() {
        return promiseForMethod(() => this.dbm.supportsOrderByUnrelatedSync());
    }

    /**
     * Retrieves whether this database supports some form of outer join.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsOuterJoins() {
        return promiseForMethod(() => this.dbm.supportsOuterJoinsSync());
    }

    /**
     * Retrieves whether this database supports positioned DELETE statements.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsPositionedDelete() {
        return promiseForMethod(() => this.dbm.supportsPositionedDeleteSync());
    }

    /**
     * Retrieves whether this database supports positioned UPDATE statements.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsPositionedUpdate() {
        return promiseForMethod(() => this.dbm.supportsPositionedUpdateSync());
    }

    /**
     * Retrieves whether this database supports the given concurrency type in
     * combination with the given result set type.
     *
     * @param {Number} type - Defined in java.sql.ResultSet
     * @param {Number} concurrency - Type defined in java.sql.ResultSet
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsResultSetConcurrency(type, concurrency) {
        return promiseForMethod(() => {
            if (!isInteger(type) || !isInteger(concurrency)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.supportsPositionedUpdateSync(type, concurrency);
        });
    }

    /**
     * Retrieves whether this database supports the given result set holdability.
     *
     * @param {Number} holdability - one of the following constants: ResultSet.HOLD_CURSORS_OVER_COMMIT or ResultSet.CLOSE_CURSORS_AT_COMMIT
     * @returns {Boolean} Via callback: true if so, false otherwise
     */
    supportsResultSetHoldability(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.supportsResultSetHoldabilitySync(type);
        });
    }

    /**
     * Retrieves whether this database supports the given result set type.
     *
     * @param {Number} type - defined in java.sql.ResultSet
     * @returns {Boolean} Via callback: true if so, false otherwise
     */
    supportsResultSetType(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.supportsResultSetTypeSync(type);
        });
    }

    /**
     * Retrieves whether this database supports savepoints.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSavepoints() {
        return promiseForMethod(() => this.dbm.supportsSavepointsSync());
    }

    /**
     * Retrieves whether a schema name can be used in a data manipulation
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSchemasInDataManipulation() {
        return promiseForMethod(() => this.dbm.supportsSchemasInDataManipulationSync());
    }

    /**
     * Retrieves whether a schema name can be used in an index definition
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSchemasInIndexDefinitions() {
        return promiseForMethod(() => this.dbm.supportsSchemasInIndexDefinitionsSync());
    }

    /**
     * Retrieves whether a schema name can be used in a privilege definition
     * statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSchemasInPrivilegeDefinitions() {
        return promiseForMethod(() => this.dbm.supportsSchemasInPrivilegeDefinitionsSync());
    }

    /**
     * Retrieves whether a schema name can be used in a procedure call statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSchemasInProcedureCalls() {
        return promiseForMethod(() => this.dbm.supportsSchemasInProcedureCallsSync());
    }

    /**
     * Retrieves whether a schema name can be used in a table definition statement.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSchemasInTableDefinitions() {
        return promiseForMethod(() => this.dbm.supportsSchemasInTableDefinitionsSync());
    }

    /**
     * Retrieves whether this database supports SELECT FOR UPDATE statements.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSelectForUpdate() {
        return promiseForMethod(() => this.dbm.supportsSelectForUpdateSync());
    }

    /**
     * Retrieves whether this database supports statement pooling.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsStatementPooling() {
        return promiseForMethod(() => this.dbm.supportsStatementPoolingSync());
    }

    /**
     * Retrieves whether this database supports invoking user-defined or vendor
     * functions using the stored procedure escape syntax.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsStoredFunctionsUsingCallSyntax() {
        return promiseForMethod(() => this.dbm.supportsStoredFunctionsUsingCallSyntaxSync());
    }

    /**
     * Retrieves whether this database supports stored procedure calls that use the
     * stored procedure escape syntax.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsStoredProcedures() {
        return promiseForMethod(() => this.dbm.supportsStoredProceduresSync());
    }

    /**
     * Retrieves whether this database supports subqueries in comparison
     * expressions.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSubqueriesInComparisons() {
        return promiseForMethod(() => this.dbm.supportsSubqueriesInComparisonsSync());
    }

    /**
     * Retrieves whether this database supports subqueries in EXISTS expressions.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSubqueriesInExists() {
        return promiseForMethod(() => this.dbm.supportsSubqueriesInExistsSync());
    }

    /**
     * Retrieves whether this database supports subqueries in IN expressions.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSubqueriesInIns() {
        return promiseForMethod(() => this.dbm.supportsSubqueriesInInsSync());
    }

    /**
     * Retrieves whether this database supports subqueries in quantified
     * expressions.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsSubqueriesInQuantifieds() {
        return promiseForMethod(() => this.dbm.supportsSubqueriesInQuantifiedsSync());
    }

    /**
     * Retrieves whether this database supports table correlation names.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsTableCorrelationNames() {
        return promiseForMethod(() => this.dbm.supportsTableCorrelationNamesSync());
    }

    /**
     * Retrieves whether this database supports the given transaction isolation
     * level.
     *
     * @param {Number} level - one of the transaction isolation levels defined in java.sql.Connection
     * @returns {Boolean} Via callback: true if so, false otherwise
     */
    supportsTransactionIsolationLevel(level) {
        return promiseForMethod(() => {
            if (!isInteger(level)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.supportsTransactionIsolationLevelSync(level);
        });
    }

    /**
     * Retrieves whether this database supports transactions.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsTransactions() {
        return promiseForMethod(() => this.dbm.supportsTransactionsSync());
    }

    /**
     * Retrieves whether this database supports SQL UNION.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsUnion() {
        return promiseForMethod(() => this.dbm.supportsUnionSync());
    }

    /**
     * Retrieves whether this database supports SQL UNION ALL.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    supportsUnionAll() {
        return promiseForMethod(() => this.dbm.supportsUnionAllSync());
    }

    /**
     * Retrieves whether or not a visible row update can be detected by calling the
     * method ResultSet.rowUpdated.
     *
     * @param {Number} type - the ResultSet type; one of ResultSet.TYPE_FORWARD_ONLY, ResultSet.TYPE_SCROLL_INSENSITIVE, or ResultSet.TYPE_SCROLL_SENSITIVE
     * @returns {Boolean} Via callback: true if changes are detected by the result set type; false otherwise
     */
    updatesAreDetected(type) {
        return promiseForMethod(() => {
            if (!isInteger(type)) throw new Error('INVALID ARGUMENTS');

            return this.dbm.updatesAreDetectedSync(type);
        });
    }

    /**
     * Retrieves whether this database uses a file for each table.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    usesLocalFilePerTable() {
        return promiseForMethod(() => this.dbm.usesLocalFilePerTableSync());
    }

    /**
     * Retrieves whether this database stores tables in a local file.
     *
     * @returns {Boolean} Via callback: true if so; false otherwise
     */
    usesLocalFiles() {
        return promiseForMethod(() => this.dbm.usesLocalFilesSync());
    }
}

jinst.events.once('initialized', function onInitialized() {
  // See https://docs.oracle.com/javase/7/docs/api/java/sql/DatabaseMetaData.html
  // for full documentation for static attributes
  const staticAttrs = [
    'attributeNoNulls', 'attributeNullable', 'attributeNullableUnknown',
    'bestRowNotPseudo', 'bestRowPseudo', 'bestRowSession', 'bestRowTemporary',
    'bestRowTransaction', 'bestRowUnknown', 'columnNoNulls', 'columnNullable',
    'columnNullableUnknown', 'functionColumnIn', 'functionColumnInOut',
    'functionColumnOut', 'functionColumnResult', 'functionColumnUnknown',
    'functionNoNulls', 'functionNoTable', 'functionNullable',
    'functionNullableUnknown', 'functionResultUnknown', 'functionReturn',
    'functionReturnsTable', 'importedKeyCascade',
    'importedKeyInitiallyDeferred', 'importedKeyInitiallyImmediate',
    'importedKeyNoAction', 'importedKeyNotDeferrable', 'importedKeyRestrict',
    'importedKeySetDefault', 'importedKeySetNull', 'procedureColumnIn',
    'procedureColumnInOut', 'procedureColumnOut', 'procedureColumnResult',
    'procedureColumnReturn', 'procedureColumnUnknown', 'procedureNoNulls',
    'procedureNoResult', 'procedureNullable', 'procedureNullableUnknown',
    'procedureResultUnknown', 'procedureReturnsResult', 'sqlStateSQL',
    'sqlStateSQL99', 'sqlStateXOpen', 'tableIndexClustered',
    'tableIndexHashed', 'tableIndexOther', 'tableIndexStatistic', 'typeNoNulls',
    'typeNullable', 'typeNullableUnknown', 'typePredBasic', 'typePredChar',
    'typePredNone', 'typeSearchable', 'versionColumnNotPseudo',
    'versionColumnPseudo', 'versionColumnUnknown',
  ];

  staticAttrs.forEach(function(attr) {
    DatabaseMetaData[attr] = java.getStaticFieldValue('java.sql.DatabaseMetaData', attr);
  });
});

module.exports = DatabaseMetaData;
