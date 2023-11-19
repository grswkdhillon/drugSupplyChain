const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const { hash, compare } = require("bcrypt");
const {generateKey} = require("../helper/helperFunctions");

const jwt = require("jsonwebtoken");

const chaincode = require('../services/fabric/chaincode');

const Distributor = require("../models/Distributor");
const Manufacturer = require("../models/Manufacturer");

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
      let distributorFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", req.body.email, true);
      console.log("distributorFromCC ", distributorFromCC);

      if (distributorFromCC.success == "false"){
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }

      const distributorData = await Distributor.findOne({
        email: req.body.email,
      });
  
      // if users email doesnot exists return error
      if (!distributorData ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.userExistsConflict,
          ResponseStatus: responseStatus.failure,
        });
      }
  
    //   const userId = distributorData._id.toHexString();
      const data = {
        id: distributorData._id.toHexString(),
        email: distributorData.email,
        role: 'distributor'
      };

      // if correct password allow login and create jwt token
      if (await compare(req.body.password, distributorData.password) && distributorData.password === distributorFromCC.data[0].password) {
        
        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
        });
  
        // if status is not active
        if(distributorFromCC.data[0].profileStatus != "active"){
          return res.status(statusCode.Bad_request).json({
            message: messages.profileStatusConflict+`${distributorFromCC.data[0].profileStatus}`+messages.contactAdmin,
            ResponseStatus: responseStatus.failure,
          });
        }

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
        let today = new Date();

        const distributorDetails = {
            organizationName: req.body.organizationName,
            businessAddress: {
              streetNo: req.body.businessAddress.streetNo, 
              state: req.body.businessAddress.state, 
              city: req.body.businessAddress.city, 
              pincode: req.body.businessAddress.pincode, 
            },
            phone: req.body.phone, 
            aadhaar: req.body.aadhaar,
            licenseNumber: req.body.licenseNumber,
            validity: req.body.validity,
            email: req.body.email, 
            password: req.body.password,
        };

        console.log("distributor/registeration POST distributorDetails ", distributorDetails);

        let newDistributorCC = await chaincode.invokeChaincode("checkEmailExistence", distributorDetails.email, true);
        
        console.log("newDistributorCC ", newDistributorCC);

        if(newDistributorCC.success == "true"){
          return res.status(statusCode.Bad_request).json({
            messages:messages.userExists,
            ResponseStatus: responseStatus.failure,
          });
        }

        let newDistributor = await Distributor.findOne({email: distributorDetails.email});
        if (newDistributor){
            return res.status(statusCode.Bad_request).json({
                messages:messages.userExistsConflict,
                ResponseStatus: responseStatus.failure,
            });
        }
        // user does not exists
        newDistributor = await Distributor.create(distributorDetails);
        let key = generateKey();

        let newArgs = [
            newDistributor.organizationName,
            newDistributor.businessAddress.streetNo,
            newDistributor.businessAddress.state,
            newDistributor.businessAddress.city,
            newDistributor.businessAddress.pincode,
            newDistributor.phone,
            newDistributor.aadhaar,
            newDistributor.licenseNumber,
            newDistributor.validity,
            newDistributor.email,
            newDistributor.password,
            newDistributor.profileStatus,
            key,
            newDistributor.role,
            today.toJSON()
        ];

        let result = await chaincode.invokeChaincode("regDistributor", newArgs, false);

        console.log("result from the chaincode ", result);
        
        return res.status(statusCode.Created).json({
            messages:messages.register,
            ResponseStatus: responseStatus.success,
        });

    } catch (error) {
        console.log("distributor/registeration POST ",error.message);
        return res.status(statusCode.InternalServerError).json({
            messages:messages.serverErr,
            ResponseStatus: responseStatus.failure,
        });
    }
}


module.exports.showOrders = async (req, res)=>{ 
  try {
     let newArgs = [
      req.email,
     ];

      let result = await chaincode.invokeChaincode("fetchOrdersForDistributor", newArgs, true);
      
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
      console.log("distributor/showOrderers POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.confirmOrder = async (req, res)=>{ 
  try {
    const orderId = req.body.orderId;
    const today = new Date();

    console.log("order id",orderId);

    let newArgs = [
      orderId,
      req.email,
      today.toJSON()
    ];

    let result = await chaincode.invokeChaincode("confirmOrderForDistributor", newArgs, false);
    
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
      console.log("distributor/confirmOrder PUT ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.receivedOrders = async (req, res)=>{ 
  try {
     let newArgs = [
      req.email
     ];

      let result = await chaincode.invokeChaincode("receivedOrdersForDistributor", newArgs, true);
      
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
      console.log("distributor/showOrderers POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.placedOrders = async (req, res)=>{ 
  try {
     let newArgs = [
      req.email,
     ];

      let result = await chaincode.invokeChaincode("placedOrdersForDistributor", newArgs, true);
      
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
      console.log("distributor/showOrderers POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


// module.exports.updateStatus = async(req, res)=>{
//   try {
//     const status = req.body.status;

//     const args = [
//         req.body.orderId,
//         req.email,
//         status
//     ]; 

//     const result = await chaincode.invokeChaincode("updateOrderStatusForDistributor", args, false);

//     if (result.success == "false"){
//       return res.status(statusCode.Bad_request).json({
//           messages:result.msg,
//           ResponseStatus: responseStatus.failure,
//       });
//     }

//   } catch (error) {

//     console.log("distributor/statusUpdate PUT ",error.message);

//     return res.status(statusCode.InternalServerError).json({
//       messages: messages.serverErr,
//       ResponseStatus: responseStatus.failure,
//     })

//   }
// }


module.exports.confirmDelivery = async (req, res)=>{
  try {
    const orderId = req.body.orderId;
    const distributorId = req.email;
    const today = new Date();

    const args = [
      orderId,
      distributorId,
      today.toJSON()
    ]; 

    const result = await chaincode.invokeChaincode("confirmDeliveryByDistributor", args, false);

    if (result.success == "false"){
      return res.status(statusCode.Bad_request).json({
          messages:result.msg,
          ResponseStatus: responseStatus.failure,
      });
    }

    return res.status(statusCode.Created).json({
      messages:result.msg,
      ResponseStatus: responseStatus.success,
    });

  } catch (error) {

    console.log("distributor/confirmDelivery PUT ",error.message);

    return res.status(statusCode.InternalServerError).json({
      messages: messages.serverErr,
      ResponseStatus: responseStatus.failure,
    });

  }
}


module.exports.getAllOrdersBySuperId = async (req, res)=>{ 
  try {
      
      const superOrderId = req.body.superOrderId;

      let newArgs = [
        superOrderId,
        req.email
      ];

      let result = await chaincode.invokeChaincode("getAllOrdersBySuperIdForDistributor", newArgs, false);
      
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
      console.log("distributor/getAllOrdersBySuperId GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}
