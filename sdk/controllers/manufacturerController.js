const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const { hash, compare } = require("bcrypt");
const {generateKey} = require("../helper/helperFunctions");

const chaincode = require('../services/fabric/chaincode');


const jwt = require("jsonwebtoken");

const Manufacturer = require("../models/Manufacturer");
const Drug = require("../models/Drug");

// create json web token
const MAXAGE = process.env.TOKEN_AGE ;
const TOKENSECRET = process.env.JWT_SECRET_KEY;


module.exports.login = async (req, res) => {
    
    try {   
      let manufacturerFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", req.body.email, true);
      console.log("manufacturerFromCC ", manufacturerFromCC);

      if (manufacturerFromCC.success == "false"){
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }

      const manufacturerData = await Manufacturer.findOne({
        email: req.body.email,
      }); 
  
      // if users email doesnot exists return error
      if (!manufacturerData ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.userExistsConflict,
          ResponseStatus: responseStatus.failure,
        });
      }
  
      const data = {
        id: manufacturerData._id.toHexString(),
        email: manufacturerData.email,
        role: 'manufacturer'
      };

      // if correct password allow login and create jwt token
      if (await compare(req.body.password, manufacturerData.password) && manufacturerData.password === manufacturerFromCC.data[0].password) {

        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
        });

        if(manufacturerFromCC.data[0].profileStatus != "active"){
          return res.status(statusCode.Bad_request).json({
            message: messages.profileStatusConflict+`${manufacturerFromCC.data[0].profileStatus}`+messages.contactAdmin,
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
        let today = new Date();

        const manufacturerDetails = {
            organizationName: req.body.organizationName,
            businessAddress: {
              streetNo: req.body.businessAddress.streetNo,
              state: req.body.businessAddress.state, 
              city: req.body.businessAddress.city, 
              pincode: req.body.businessAddress.pincode
            },
            phone: req.body.phone, 
            businessRegisterationNo: req.body.businessRegisterationNo, 
            gstin: req.body.gstin,
            email: req.body.email, 
            password: req.body.password,
        }; 

        console.log("manufacturer /registeration POST manufacturerDetails ", manufacturerDetails);
        
        // checking in chaincode if it exists
        let newManufacturerCC = await chaincode.invokeChaincode("checkEmailExistence", manufacturerDetails.email, true);
        
        console.log("newManufacturerCC", newManufacturerCC.success);
        console.log(typeof newManufacturerCC.success);
        
        if(newManufacturerCC.success == "true"){
          console.log("in the block");
          return res.status(statusCode.Bad_request).json({
            messages:messages.userExists,
            ResponseStatus: responseStatus.failure,
          });
        }


        let newManufacturer = await Manufacturer.findOne({email: manufacturerDetails.email});
        
        if(newManufacturer){
          return res.status(statusCode.Bad_request).json({
            messages:messages.userExistsConflict,
            ResponseStatus: responseStatus.failure,
          });
        }

        // user does not exists
        newManufacturer = await Manufacturer.create(manufacturerDetails);
        let key = generateKey();

        let newArgs = [
          newManufacturer.organizationName,
          newManufacturer.businessAddress.streetNo,
          newManufacturer.businessAddress.state,
          newManufacturer.businessAddress.city,
          newManufacturer.businessAddress.pincode,
          newManufacturer.phone, 
          newManufacturer.businessRegisterationNo, 
          newManufacturer.gstin,
          newManufacturer.email, 
          newManufacturer.password,
          newManufacturer.profileStatus,
          key,
          newManufacturer.role,
          today.toJSON()
        ];


        let result = await chaincode.invokeChaincode("regManufacturer", newArgs, false);

        console.log("result from the chaincode ", result);
        // const token = createToken({id: newManufacturer._id, role: "manufacturer"});
        // res.cookie('jwt', token, { httpOnly: true, MAXAGE: MAXAGE * 1000 });
        
        return res.status(statusCode.Created).json({
            messages:messages.register,
            ResponseStatus: responseStatus.success,
        });

    } catch (error) {
        console.log("customer/registeration POST ",error.message);
        return res.status(statusCode.InternalServerError).json({
            messages:messages.serverErr,
            ResponseStatus: responseStatus.failure,
        });
    }
}


module.exports.addDrug = async(req, res)=>{
  let key = generateKey();
  let today = new Date();

  try {

      const drugDetails = [
          req.body.drugId,
          req.body.drugName,
          req.body.drugDesc, 
          JSON.stringify(req.body.activeIngredients), 
          req.body.formulation, 
          req.body.manufacturingProcess, 
          req.body.clinicalTrials, 
          req.body.pharmacokinetics, 
          req.body.pharmacodynamics,
          req.body.adverseReactions,
          req.body.shelfLife,
          JSON.stringify(req.body.packaging),
          req.body.fdaRegulations,
          req.body.gmpGuidlines,
          req.email,
          key,
          today.toJSON()
      ]; 

      console.log("manufacturer/addDrug POST drugDetails", drugDetails);

      const newDrug = await chaincode.invokeChaincode("addDrug", drugDetails, false);
      // let newDrug = await Manufacturer.findOne({email: drugDetails.email});
      if (newDrug.success == false){
        return res.status(statusCode.Bad_request).json({
            messages:newDrug.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          messages:newDrug.msg,
          ResponseStatus: responseStatus.success,
      });

  } catch (error) {
      console.log("manufacturer/addDrug POST ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.getDrugs = async(req, res)=>{

  try {

      const args = [
          req.email,
      ]; 

      const drugs = await chaincode.invokeChaincode("getDrugs", args, true)      
      if (drugs.success == "false"){
        return res.status(statusCode.Bad_request).json({
            messages:drugs.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          messages: messages.fetchSuccess,
          ResponseStatus: responseStatus.success,
          data: drugs.data
      });

  } catch (error) {
      console.log("manufacturer/getDrug GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}

module.exports.showOrders = async(req, res)=>{

  try {

      const args = [
          req.email,
      ]; 

      const drugs = await chaincode.invokeChaincode("fetchOrdersForManufacturers", args, true)      
      if (drugs.success == "false"){
        return res.status(statusCode.Bad_request).json({
            messages:drugs.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          messages: messages.fetchSuccess,
          ResponseStatus: responseStatus.success,
          data: drugs.data
      });

  } catch (error) {
      console.log("manufacturer/getDrug GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}



module.exports.confirmOrder = async(req, res)=>{

  try {
      const today = new Date();

      const args = [
          req.body.orderId,
          req.email,
          today.toJSON()
      ]; 

      const result = await chaincode.invokeChaincode("confirmOrderForManufacturer", args, false)      
      if (result.success == "false"){
        return res.status(statusCode.Bad_request).json({
            messages:result.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          messages: result.msg,
          ResponseStatus: responseStatus.success
      });

  } catch (error) {
      console.log("manufacturer/getDrug GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}


module.exports.receivedOrders = async(req, res)=>{

  try {

      const args = [
          req.email,
      ]; 

      const drugs = await chaincode.invokeChaincode("receivedOrdersForManufacturer", args, true)      
      if (drugs.success == "false"){
        return res.status(statusCode.Bad_request).json({
            messages:drugs.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
          messages: messages.fetchSuccess,
          ResponseStatus: responseStatus.success,
          data: drugs.data
      });

  } catch (error) {
      console.log("manufacturer/getDrug GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      });
  }
}

module.exports.updateStatus = async(req, res)=>{
  try {
    const orderId = req.body.orderId;
    const status = req.body.status;
    const today = new Date();

    const args = [
        orderId,
        status,
        req.email,
        today.toJSON()
    ]; 
    
    if(status == "cancelled"){
      const cancelledReason = req.body.cancelledReason;
      args.push(cancelledReason);
    }

    const result = await chaincode.invokeChaincode("updateOrderStatusForManufacturer", args, false);

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

    console.log("manufacturer/statusUpdate PUT ",error.message);

    return res.status(statusCode.InternalServerError).json({
      messages: messages.serverErr,
      ResponseStatus: responseStatus.failure,
    })

  }
}

