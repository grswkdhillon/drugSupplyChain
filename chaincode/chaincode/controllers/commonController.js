const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const Crypto = require('crypto');


let commonController = class {


  async checkEmailExistence(stub, args, thisClass) {
    let email = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!recordsAsBytes || JSON.parse(recordsAsBytes).length == 0) {
      return Buffer.from('{"success":"false"}');
    }
    else {
      return Buffer.from(`{"success":"true"}`);
    }
  }

  async fetchRecordWithEmail(stub, args, thisClass) {
    let email = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      return Buffer.from('{"success":"false"}');
    }
    else {

      return recordAsBytes;
    }
  }


  async fetchRecordWithSpecificKeyAndValue(stub, args, thisClass) {
    let key = args[0];
    let value = args[1];

    let queryString = {};
    queryString.selector = {};
    queryString.selector[key] = value;
    console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      return Buffer.from('{"success":"false"}');
    }
    else {
      return recordAsBytes;
    }
  }

  async checkRecordExistenceWithEmailAndPassword(stub, args, thisClass) {
    let email = args[0];
    let password = args[1];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    queryString.selector.password = password;
    queryString.fields = ["email", "password", "role"];
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    console.log("lenthhhhhhhhhhhhhhh ", JSON.parse(recordAsBytes).length);

    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      return Buffer.from('{"success":"false"}');
    }
    else {
      return recordAsBytes;
    }
  }



}

module.exports = commonController;