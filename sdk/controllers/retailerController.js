const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateKey,generateOrderId} = require("../helper/helperFunctions");

const chaincode = require('../services/fabric/chaincode');

const Retailer = require("../models/Retailer");

// create json web token
const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;

// const createToken = (data) => {
//   return jwt.sign(data, TOKENSECRET, {
//     expiresIn: MAXAGE
//   });
// };

module.exports.login = async (req, res) => {
    
    try {   
      let retailerFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", req.body.email, true);
      console.log("retailerFromCC ", retailerFromCC);
      
      // if users email doesnot exists in couchdb return error

      if (retailerFromCC.success == "false") {
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }

      const retailerData = await Retailer.findOne({
        email: req.body.email,
      });


      // if users email doesnot exists return error
      if (!retailerData ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }
  
    //   const userId = retailerData._id.toHexString();
    const data = {
      id: retailerData._id.toHexString(),
      email: retailerData.email,
      role: 'retailer'
    };

      // if correct password allow login and create jwt token
      if (await compare(req.body.password, retailerData.password) && retailerData.password == retailerFromCC.data[0].password) {
        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
      });
      if(retailerFromCC.data[0].profileStatus != "active"){
        return res.status(statusCode.Bad_request).json({
          message: messages.profileStatusConflict+`${retailerFromCC.data[0].profileStatus}`+messages.contactAdmin,
          ResponseStatus: responseStatus.failure,
        });
      }

        // const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        return res.status(statusCode.Created).json({
          message: messages.loginSuccess,
          ResponseStatus: responseStatus.success,
          jwToken: token,
        });
      }
  
      // if wrong password throw error
      else {
        return res.status(statusCode.Unauthorized).json({
          message: messages.UnauthorizedPassword,
          ResponseStatus: responseStatus.failure,
        });
      }
    } catch (error) {
      console.log(error.message,"error");
      res.status(statusCode.Bad_request).json({
        messages: messages.loginError,
        ResponseStatus: responseStatus.failure,
      });
    }
};


module.exports.register = async(req, res)=>{
    
    try {
        const today = new Date(); 

        const retailerDetails = {
            fullName: req.body.fullName,
            storeName: req.body.storeName,
            businessAddress: {
              streetNo: req.body.businessAddress.streetNo, 
              state: req.body.businessAddress.state, 
              city: req.body.businessAddress.city, 
              pincode: req.body.businessAddress.pincode,
            },
            phone: req.body.phone, 
            aadhaar: req.body.aadhaar,
            gstin: req.body.gstin,
            pancard: req.body.pancard,
            email: req.body.email,
            password: req.body.password,
        };

        console.log("retailer/registeration POST retailerDetails ", retailerDetails);
        let newRetailerCC = await chaincode.invokeChaincode("checkEmailExistence", retailerDetails.email, true);
        
        console.log("newRetailerCC ",newRetailerCC);

        if (newRetailerCC.success == "true"){
          return res.status(statusCode.Bad_request).json({
              messages:messages.userExists,
              ResponseStatus: responseStatus.failure,
          });
      }
        let newRetailer = await Retailer.findOne({email: retailerDetails.email});

        if (newRetailer){
            return res.status(statusCode.Bad_request).json({
                messages:messages.userExistsConflict,
                ResponseStatus: responseStatus.failure,
            });
        }
        // user does not exists
        newRetailer = await Retailer.create(retailerDetails);
        let key = generateKey();

        let newArgs = [
          newRetailer.fullName,
          newRetailer.storeName,
          newRetailer.businessAddress.streetNo,
          newRetailer.businessAddress.city, 
          newRetailer.businessAddress.state, 
          newRetailer.businessAddress.pincode,
          newRetailer.phone, 
          newRetailer.aadhaar,
          newRetailer.gstin,
          newRetailer.pancard,
          newRetailer.email,
          newRetailer.password,
          newRetailer.profileStatus,
          key,
          newRetailer.role,
          today.toJSON()
        ];

        let result = await chaincode.invokeChaincode("regRetailer", newArgs, false);
        
        console.log("result from the chaincode ", result);
        
        return res.status(statusCode.Created).json({
            messages:messages.register,
            ResponseStatus: responseStatus.success,
        });

    } catch (error) {
        console.log("retailer/registeration POST ",error.message);
        return res.status(statusCode.InternalServerError).json({
            messages:messages.serverErr,
            ResponseStatus: responseStatus.failure,
        });
    }
}



