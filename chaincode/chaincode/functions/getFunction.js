const commonController = require('../controllers/commonController');
const adminController = require('../controllers/adminController');
const manufacturerController = require('../controllers/manufacturerController');
const distributorController = require('../controllers/distributorController');
const retailerController = require('../controllers/retailerController');




module.exports.findFunction = (funcName)=>{
    let controllers = {
        commonController: ["checkEmailExistence", "fetchRecordWithEmail", "fetchRecordWithSpecificKeyAndValue", "checkRecordExistenceWithEmailAndPassword"],
        adminController: ["regAdmin", "getUsersByProfileStatus", "changeProfileStatus", "getUsersByRole", "deleteUserById", "getRecordsByDocType", "getHistoryByKey"],
        manufacturerController: ["regManufacturer", "addDrug", "getDrugs", "fetchOrdersForManufacturers", "confirmOrderForManufacturer", "receivedOrdersForManufacturer", "updateOrderStatusForManufacturer"],
        distributorController: ["regDistributor", "fetchOrdersForDistributor", "confirmOrderForDistributor", "receivedOrdersForDistributor", "placedOrdersForDistributor", "confirmDeliveryByDistributor", "getAllOrdersBySuperIdForDistributor"],
        retailerController: ["regRetailer", "fetchDrugs", "placeOrder", "myOrdersForRetailer", "cancelMyOrderForRetailer", "getOrderByOrderIdForRetailer", "confirmDeliveryForRetailer", "findDrugByNameForRetailer" ]
    }   

    let keys = Object.keys(controllers);
    for(var i=0;i<keys.length;i++){
        console.log("yyyyyyyyyyyyyyyyyyyyyyyyy")
        console.log(controllers[keys[i]]);
        var className = keys[i]
        let arr = controllers[keys[i]];
        for(var j=0;j<arr.length;j++){
            if(arr[j] == funcName){
                if(className == "commonController")
                    var classObj = new commonController;
                if(className == "adminController")
                    var classObj = new adminController;
                if(className == "manufacturerController")
                  var classObj = new manufacturerController;
                if(className == "distributorController")
                  var classObj = new distributorController;
                if(className == "retailerController")
                  var classObj = new retailerController;

                return classObj[funcName];
            }
        }
    }

}