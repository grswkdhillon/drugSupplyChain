const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const { hash, compare } = require("bcrypt");
const {generateKey} = require("../helper/helperFunctions");

const chaincode = require('../services/fabric/chaincode');

const jwt = require("jsonwebtoken");

const QualityAnalysts = require("../models/QualityAnalysts");

// create json web token
const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;

const createToken = (data) => {
  return jwt.sign(data, TOKENSECRET, {
    expiresIn: MAXAGE
  });
};

module.exports.login = async (req, res) => {
    
    try {   
      let qaFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", req.body.email, true);
      console.log("qaFromCC ", qaFromCC);

      if (qaFromCC.success == "false" ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }

      const qaData = await QualityAnalysts.findOne({
        email: req.body.email,
      });
  
      // if users email doesnot exists return error
      if (!qaData ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.userExistsConflict,
          ResponseStatus: responseStatus.failure,
        });
      }
  
    //   const userId = qaData._id.toHexString();
      const data = {
        id: qaData._id.toHexString(),
        email: qaData.email,
        role: 'qualityAnalyst'
      };

      // if correct password allow login and create jwt token
      if (await compare(req.body.password, qaData.password) && qaData.password === qaFromCC.data[0].password) {
        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
        });

        if(qaFromCC.data[0].profileStatus != "active"){
          return res.status(statusCode.Bad_request).json({
            message: messages.profileStatusConflict+`${qaFromCC.data[0].profileStatus}`+messages.contactAdmin,
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

        const qaDetails = {
            organizationName: req.body.organizationName,
            businessAddress: {
              streetNo: req.body.businessAddress.streetNo, 
              state: req.body.businessAddress.state, 
              city: req.body.businessAddress.city, 
              pincode: req.body.businessAddress.pincode, 
            },
            phone: req.body.phone, 
            licenseNumber: req.body.licenseNumber,
            validity: req.body.validity,
            areaOfExpertise: req.body.areaOfExpertise,
            qualityAssuranceProcedures: req.body.qualityAssuranceProcedures,
            email: req.body.email, 
            password: req.body.password,
        }; 

        console.log("qa/registeration POST qaDetails ", qaDetails);
       
        // checking in chaincode if it exists
        let newQACC = await chaincode.invokeChaincode("checkEmailExistence", qaDetails.email, true);
        console.log("newQACC", newQACC.success);

        if(newQACC.success == "true"){
          return res.status(statusCode.Bad_request).json({
            messages:messages.userExists,
            ResponseStatus: responseStatus.failure,
          });
        }

        // finding in mongodb
        let newQA = await QualityAnalysts.findOne({email: qaDetails.email});
        if (newQA){
            return res.status(statusCode.Bad_request).json({
                messages:messages.userExistsConflict,
                ResponseStatus: responseStatus.failure,
            });
        }

        // creating a new user
        newQA = await QualityAnalysts.create(qaDetails);
        let key = generateKey();

        let newArgs = [
          newQA.organizationName,
          newQA.businessAddress.streetNo,
          newQA.businessAddress.state,
          newQA.businessAddress.city,
          newQA.businessAddress.pincode,
          newQA.phone,
          newQA.licenseNumber,
          newQA.validity,
          JSON.stringify(newQA.areaOfExpertise),
          JSON.stringify(newQA.qualityAssuranceProcedures),
          newQA.email,
          newQA.password,
          newQA.profileStatus,
          key,
          newQA.role,
        ];


        let result = await chaincode.invokeChaincode("regQA", newArgs, false);

        console.log("result from the chaincode ", result.success, result.msg);
        // const token = createToken({id: newManufacturer._id, role: "manufacturer"});
        // res.cookie('jwt', token, { httpOnly: true, MAXAGE: MAXAGE * 1000 });
        
        return res.status(statusCode.Created).json({
            messages:messages.register,
            ResponseStatus: responseStatus.success,
        });

    } catch (error) {
        console.log("qa/registeration POST ",error.message);
        return res.status(statusCode.InternalServerError).json({
            messages:messages.serverErr,
            ResponseStatus: responseStatus.failure,
        });
    }
}

// module.exports.simpleRegister = async (req, res)=>{
//     console.log(req.body);
//     res.send(req.body);
// }