module.exports.showDrugs = async (req, res)=>{ 
  try {

      let result = await chaincode.invokeChaincode("fetchDrugs", [], false);
      
      console.log("result from the chaincode ", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }
      
      return res.status(statusCode.Created).json({
          messages:messages.fetchSuccess,
          ResponseStatus: responseStatus.success,
          data: result.data
      });

  } catch (error) {
      console.log("retailer/registeration POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}



module.exports.placeOrder = async (req, res)=>{ 
  try {

    let key = generateOrderId();
    let today = new Date();
    console.log("order iIIDdD ", key);

      let newArgs = [
        key,
        JSON.stringify(req.body.drugs),
        req.email,
        req.body.deliveryAddress.streetNo,
        req.body.deliveryAddress.city,
        req.body.deliveryAddress.state,
        req.body.deliveryAddress.pincode,
        req.body.phone,
        today.toJSON()
      ];

      let result = await chaincode.invokeChaincode("placeOrder", newArgs , false);
      
      console.log("result from the chaincode ", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.success,
        });
      }
      
      return res.status(statusCode.Created).json({
          messages:result.msg,
          ResponseStatus: responseStatus.success
      });

  } catch (error) {
      console.log("retailer/registeration POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.myOrders = async (req, res)=>{ 
  try {

    let newArgs = [
      req.email
    ];

      let result = await chaincode.invokeChaincode("myOrdersForRetailer", newArgs, false);

      console.log("result from the chaincode ", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          ResponseStatus: responseStatus.success,
          data: result.data
      });

  } catch (error) {
      console.log("retailer/registeration POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.cancelMyOrder = async (req, res)=>{ 
  try {
      let today = new Date();

      let newArgs = [
        req.body.orderId,
        req.email,
        today.toJSON()
      ];

      let result = await chaincode.invokeChaincode("cancelMyOrderForRetailer", newArgs, false);
      
      console.log("result from the chaincode", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }
      
      return res.status(statusCode.Created).json({
          messages:result.msg,
          ResponseStatus: responseStatus.success,
      });

  } catch (error) {
      console.log("reatailer/cancelMyOrder PUT ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.confirmDelivery = async (req, res)=>{ 
  try {
      let today = new Date();

      let newArgs = [
        req.body.orderId,
        req.email,
        today.toJSON()
      ];

      let result = await chaincode.invokeChaincode("confirmDeliveryForRetailer", newArgs, false);
      
      console.log("result from the chaincode", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }
      
      return res.status(statusCode.Created).json({
          messages:result.msg,
          ResponseStatus: responseStatus.success,
      });

  } catch (error) {
      console.log("reatailer/confirmDelivery PUT ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.getOrderByOrderId = async (req, res)=>{ 
  try {

      const orderId = req.body.orderId;
      
      let newArgs = [
        orderId,
        req.email
      ];

      console.log("fdfd", newArgs[0]);
      let result = await chaincode.invokeChaincode("getOrderByOrderIdForRetailer", newArgs, false);
      
      console.log("result from the chaincode ", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }
      
      return res.status(statusCode.Created).json({
          ResponseStatus: responseStatus.success,
          data: result.data
      });

  } catch (error) {
      console.log("retailer/registeration POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}



module.exports.findDrugByName = async (req, res)=>{ 
  try {

      const drugName = req.body.drugName;
      
      let newArgs = [
        drugName,
      ];

      console.log("fdfd", newArgs[0]);
      let result = await chaincode.invokeChaincode("findDrugByNameForRetailer", newArgs, false);
      
      console.log("result from the chaincode ", result);

      if(result.success == "false"){
        return res.status(statusCode.Not_Found).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
        });
      }
      
      return res.status(statusCode.Created).json({
          ResponseStatus: responseStatus.success,
          data: result.data
      });

  } catch (error) {
      console.log("retailer/registeration POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}
