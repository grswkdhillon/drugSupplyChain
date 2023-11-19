const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const bcrypt = require("bcrypt");
const {generateKey} = require("../helper/helperFunctions");

const chaincode = require('../services/fabric/chaincode');


const jwt = require("jsonwebtoken");

// create json web token
const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;


module.exports.login = async (req, res) => {
    
    try {   
      let adminFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", req.body.email, true);
      console.log("adminFromCC ", adminFromCC);

      if (adminFromCC.success == "false"){
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }
  
      const data = {
        email: adminFromCC.data[0].email,
        role: 'admin'
      };

      // if correct password allow login and create jwt token
      if (await bcrypt.compare(req.body.password, adminFromCC.data[0].password)) {

        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
        });
  
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

        const EMAIL = req.body.email;
        const PASSWORD = req.body.password;
        const ADMIN_KEY = req.body.passPhrase;  

        const salt = await bcrypt.genSalt();
        const encPass = await bcrypt.hash(PASSWORD, salt);
        
        let newAdminCC = await chaincode.invokeChaincode("checkEmailExistence", EMAIL, true);
        
        console.log("newAdminCC", newAdminCC.success);

        if(newAdminCC.success == "true"){
          console.log("in the block");
          return res.status(statusCode.Bad_request).json({
            messages:messages.userExists,
            ResponseStatus: responseStatus.failure,
          });
        }

        let key = generateKey();

        let newArgs = [
          EMAIL, 
          encPass,
          ADMIN_KEY,
          "active",
          key,
          "admin",
        ];


        let result = await chaincode.invokeChaincode("regAdmin", newArgs, false);

        console.log("result from the chaincode ", result);
        
        if(result.success == "false"){
            return res.status(statusCode.Bad_request).json({
                messages:result.msg,
                ResponseStatus: responseStatus.failure,
            });    
        }
        
        return res.status(statusCode.Created).json({
            messages:messages.register,
            ResponseStatus: responseStatus.success,
        });

    } catch (error) {
        console.log("admin/registeration POST ",error.message);
        return res.status(statusCode.InternalServerError).json({
            messages:messages.serverErr,
            ResponseStatus: responseStatus.failure,
        });
    }
}

module.exports.getUsers = async(req, res)=>{
    const profileStatus = req.body.profileStatus;
    const args = [profileStatus];
    const users = await chaincode.invokeChaincode("getUsersByProfileStatus", args, true);
    console.log(users);

    if(users.success == "false"){
        return res.status(statusCode.Not_Found).json({
            messages:users.msg,
            ResponseStatus: responseStatus.failure,
        });
    }

    return res.status(statusCode.Ok).json({
        messages:messages.fetchSuccess,
        ResponseStatus: responseStatus.success,
        data: users.data
    });
}

module.exports.changeStatus = async(req, res)=>{
    const userEmail = req.body.userEmail;
    const newStatus = req.body.newStatus;
    const today = new Date();

    console.log(req.body);
    const args = [userEmail, newStatus, today.toJSON()];

    const users = await chaincode.invokeChaincode("changeProfileStatus", args, false);
    console.log(users);

    if(users.success == "false"){
        return res.status(statusCode.Not_Found).json({
            messages:users.msg,
            ResponseStatus: responseStatus.failure,
        });
    }

    return res.status(statusCode.Created).json({
        messages:users.msg,
        ResponseStatus: responseStatus.success,
    });
}



module.exports.getUsersByRole = async(req, res)=>{
  const args = [req.body.role];
  const users = await chaincode.invokeChaincode("getUsersByRole", args, true);

  if(users.success == "false"){
      return res.status(statusCode.Not_Found).json({
          messages:users.msg,
          ResponseStatus: responseStatus.failure,
      });
  }

  return res.status(statusCode.Ok).json({
      messages:messages.fetchSuccess,
      ResponseStatus: responseStatus.success,
      data: users.data
  });
}

module.exports.deleteUserById = async(req, res)=>{
  try{
    const userId = req.body.userId;
    const today = new Date();

    const newArgs = [
      userId,
      today.toJSON()
    ]

    const result = await chaincode.invokeChaincode("deleteUserById", newArgs, false);

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

  }catch(error){
    console.log("admin/deleteUserById Delete ",error.message);
    return res.status(statusCode.InternalServerError).json({
        messages:messages.serverErr,
        ResponseStatus: responseStatus.failure,
    });  
  }
}

module.exports.getHistoryByKey = async(req, res)=>{

    try{

      const key = req.body.key;
      
      const history = await chaincode.invokeChaincode("getHistoryByKey", [key], true);

      if(history.success == "false"){
        return res.status(statusCode.Not_Found).json({
            messages:history.msg,
            ResponseStatus: responseStatus.failure,
        });
      }

      return res.status(statusCode.Created).json({
        messages:history.msg,
        ResponseStatus: responseStatus.success,
        data: history
      }); 
    
    }catch(error){

      console.log("admin/getHistoryByKey GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      }); 
    }
  }

module.exports.getRecordsByDocType = async(req, res)=>{

  try{
    const doctype = req.body.docType;
    const records = await chaincode.invokeChaincode("getRecordsByDocType", [doctype], true);
  
    if(records.success == "false"){
      return res.status(statusCode.Not_Found).json({
          messages:records.msg,
          ResponseStatus: responseStatus.failure,
      });
    }
    
    return res.status(statusCode.Created).json({
      messages:messages.fetchSuccess,
      ResponseStatus: responseStatus.failure,
      data: records.data
    });

  }catch(error){
      console.log("admin/getRecordsByDocType GET ",error.message);
      return res.status(statusCode.InternalServerError).json({
          messages:messages.serverErr,
          ResponseStatus: responseStatus.failure,
      }); 
  }
  
}