const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const Crypto = require('crypto');


let manufacturerController = class {


  async regManufacturer(stub, args, thisClass) {

    let email = args[8];
    let today = args[13];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.email = email;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let manufacturersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    // console.log("thsi is chemistsas Bytes  ", manufacturersAsBytes.toString());
    console.log("manufacturer", manufacturersAsBytes);
    console.log("json parse manufacturer", JSON.parse(manufacturersAsBytes));
    console.log("json parse manufacturer", JSON.parse(manufacturersAsBytes).length);
    console.log("thsi is chemistsas Bytes  ", manufacturersAsBytes.length);
    console.log("thsi is chemistsas Bytes  ", JSON.stringify(manufacturersAsBytes));


    if (manufacturersAsBytes && JSON.parse(manufacturersAsBytes).length != 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"${email} already exists"}`);
    }
    else {

      console.log("registering...............................  ")

      const manufacturer = {
        docType: "manufacturers",
        organisationName: args[0],
        businessAddress: {
          streetno: args[1],
          city: args[2],
          state: args[3],
          pincode: args[4]
        },
        phone: args[5],
        businessRegNo: args[6],
        gstin: args[7],
        email: args[8],
        password: args[9],
        profileStatus: args[10],
        key: args[11],
        role: args[12],
        statusHistory: [{
          status: args[10],
          date: today
        }]
      };

      console.log("Data to be store in couchdb ", manufacturer);

      await stub.putState(manufacturer.key, Buffer.from(JSON.stringify(manufacturer)));
      return Buffer.from(`{"success":true,"msg":"Manufacturer has been registered successfully."}`);
    }

  }



  async addDrug(stub, args, thisClass) {

    let drugId = args[0];
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "drugs";
    queryString.selector.drugId = drugId;
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let drugsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);


    if (drugsAsBytes && JSON.parse(drugsAsBytes).length != 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"Drug( ${JSON.parse(drugsAsBytes.toString()).data[0].drugName} ) with Id ${drugId} already exists"}`);
    }
    else {

      const drug = {
        docType: "drugs",
        drugId: args[0],
        drugName: args[1],
        drugDesc: args[2],
        activeIngredients: JSON.parse(args[3]),
        formulation: args[4],
        manufacturingProcess: args[5],
        clinicalTrials: args[6],
        pharmacokinetics: args[7],
        pharmacodynamics: args[8],
        adverseReactions: args[9],
        shelfLife: args[10],
        packaging: JSON.parse(args[11]),
        fdaRegulations: args[12],
        gmpGuidlines: args[13],
        manufacturerId: args[14],
        key: args[15],
        createdOn: args[16]
      };

      console.log("Data to be store in couchdb ", drug)

      await stub.putState("" + drug.key, Buffer.from(JSON.stringify(drug)));
      return Buffer.from(`{"success":"true","msg":"${drug.drugName} : Drug has has been added successfully."}`);

    }
  }


  async getDrugs(stub, args, thisClass) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "manufacturers";
    queryString.selector.email = args[0];

    let method = thisClass['getQueryResultForQueryString'];
    let manufacturerAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    console.log("manufacturerAsBytes : ", manufacturerAsBytes);
    console.log("JSON.parse(manufacturerAsBytes) : ", JSON.parse(manufacturerAsBytes));
    console.log("manufacturerAsBytes.toString() : ", manufacturerAsBytes.toString());
    console.log("JSON.stringify(manufacturerAsBytes) : ", JSON.stringify(manufacturerAsBytes));
    console.log("JSON.parse(manufacturerAsBytes.toString()) : ", JSON.parse(manufacturerAsBytes.toString()));
    console.log("JSON.parse(manufacturerAsBytes).length ", JSON.parse(manufacturerAsBytes).length);

    if (!manufacturerAsBytes || JSON.parse(manufacturerAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"Manufacturer does not exists"}`);
    }

    queryString.selector = {};
    queryString.selector.docType = "drugs";
    queryString.selector.manufacturerId = args[0];

    let drugsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!drugsAsBytes || JSON.parse(drugsAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"No drugs are available."}`);
    }
    else {
      return drugsAsBytes;
    }
  }




  async fetchOrdersForManufacturers(stub, args, thisClass) {
    let manufacturerEmail = args[0];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.manufacturerId = manufacturerEmail;
    queryString.selector.orderStatus = "pending";
    // console.log(queryString);
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"No orders are available."}`);
    }
    else {
      return ordersAsBytes;
    }
  }

  async confirmOrderForManufacturer(stub, args, thisClass) {

    let orderId = args[0];
    let manufacturerId = args[1];
    let today = args[2];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.orderId = orderId;

    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    // check if order does not exists
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"Order with order ID ${orderId} doesn't exist"}`);
    }
    var orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
    var manufacturer = orderRecord.manufacturerId;
    var orderStatus = orderRecord.orderStatus;

    // check if order is already confirmed
    if (orderStatus != "pending") {
      return Buffer.from(`{"success":"false","msg":"Not a valid action."}`);
    }

    // if order does not belong to that particular manufacturer
    if (manufacturer != manufacturerId) {
      return Buffer.from(`{"success":"false","msg":"This order is not for your organization."}`);
    }

    orderRecord.orderStatus = "confirmed";

    //changing the status of superorder
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.superOrderId = orderRecord.superOrderId;
    queryString.selector.orderId = { "$ne": orderId };

    ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
    let allOrders = JSON.parse(ordersAsBytes.toString());

    if (allOrders.data) {
      allOrders = allOrders.data
    }
    else {
      allOrders = [];
    }

    // checking if any order does not have the status confirmed

    let flag = 0;
    for (var i = 0; i < allOrders.length; i++) {
      if (allOrders[i].orderStatus == 'pending') {
        flag = 1;
      }
    }

    // each suborder is confirmed
    if (flag == 0) {
      //getting superorder
      queryString.selector = {};
      queryString.selector.docType = "orders";
      queryString.selector.orderId = orderRecord.superOrderId;
      ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
      let superOrder = JSON.parse(ordersAsBytes.toString()).data[0];
      superOrder.orderStatus = "processed";

      //----- adding status to status history
      if (superOrder.statusHistory == undefined) {
        superOrder.statusHistory = [];
      }

      var newStatusObj = {};
      newStatusObj.orderStatus = "processed";
      newStatusObj.date = today;

      superOrder.statusHistory.push(newStatusObj);
      //-----


      await stub.putState("" + superOrder.orderId, Buffer.from(JSON.stringify(superOrder)));
    }


    //----- adding status to status history
    if (orderRecord.statusHistory == undefined) {
      orderRecord.statusHistory = [];
    }

    var newStatusObj = {};
    newStatusObj.orderStatus = "confirmed";
    newStatusObj.date = today;

    orderRecord.statusHistory.push(newStatusObj);
    //-----

    await stub.putState("" + orderRecord.orderId, Buffer.from(JSON.stringify(orderRecord)));

    return Buffer.from(`{"success":"true","msg":"Order with OrderId ${orderId} has been confirmed."}`);
  }

  async receivedOrdersForManufacturer(stub, args, thisClass) {
    let manufacturerEmail = args[0];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.manufacturerId = manufacturerEmail;
    queryString.selector.orderStatus = { "$ne": "pending" };
    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      // throw new Error(`${toAcno} does not exist`);
      return Buffer.from(`{"success":"false","msg":"No order received yet."}`);
    }
    else {
      return ordersAsBytes;
    }
  }


  async updateOrderStatusForManufacturer(stub, args, thisClass) {
    let orderId = args[0];
    let statusUpdate = args[1];
    let manufacturerId = args[2];
    let today = args[3];

    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "suborders";
    queryString.selector.orderId = orderId;

    let method = thisClass['getQueryResultForQueryString'];
    let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

    // check if order does not exists
    if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
      return Buffer.from(`{"success":"false","msg":"Order with order ID ${orderId} doesn't exist"}`);
    }

    var orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
    var manufacturer = orderRecord.manufacturerId;
    var orderStatus = orderRecord.orderStatus;

    console.log(`orderStatus: ${orderStatus}, statusUpdate: ${statusUpdate}`);

    // if order does not belong to that particular manufacturer
    if (manufacturer != manufacturerId) {
      return Buffer.from(`{"success":"false","msg":"This order does not belong to you."}`);
    }
    // check if order is already confirmed
    if (orderStatus == "pending") {
      return Buffer.from(`{"success":"false","msg":"This order is not confirmed yet."}`);
    }

    if (orderStatus == "cancelled" || orderStatus == "delivered" || orderStatus == "shipped") {
      return Buffer.from(`{"success":"false","msg":"No further operations are supported as this order had been ${orderStatus}."}`);
    }

    if (orderStatus == statusUpdate) {
      return Buffer.from(`{"success":"false","msg":"This order is already in ${statusUpdate} state."}`);
    }


    if (statusUpdate != "cancelled") {

      if (orderStatus == "confirmed" && statusUpdate != "processed") {
        return Buffer.from(`{"success":"false","msg":"Invalid order Status. Cannot change the order status directly from ${orderStatus} to ${statusUpdate}"}`);
      }

      if (orderStatus == "processed" && statusUpdate != "underQualityCheck") {
        return Buffer.from(`{"success":"false","msg":"Invalid order Status. Cannot change the order status directly from ${orderStatus} to ${statusUpdate}"}`);
      }

      if (orderStatus == "underQualityCheck" && statusUpdate != "readyToShip") {
        return Buffer.from(`{"success":"false","msg":"Invalid order Status. Cannot change the order status directly from ${orderStatus} to ${statusUpdate}"}`);
      }

      if (orderStatus == "readyToShip" && statusUpdate != "shipped") {
        return Buffer.from(`{"success":"false","msg":"Invalid order Status. Cannot change the order status directly from ${orderStatus} to ${statusUpdate}"}`);
      }
    }

    var message = `the status of OrderId ${orderId} has been updated from ${orderStatus} to ${statusUpdate}.`;

    //----- adding status to status history
    if (orderRecord.statusHistory == undefined) {
      orderRecord.statusHistory = [];
    }

    let newStatusObj = {};
    newStatusObj.orderStatus = statusUpdate;
    newStatusObj.date = today;

    //-----

    if (statusUpdate == "cancelled") {
      var cancelledReason = args[4];
      orderRecord.cancelledReason = cancelledReason;
      message = "the order has been cancelled successfully";
      newStatusObj.cancelledReason = cancelledReason;

      //checking if other suborders belonging to the same superorder are also cancelled then make the whole order cancelled
      queryString.selector = {};
      queryString.selector.docType = "suborders";
      queryString.selector.orderId = { "$ne": orderId };
      queryString.selector.superOrderId = orderRecord.superOrderId;


      ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

      if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
        console.log("no suborder found with the same superOrderId ", orderRecord.superOrderId);
        queryString.selector = {};
        queryString.selector.docType = "orders";
        queryString.selector.orderId = orderRecord.superOrderId;

        ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
        var superOrder = JSON.parse(ordersAsBytes.toString()).data[0];

        superOrder.orderStatus = "cancelled";
        superOrder.statusHistory.push({
          orderStatus: "cancelled",
          date: today
        });

        await stub.putState("" + superOrder.orderId, Buffer.from(JSON.stringify(superOrder)));

      } else {
        var allOrders = JSON.parse(ordersAsBytes.toString()).data;
        var cancelledOrderCount = 0;
        var endedOrderCount = 0;
        //iterate over each order
        for (var i = 0; i < allOrders.length; i++) {
          if (allOrders[i].orderStatus === "cancelled") {
            cancelledOrderCount++;
          }
          if (allOrders[i].orderStatus === "delivered" || allOrders[i].orderStatus === "cancelled") {
            endedOrderCount++;
          }
        }

        if (cancelledOrderCount === allOrders.length) {
          console.log("each order is cancelled");
          queryString.selector = {};
          queryString.selector.docType = "orders";
          queryString.selector.orderId = orderRecord.superOrderId;

          ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
          var superOrder = JSON.parse(ordersAsBytes.toString()).data[0];
          superOrder.orderStatus = "cancelled";
          superOrder.statusHistory.push({
            orderStatus: "cancelled",
            date: today
          })
          await stub.putState("" + superOrder.orderId, Buffer.from(JSON.stringify(superOrder)));
        }
        else if (endedOrderCount === allOrders.length) {
          console.log("all orders are ended now we can change the super order to shipped");
          queryString.selector = {};
          queryString.selector.docType = "orders";
          queryString.selector.orderId = orderRecord.superOrderId;

          ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
          var superOrder = JSON.parse(ordersAsBytes.toString()).data[0];
          superOrder.orderStatus = "shipped";
          superOrder.statusHistory.push({
            orderStatus: "shipped",
            date: today
          })
          await stub.putState("" + superOrder.orderId, Buffer.from(JSON.stringify(superOrder)));
        }
      }

    }

    orderRecord.statusHistory.push(newStatusObj);
    //-----

    // if everything goes fine, update status
    orderRecord.orderStatus = statusUpdate;
    await stub.putState("" + orderRecord.orderId, Buffer.from(JSON.stringify(orderRecord)));

    return Buffer.from(`{"success":"true","msg":"${message}"}`);

  }

}

module.exports = manufacturerController;