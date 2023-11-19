const { body } = require("express-validator");
const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const jwt = require('jsonwebtoken');
const chaincode = require("../services/fabric/chaincode");
const Manufacturer = require("../models/Manufacturer");

const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;

/* Validation during registration */

module.exports.adminRegistrationValidation = [

  body("email")
    .not()
    .isEmpty()
    .withMessage("Enter Email")
    .bail()
    .isString()
    .withMessage("email must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter Email")
    .bail()
    .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .withMessage("Please Enter Valid Email")
    .bail(),
  
  body("password")
    .not()
    .isEmpty()
    .withMessage("Enter Password")
    .bail()
    .isString()
    .withMessage("password must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter Password")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must have atleast 6 characters ")
    .bail(),

  body("passPhrase")
    .not()
    .isEmpty()
    .withMessage("Enter passPhrase")
    .bail()
    .isString()
    .withMessage("admin key must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter passPhrase")
    .bail()
    .isLength({ min: 5 })
    .withMessage("Admin Key must have atleast 5 characters ")
    .bail(),
  
  body("confirmPassword")
    .not()
    .isEmpty()
    .withMessage("Enter confirmPassword")
    .bail()
    .isString()
    .withMessage("confirm password must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter confirmPassword")
    .bail()
    .custom(async (value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password and Confirm password must be same");
      }
    }),
];

module.exports.changePasswordValidation = [
 
  body("password")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter Password")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Password must have atleast 4 characters ")
    .bail(),

  body("confirmPassword")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter confirmPassword")
    .bail()
    .custom(async (value, { req }) => {
      if (value != req.body.password) {
        throw new Error("Password and Confirm password must be same");
      }
    }),
];



module.exports.loginValidation = [
  
   body("email")
   .not()
   .isEmpty()
   .withMessage("Enter Email")
   .bail()
   .isString()
   .withMessage("email must be of type string.")
   .bail()
   .trim()
   .not()
   .isEmpty()
   .withMessage("Enter Email")
   .bail()
   .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
   .withMessage("Please Enter Valid Email")
   .bail(),
 
 body("password")
   .not()
   .isEmpty()
   .withMessage("Enter Password")
   .bail()
   .isString()
   .withMessage("password must be of type string.")
   .bail()
   .trim()
   .not()
   .isEmpty()
   .withMessage("Enter Password")
   .bail()
   .isLength({ min: 6 })
   .withMessage("Password must have atleast 6 characters ")
   .bail()
 
]

module.exports.getUsersValidation = [

  body("profileStatus")
  .not()
  .isEmpty()
  .withMessage("Please enter profile Status")
  .bail()
  .isString()
  .withMessage("Profile status must be of type string.")
  .bail()
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please enter Profile status")
  .bail()
  .custom(async (value, { req }) => {
    if (value != 'inactive' && value != 'deleted' && value != 'active') {
      throw new Error("Invalid profile status");
    }
  }),

];

module.exports.updateStatusValidation = [

    body("userEmail")
    .not()
    .isEmpty()
    .withMessage("Enter Email")
    .bail()
    .isString()
    .withMessage("email must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter Email")
    .bail()
    .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
    .withMessage("Please Enter Valid Email")
    .bail(),
 
    body("newStatus")
    .not()
    .isEmpty()
    .withMessage("Please enter profile Status")
    .bail()
    .isString()
    .withMessage("Profile status must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Profile status")
    .bail()
    .custom(async (value, { req }) => {
        if (value != 'inactive' && value != 'deleted' && value != 'active') {
        throw new Error("Invalid profile status");
        }
    }),

]



module.exports.getUsersByRoleValidation = [

  body("role")
  .not()
  .isEmpty()
  .withMessage("Please enter role")
  .bail()
  .isString()
  .withMessage("Role status must be of type string.")
  .bail()
  .trim()
  .not()
  .isEmpty()
  .withMessage("Please enter Role.")
  .bail()
  .custom(async (value, { req }) => {
      if (value != 'distributors' && value != 'retailers' && value != 'admins' && value != 'manufacturers' ) {
      throw new Error("Invalid role.");
      }
  }),

]




module.exports.deleteUserByIdValidation = [

  body("userId")
  .not()
  .isEmpty()
  .withMessage("Enter Email")
  .bail()
  .isString()
  .withMessage("Email must be of type string.")
  .bail()
  .trim()
  .not()
  .isEmpty()
  .withMessage("Enter Email")
  .bail()
  .matches(/^(?!\d+@)\w+([-+.']\w+)*@(?!\d+\.)\w+([-.]\w+)*\.\w+([-.]\w+)*$/)
  .withMessage("Please Enter Valid Email")
  .bail()

]



module.exports.jwtAuthenticationMiddleware = async (req, res, next) => {
  try {
      let jwt_token = req.headers.authorization;
      // console.log(jwt_token,"jwt_token");

      // check if token exists or not and that too in bearer part also
      if (!jwt_token || !req.headers.authorization.startsWith('Bearer')) {
          return res.status(statusCode.Bad_request).json({ Message: messages.TokenError, ResponseStatus: responseStatus.failure })
      }
      
      // to have only the token, removing unnecessary bearer part from token
      jwt_token = (req.headers.authorization).split(' ')[1]
      // console.log(jwt_token,"token after short");


      // verify the token given by user for authentication
      jwt.verify(jwt_token, process.env.JWT_SECRET_KEY, async (err, data) => {
          if (err) {
              return res.status(statusCode.Bad_request).json({ Messages: err.message ,ResponseStatus: responseStatus.failure});
          } else {
            console.log("data ", data);
              const adminFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", data.data.email, true);
              console.log("adminFromCC ",adminFromCC);

              if(adminFromCC.success == "false"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.requireLogin, ResponseStatus: responseStatus.failure })
              }
              console.log(adminFromCC.data);
              if(adminFromCC.data[0].role != 'admin'){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              if(adminFromCC.data[0].profileStatus != "active"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              req.email = data.email;
              req.profileStatus = adminFromCC.data[0].profileStatus;
              next();
          }
      })

  } catch (error) {
      return res.status(statusCode.Bad_request).json({ Messages: error.message, ResponseStatus: responseStatus.failure })
  }
};
