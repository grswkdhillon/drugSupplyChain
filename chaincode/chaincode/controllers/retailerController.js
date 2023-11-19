const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const Crypto = require('crypto');


let retailerController = class {


  async regRetailer(stub, args, thisClass) {

    let email = args[10];
    let today = args[15];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let retailersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);


    if (retailersAsBytes && JSON.parse(retailersAsBytes).length != 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"${email} already exists"}`);
    }
    else {

      const retailer = {
        docType: "retailers",
        name: args[0],
        shopName: args[1],
        businessAddress: {
          streetno: args[2],
          city: args[3],
          state: args[4],
          pincode: args[5]
        },
        phone: args[6],
        aadhaarNo: args[7],
        gstin: args[8],
        panNo: args[9],
        email: args[10],
        password: args[11],
        profileStatus: args[12],
        key: args[13],
        role: args[14],
        statusHistory: [{
          status: args[12],
          date: today
        }]
      };

      console.log("Data to be store in couchdb ", retailer)

      await stub.putState("" + retailer.key, Buffer.from(JSON.stringify(retailer)));
      return Buffer.from(`{"success":"true","msg":"Retailer has been registered successfully."}`);

    }

  }


  async fetchDrugs(stub, args, thisClass) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "drugs";
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let drugsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);


    if (!drugsAsBytes || JSON.parse(drugsAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"No drugs are available."}`);
    }
    else {
      return drugsAsBytes;
    }
  }



  async placeOrder(stub, args, thisClass) {

    let drugs = JSON.parse(args[1]);
    let today = args[8];

    // let retailerId = args[2];
    var errMsg = [];
    var drugsAsBytes;
    for(var i=0;i<drugs.length;i++) {
      let queryString = {};
      queryString.selector = {};
      queryString.selector.docType = "drugs";
      queryString.selector.drugId = drugs[i].drugId;
      queryString.fields = ["drugName"];
      // console.log(queryString);
      let method = thisClass['getQueryResultForQueryString'];
      drugsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

      if (!drugsAsBytes || JSON.parse(drugsAsBytes).length == 0) {
        errMsg.push(`No drug exists with DrugId ${drugs[i].drugId}`);
      }
    }

    if (errMsg.length != 0) {
      return Buffer.from(`{"success":"false","msg":${JSON.stringify(errMsg)}}`);
    }

    // return Buffer.from(`{"success":"true","msg":"passed"}`);
    const order = {
      docType: "orders",
      orderId: args[0],
      drugs: drugs,
      retailerId: args[2],
      deliveryAddress: {
        streetno: args[3],
        city: args[4],
        state: args[5],
        pincode: args[6]
      },
      phone: args[7], 
      orderStatus: "pending",
      statusHistory: [{
        orderStatus: "pending",
        date: today
      }]
    };
  
    console.log("Data to be store in couchdb ",order)

    await stub.putState(""+order.orderId, Buffer.from(JSON.stringify(order)));
    console.log(typeof JSON.stringify(drugs));
    
    return Buffer.from(JSON.stringify({"success":"true","msg":`Order with orderId ${order.orderId} has been placed successfully.`}));

  }


  async myOrdersForRetailer(stub, args, thisClass){
    let retailerEmail = args[0];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "orders";
    queryString.selector.retailerId = retailerEmail;
    
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
   
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"You have not placed any order yet."}`);
    }
    else{
      return ordersAsBytes;
    }
  }

  async cancelMyOrderForRetailer(stub, args, thisClass){
    let orderId = args[0];
    let retailerEmail = args[1];
    let today = args[2];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "orders";
    queryString.selector.orderId = orderId;
    
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"No order exists with order ID ${orderId}."}`);
    }
    
    let retailer = JSON.parse(ordersAsBytes.toString()).data[0].retailerId;
    let orderStatus = JSON.parse(ordersAsBytes.toString()).data[0].orderStatus;
    
    if(retailer != retailerEmail){
      return Buffer.from(`{"success":"false","msg":"You cannot manipulate this order as it's not yours."}`);
    }
    // TODO check if order is cancelled
    if(orderStatus != "pending"){
      return Buffer.from(`{"success":"false","msg":"You cannot cancel this order at this stage."}`);
    } 

    let orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
    orderRecord.statusHistory.push({
      orderStatus: "cancelled",
      date: today
    });

    // TODO ---------------
    // update order record in the status history
    
    await stub.deleteState(""+orderId);
    return Buffer.from(`{"success":"true","msg":"Your order with Order ID ${orderId} has been cancelled successfully."}`);

  }

  async confirmDeliveryForRetailer(stub, args, thisClass){

    let orderId = args[0];
    let retailerId = args[1];
    let today = args[2];
    let statusToUpdate = "delivered";
    
    console.log("args confirmDeliveryForRetailer ",args);
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "orders";
    queryString.selector.orderId = orderId;
    queryString.selector.retailerId = retailerId;
    
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
    // check if order does not exists or does not belong to the retailer
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"No order placed with order Id  ${orderId}"}`);
    }

    var orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
    var orderStatus = orderRecord.orderStatus;
    
    if(orderStatus == "delivered" || orderStatus == "partiallyDelivered"){
      return Buffer.from(`{"success":"false","msg":"This order is already delivered."}`);
    }

    if(orderStatus == "cancelled"){
      return Buffer.from(`{"success":"false","msg":"This order was ${orderStatus}."}`);
    }

    if(orderStatus != "shipped"){
      return Buffer.from(`{"success":"false","msg":"This order is not shipped yet and is in ${orderStatus} state."}`);
    }

    //deciding whether it is "delivered or partially delivered"
    
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.superOrderId = orderId;
  
    ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      console.log("how strange! no suborder exists");
      // return Buffer.from(`{"success":"false","msg":"No orders placed with order Id  ${orderId}"}`);
    }else{
      var suborders = JSON.parse(ordersAsBytes.toString()).data;
      console.log("suborders", suborders.toString());
      var cancelledOrderCount = 0;

      for(var i=0;i<suborders.length; i++){
        console.log("suborders[i].orderStatus ", suborders[i].orderStatus);
        if(suborders[i].orderStatus == "cancelled"){
          cancelledOrderCount++;
        }
      }
      console.log("cancelled order count ", cancelledOrderCount);
      // there exists atleast one cancelled suborder
      if(cancelledOrderCount){
        statusToUpdate = "partiallyDelivered"
      }
    }
    //----- adding status to status history
    if (orderRecord.statusHistory == undefined){
      orderRecord.statusHistory = [];
    }
    console.log("statusToUpdate ",statusToUpdate);

    var newStatusObj = {};
    newStatusObj.orderStatus = statusToUpdate;
    newStatusObj.date = today;

    orderRecord.statusHistory.push(newStatusObj);
    //-----
    orderRecord.orderStatus = statusToUpdate;
    await stub.putState(""+orderRecord.orderId, Buffer.from(JSON.stringify(orderRecord)));
    return Buffer.from(`{"success":"true","msg":"The delivery of order with orderId ${orderId} is received by you."}`);
    
  }


  async getOrderByOrderIdForRetailer(stub, args, thisClass){
    let orderId = args[0];
    let retailerId = args[1];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "orders";
    queryString.selector.orderId = orderId;
    queryString.selector.retailerId = retailerId;
    console.log("arr getOrderByOrderIdForRetailer", args);
    console.log("order id", orderId);
    console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
   
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"Order does not exist. You may have entered wrong order Id"}`);
    }
    else{
      return ordersAsBytes;
    }
  }

  async findDrugByNameForRetailer(stub, args, thisClass){
    
    let drugName = args[0];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "drugs";
    queryString.selector.drugName = {"$regex": `(?i)${drugName}`};
    console.log("arr searchDrugByName", args);
    console.log(queryString);
    
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
   
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"No drug exists with this name"}`);
    }
    else{
      return ordersAsBytes;
    }
   
  }

}

module.exports = retailerController;