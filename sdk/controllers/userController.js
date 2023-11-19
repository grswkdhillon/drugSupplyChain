const Manufacturer = require("../models/Manufacturer.js");
const { hash, compare } = require("bcrypt");
const {
  messages,
  responseStatus,
  statusCode,
} = require("../core/constant/constant.js");

const jwt = require("jsonwebtoken");

const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;


module.exports.login = async (req, res) => {
    
    try {   
      const UsersData = await Manufacturer.findOne({
        email: req.body.email,
      });
  
      // if users email doesnot exists return error
      if (!UsersData ) {
        return res.status(statusCode.Bad_request).json({
          message: messages.unauthorizedEmail,
          ResponseStatus: responseStatus.failure,
        });
      }
  
    //   const userId = UsersData._id.toHexString();
      const data = {
        id: UsersData._id.toHexString(),
        role: 'manufacturer'
      };

      // if correct password allow login and create jwt token
      if (await compare(req.body.password, UsersData.password)) {
        const token = jwt.sign({ data }, TOKENSECRET, {
          expiresIn: MAXAGE,
        });
  
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