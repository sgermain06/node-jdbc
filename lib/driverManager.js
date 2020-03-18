const {
    isString,
    isObject
} = require('lodash');
const jinst = require("./jinst.js");
const java = jinst.getInstance();

const { promiseForMethod } = require('./utils');

const DriverManagerClass = 'java.sql.DriverManager';

module.exports = {
  getConnection: function(url, propsOrUser, password) {
      // Check arguments for validity, and return error if invalid
    const validArgs = url && (
      // propsOrUser and password can both be falsy
      !(propsOrUser || password) ||
      // propsOrUser and password can both be strings
      (isString(propsOrUser) && isString(password)) ||
      // propsOrUser can be an object if password is falsy
      (isObject(propsOrUser) && !password)
    );

    if (!validArgs) {
      return new Error("INVALID ARGUMENTS");
    }

    // Forward modified arguments to java.callStaticMethod
    return java.callStaticMethodSync.apply(java, [DriverManagerClass, 'getConnection', ...arguments]);
  },
  getLoginTimeout: async () => promiseForMethod(() => java.callStaticMethodSync(DriverManagerClass, 'getLoginTimeout')),
  registerDriver: async driver => promiseForMethod(() => { java.callStaticMethodSync(DriverManagerClass, 'registerDriver', driver); }),
  setLoginTimeout: async seconds => promiseForMethod(() => {
      java.callStaticMethodSync(DriverManagerClass, 'setLoginTimeout', seconds);
      return true;
  }),
};
