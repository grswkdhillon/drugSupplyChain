const shim = require('fabric-shim');
const util = require('util');
const bcrypt = require("bcryptjs");
const Crypto = require('crypto');


let distributorController = class {


    async regDistributor(stub, args, thisClass) {

        let email = args[9];
        let today = args[14];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.email = email;
        // console.log(queryString);
        let method = thisClass['getQueryResultForQueryString'];
        let distributorsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        if (distributorsAsBytes && JSON.parse(distributorsAsBytes).length != 0) {
            // throw new Error(`${toAcno} does not exist`);
            return Buffer.from(`{"success":"false","msg":"${email} already exists"}`);
        }
        else {
            console.log("Registering distributor ........");
            const distributor = {
                docType: "distributors",
                organisationName: args[0],
                businessAddress: {
                    streetno: args[1],
                    city: args[2],
                    state: args[3],
                    pincode: args[4]
                },
                phone: args[5],
                aadhaarNo: args[6],
                licenseNo: args[7],
                validity: args[8],
                email: args[9],
                password: args[10],
                profileStatus: args[11],
                key: args[12],
                role: args[13],
                statusHistory: [{
                    status: args[11],
                    date: today
                }]
            };

            console.log("Data to be store in couchdb ", distributor)

            await stub.putState("" + distributor.key, Buffer.from(JSON.stringify(distributor)));
            return Buffer.from(`{"success":"true","msg":"Distributor has been registered successfully."}`);

        }


    }


    async fetchOrdersForDistributor(stub, args, thisClass) {
        let distributorEmail = args[0];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "distributors";
        queryString.selector.email = distributorEmail;

        // console.log(queryString);
        let method = thisClass['getQueryResultForQueryString'];
        let distributorAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
        let distributorPincode = JSON.parse(distributorAsBytes.toString()).data[0].businessAddress.pincode;

        queryString.selector = {};
        queryString.selector.docType = "orders";
        queryString.selector.deliveryAddress = {};
        queryString.selector.deliveryAddress.pincode = distributorPincode;
        queryString.selector.orderStatus = "pending";

        let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
            // throw new Error(`${toAcno} does not exist`);
            return Buffer.from(`{"success":"false","msg":"No orders are available at your pincode ${distributorPincode}."}`);
        }
        else {
            return ordersAsBytes;
        }
    }


    async confirmOrderForDistributor(stub, args, thisClass) {

        let orderId = args[0];
        let distributorId = args[1];
        let today = args[2];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "orders";
        queryString.selector.orderId = orderId;

        let method = thisClass['getQueryResultForQueryString'];
        let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        // check if order does not exists
        if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
            return Buffer.from(`{"success":"false","msg":"Order with order ID ${orderId} doesn't exist"}`);
        }
        var orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
        var deliveryPincode = orderRecord.deliveryAddress.pincode;
        var orderStatus = orderRecord.orderStatus;

        // check if order is already confirmed
        if (orderStatus == "confirmed") {
            return Buffer.from(`{"success":"false","msg":"You cannot take this order.This order is already in confirm state."}`);
        }


        queryString.selector = {};
        queryString.selector.docType = "distributors";
        queryString.selector.email = distributorId;
        let distributorAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
        let distributorAddress = JSON.parse(distributorAsBytes.toString()).data[0].businessAddress;
        let distributorPincode = distributorAddress.pincode;

        // check if distributor's pincode is same as the order pincode
        if (distributorPincode != deliveryPincode) {
            return Buffer.from(`{"success":"false","msg":"You cannot take this order. Delivery address is different from your pin ${distributorPincode}"}`);
        }

        var orderedDrugs = orderRecord.drugs;
        // orderRecord.subOrders = []
        var couchdbArray = []

        // place sub orders to the respective manufacturer
        for (var i = 0; i < orderedDrugs.length; i++) {

            //fetching drug to get manufacturer id
            let queryString = {};
            queryString.selector = {};
            queryString.selector.docType = "drugs";
            queryString.selector.drugId = orderedDrugs[i].drugId;

            let method = thisClass['getQueryResultForQueryString'];
            let drugsAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
            let manufacturer = JSON.parse(drugsAsBytes.toString()).data[0].manufacturerId;
            let drugName = JSON.parse(drugsAsBytes.toString()).data[0].drugName;

            let drugDetail = {
                "drugId": orderedDrugs[i].drugId,
                "drugName": drugName,
                "quantity": orderedDrugs[i].quantity
            };

            var temp = "empty";

            for (var j = 0; j < couchdbArray.length; j++) {
                if (couchdbArray[j].manufacturerId == manufacturer) {
                    temp = j;
                }
            }

            if (temp != "empty") {
                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   Record found ");

                couchdbArray[temp].drugs.push(drugDetail);
            } else {
                console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   Record Not found ");
                let suborder = {};

                // creating the suborder
                suborder.docType = "suborders"
                suborder.orderId = orderId + i;
                suborder.superOrderId = orderId;
                suborder.drugs = [];
                suborder.drugs.push(drugDetail);
                suborder.manufacturerId = manufacturer;
                suborder.orderStatus = "pending";
                suborder.deliveryAddress = distributorAddress;
                suborder.quantity = orderedDrugs[i].quantity;
                suborder.distributorId = distributorId
                // orderRecord.subOrders.push(suborder.orderId);

                //----- adding status to status history
                suborder.statusHistory = [];

                var newStatusObj = {};
                newStatusObj.orderStatus = "pending";
                newStatusObj.date = today;

                suborder.statusHistory.push(newStatusObj);
                //-----

                couchdbArray.push(suborder);
            }

        }

        console.log("this is the array ", JSON.stringify(couchdbArray));

        for (var i = 0; i < couchdbArray.length; i++) {
            await stub.putState("" + couchdbArray[i].orderId, Buffer.from(JSON.stringify(couchdbArray[i])));
        }

        orderRecord.orderStatus = "confirmed";
        orderRecord['distributorId'] = distributorId;

        //----- adding status to status history
        if (orderRecord.statusHistory == undefined) {
            orderRecord.statusHistory = [];
        }

        var newStatusObj = {};
        newStatusObj.orderStatus = "confirmed";
        newStatusObj.date = today;

        orderRecord.statusHistory.push(newStatusObj);
        //-----

        console.log("Data to be store in couchdb ", orderRecord);

        await stub.putState("" + orderRecord.orderId, Buffer.from(JSON.stringify(orderRecord)));
        return Buffer.from(`{"success":"true","msg":"Order has been confirmed."}`);

    }


    async receivedOrdersForDistributor(stub, args, thisClass) {
        let distributorEmail = args[0];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "orders";
        queryString.selector.distributorId = distributorEmail;
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

    async placedOrdersForDistributor(stub, args, thisClass) {
        let distributorEmail = args[0];
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "suborders";
        queryString.selector.distributorId = distributorEmail;
        let method = thisClass['getQueryResultForQueryString'];
        let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
            // throw new Error(`${toAcno} does not exist`);
            return Buffer.from(`{"success":"false","msg":"No order placed yet."}`);
        }
        else {
            return ordersAsBytes;
        }
    }


    async confirmDeliveryByDistributor(stub, args, thisClass) {

        let orderId = args[0];
        let distributorId = args[1];
        let today = args[2];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "suborders";
        queryString.selector.orderId = orderId;
        queryString.selector.distributorId = distributorId;

        let method = thisClass['getQueryResultForQueryString'];
        let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        // check if order does not exists or does not belong to the distributor
        if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
            return Buffer.from(`{"success":"false","msg":"No orders placed with order Id  ${orderId}"}`);
        }

        var orderRecord = JSON.parse(ordersAsBytes.toString()).data[0];
        var orderStatus = orderRecord.orderStatus;

        if (orderStatus == "cancelled" || orderStatus == "delivered") {
            return Buffer.from(`{"success":"false","msg":"This order is ${orderStatus}."}`);
        }

        if (orderStatus != "shipped") {
            return Buffer.from(`{"success":"false","msg":"This order with orderId ${orderId} is in the state ${orderStatus}, and not shipped yet"}`);
        }

        //if orderStatus is shipped
        orderRecord.orderStatus = "delivered";

        //----- adding status to status history
        if (orderRecord.statusHistory == undefined) {
            orderRecord.statusHistory = [];
        }

        var newStatusObj = {};
        newStatusObj.orderStatus = "delivered";
        newStatusObj.dateaccepted = today;

        orderRecord.statusHistory.push(newStatusObj);
        //-----


        await stub.putState("" + orderRecord.orderId, Buffer.from(JSON.stringify(orderRecord)));

        // update the superorder to the state shipped if all its suborders are delivered or cancelled
        queryString.selector = {};
        queryString.selector.docType = "suborders";
        queryString.selector.distributorId = distributorId;
        queryString.selector.superOrderId = orderRecord.superOrderId;
        queryString.selector.orderId = { "$ne": orderRecord.orderId };

        let subordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);
        let suborders = JSON.parse(subordersAsBytes.toString()).data;

        var flag = 0;

        console.log(`showing all the suborders ${JSON.stringify(suborders)}`);

        if (suborders != undefined) {
            for (var i = 0; i < suborders.length; i++) {
                console.log("i=", i);
                console.log("suborders[i].orderStatus", suborders[i].orderStatus);
                if (suborders[i].orderStatus != "delivered" && suborders[i].orderStatus != "cancelled") {
                    flag = 1;
                }
            }
        }

        if (flag == 0) {
            // get the superorder and update its status to shipped
            queryString.selector = {};
            queryString.selector.docType = "orders";
            queryString.selector.orderId = orderRecord.superOrderId;
            queryString.selector.distributorId = distributorId;

            let superOrdersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

            if (!superOrdersAsBytes || JSON.parse(superOrdersAsBytes).length == 0) {
                return Buffer.from(`{"success":"false","msg":"error occured while searching for the superorder to update its status to shipped. superorder id is ${orderRecord.superOrderId}"}`);
            }

            let superOrder = JSON.parse(superOrdersAsBytes.toString()).data[0];

            superOrder.orderStatus = "shipped";

            //----- adding status to status history
            if (superOrder.statusHistory == undefined) {
                superOrder.statusHistory = [];
            }

            var newStatusObj = {};
            newStatusObj.orderStatus = "shipped";
            newStatusObj.date = today;

            superOrder.statusHistory.push(newStatusObj);
            //-----

            await stub.putState("" + superOrder.orderId, Buffer.from(JSON.stringify(superOrder)));
            console.log("successfully changed the superorder's status to delivered.");
        }

        return Buffer.from(`{"success":"true","msg":"The delivery of the order with orderId ${orderId} is received by you"}`);

    }


    async getAllOrdersBySuperIdForDistributor(stub, args, thisClass) {
        let superOrderId = args[0];
        let distributorEmail = args[1];

        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = "suborders";
        queryString.selector.distributorId = distributorEmail;
        queryString.selector.superOrderId = superOrderId;
        console.log("getAllOrdersBySuperIdForDistributor", args);
        let method = thisClass['getQueryResultForQueryString'];
        let ordersAsBytes = await method(stub, JSON.stringify(queryString), thisClass);

        if (!ordersAsBytes || JSON.parse(ordersAsBytes).length == 0) {
            // throw new Error(`${toAcno} does not exist`);
            return Buffer.from(`{"success":"false","msg":"No order placed yet."}`);
        }
        else {
            return ordersAsBytes;
        }
    }


}

module.exports = distributorController;