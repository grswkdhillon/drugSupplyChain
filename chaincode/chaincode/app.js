
// 'use strict';/

const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const getFunction = require('./functions/getFunction');

let Gursewak = class {

  async Init(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);
    console.info('=========== Instantiated Supplychain Chaincode ===========');
    return shim.success();
  }

  async Invoke(stub) {
    console.info('Transaction ID: ' + stub.getTxID());
    console.info(util.format('Args: %j', stub.getArgs()));

    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = getFunction.findFunction(ret.fcn); 
    if (!method) {
      console.log('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params, this);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  

  // =========================================================================================
  // getQueryResultForQueryString executes the passed in query string.
  // Result set is built and returned as a byte array containing the JSON results.
  // =========================================================================================
  async getQueryResultForQueryString(stub, queryString, thisClass, isHistory = false) {

    console.info('- getQueryResultForQueryString queryString:\n' + queryString)
    let resultsIterator = await stub.getQueryResult(queryString);
    console.log(resultsIterator);
    let method = thisClass['getAllResults'];

    let results = await method(resultsIterator, isHistory);

    console.log("Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak ", results);
    if(results.length != 0){
      results = {"success":"true","data":results};
    }
    console.log("Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak Gursewak ", results);

    return Buffer.from(JSON.stringify(results));
  }


  async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        // console.log("res.value", JSON.stringify(res.value))
        // console.log("res.value.value.toString('utf8')",res.value.value.toString('utf8'));
        // console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.txId;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.isDelete;  
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          // jsonRes.Key = res.value.key;
          try {
            jsonRes = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        return allResults;
      }
    }
  }

}

shim.start(new Gursewak());
