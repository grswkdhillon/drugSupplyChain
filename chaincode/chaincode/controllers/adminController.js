const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const Crypto = require('crypto');


let adminController = class {

  async regAdmin(stub, args, thisClass){
    let email = args[0];
    let passPhrase = args[2];
    let queryString = {};
    queryString.selector = {};
    queryString.selector = {};
    queryString.selector.email = email;
    let method = thisClass['getQueryResultForQueryString'];
    let adminsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if(adminsAsBytes && JSON.parse(adminsAsBytes).length != 0){
      return Buffer.from(`{"success":"false","msg":"${email} already exists"}`)
    }else if(passPhrase != "xylem"){
      return Buffer.from(`{"success":"false","msg":"Secret key is invalid."}`)
    }else{
      console.log("Registering..........");
      let admin = {
        docType:"admins",
        email: args[0],
        password: args[1],
        profileStatus: args[3],
        key: args[4],
        role: args[5]
      }

      await stub.putState(""+admin.key, Buffer.from(JSON.stringify(admin)));
      return Buffer.from(`{"success":"true","msg":"Admin has been registered successfully."}`)
    }
  }



  async getUsersByProfileStatus(stub, args, thisClass){
    let profileStatus = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.profileStatus = profileStatus;
    queryString.selector.docType = {"$ne": "admins"};

    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
   
    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"No user has profile status ${profileStatus}. "}`);
    }
    else{
      return recordAsBytes;
    }
  }



  async changeProfileStatus(stub, args, thisClass){
    let email = args[0];
    let profileStatus = args[1];
    let today = args[2];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
   
    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"${email} doesn't exists"}`);
    }else if(JSON.parse(recordAsBytes.toString()).data[0].profileStatus == profileStatus  ){
      return Buffer.from(`{"success":"false","msg":"${email}'s profile is already in the desired status. No changes were made."}`);
    }
    else{
      let userProfile = JSON.parse(recordAsBytes.toString()).data[0];
      userProfile.profileStatus = profileStatus;
      
      userProfile.statusHistory.push({
        "status": profileStatus,
        "date": today
      });

      console.log("Data to be store in couchdb ",userProfile);

      await stub.putState(""+userProfile.key, Buffer.from(JSON.stringify(userProfile)));
      return Buffer.from(`{"success":"true","msg":"Profile status of ${userProfile.email} is set to ${userProfile.profileStatus}"}`);

    }
    
  }



  async getUsersByRole(stub, args, thisClass){
    let role = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = role;

    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
   
    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"No user has role: ${role}"}`);
    }
    else{
      return recordAsBytes;
    }
  }





  async deleteUserById(stub, args, thisClass){

    let email = args[0];
    let today = args[1];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;

    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
   
    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"${email} doesn't exists"}`);
    }
    
    let record = JSON.parse(recordAsBytes.toString()).data[0];
    
    if(record.profileStatus == "deleted"){
      return Buffer.from(`{"success":"false","msg":"Profile is already in desired state, no changes were made."}`);
    }
    record.profileStatus = "deleted";
    record.statusHistory.push({
      date: today,
      status: "deleted"
    });
    
    console.log("this is the user's record ", record);

    await stub.putState(""+record.key, Buffer.from(JSON.stringify(record)));

    return Buffer.from(`{"success":"true","msg":"Profile status updated successfully"}`);

  }

  async getHistoryByKey(stub, args, thisClass){
    let key = args[0];
  
    
    let resultsIterator = await stub.getHistoryForKey(key);
    let method = thisClass['getAllResults'];
    let results = await method(resultsIterator, true);
    
    if(!results || results.length == 0){
      return Buffer.from(`{"success":"true","msg":"No record found for this key"}`);
    }  

    return Buffer.from(JSON.stringify(results));

  }

  async getRecordsByDocType(stub, args, thisClass){

    let docType = args[0];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = docType;

    let method = thisClass['getQueryResultForQueryString'];
    let recordAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!recordAsBytes || JSON.parse(recordAsBytes).length == 0) {  
      return Buffer.from(`{"success":"false","msg": "no record exists with this docType"}`);
    }

    return recordAsBytes;
  }

}

module.exports = adminController;