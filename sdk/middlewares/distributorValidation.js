const { body } = require("express-validator");
const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const jwt = require('jsonwebtoken');
const chaincode = require("../services/fabric/chaincode");

/* Validation during registration */

module.exports.distributorRegistrationValidation = [
  /*------------validation for Name--------------*/

  /*
     name cannot be null
     name cannot contain number or special characters
     name must have atleast 2 characters
  */

  body("organizationName")
    .isString()
    .withMessage("Organization name must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter your organization name")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid organization name")
    .bail(),

  body("businessAddress.streetNo")
    .not()
    .isEmpty()
    .withMessage("Please enter street No")
    .bail()
    .isString()
    .withMessage("Street number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter street No")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid street number")
    .bail(),

  body("businessAddress.state")
    .not()
    .isEmpty()
    .withMessage("Please enter state name")
    .bail()
    .isString()
    .withMessage("state name must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter state name")
    .bail()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("state name can contain alphabets only")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid state name")
    .bail(),

  body("businessAddress.city")
    .not()
    .isEmpty()
    .withMessage("Please enter city") 
    .bail()
    .isString()
    .withMessage("city name must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter city")
    .bail()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("city name can contain alphabets only")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid city name")
    .bail(),

  body("businessAddress.pincode")
    .not()
    .isEmpty()
    .withMessage("Please enter pincode")
    .bail()
    .isNumeric()
    .withMessage("Pincode number must be of type number.")
    .bail()
    .matches(/^\d+$/)
    .withMessage("pincode name can contain numbers only")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Please enter a valid pincode number")
    .bail(),

  body("phone")
    .not()
    .isEmpty()
    .withMessage("Please enter phone number")
    .bail()
    .isNumeric()
    .withMessage("phone number must be of type number.")
    .bail()
    .matches(/^\d+$/)
    .withMessage("phone number can contain numbers only")
    .bail()
    .isLength({ min: 10, max: 10 })
    .withMessage("Please enter a valid phone number")
    .bail(),

  body("aadhaar")
    .not()
    .isEmpty()
    .withMessage("Please enter aadhaar number")
    .bail()
    .isString()
    .withMessage("aadhaar card number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter aadhaar card Number")
    .bail()
    .matches(/^\d+$/)
    .withMessage("aadhaar card number can contain numbers only")
    .bail()
    .isLength({ min: 12, max: 12 })
    .withMessage("Please enter a valid aadhaar card number")
    .bail(),

  body("licenseNumber")
    .not()
    .isEmpty()
    .withMessage("Please enter license number")
    .bail()
    .isString()
    .withMessage("license Number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter license Number")
    .bail()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("license Number can contain numbers and alphabets only")
    .bail()
    .isLength({ min: 5, max: 15 })
    .withMessage("Please enter a valid license Number")
    .bail(),

  body("validity")
    .not()
    .isEmpty()
    .withMessage("Please enter license expiry date")
    .bail()
    .isString()
    .withMessage("license expiry date must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter license expiry date")
    .bail()
    .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    .withMessage("Please enter a valid expiry date")
    .bail()
    .custom(async (value, {req})=>{

      if(new Date(value) == "Invalid Date"){
        throw new Error("Invalid Expiry date type");
      }
      // if(value.split("-")[0])

      today = new Date().toJSON().split('T')[0];
      if(today >= value){
        throw new Error("your license is already expired");
      }
    }),

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

  /*------------validation for Email--------------*/
  /*
   email cannot be empty
   mail must be a valid mail id
   */
  // /*------------validation for plan--------------*/
  // /**
  //  * plan field cannot be empty
  //  * chose plan between available options only
  //  */

  // body("plan")
  //   .not()
  //   .isEmpty()
  //   .trim()
  //   .withMessage("Enter plan")
  //   .bail()
  //   .isIn(["basic", "intermediate", "enterprise"])
  //   .withMessage(
  //     "Invalid plan type. Please choose plan between basic, intermediate, or enterprise."
  //   )
  //   .bail(),
];

module.exports.changePasswordValidation = [
  /*------------validation for Password--------------*/
  /*
     password cannot be empty
     Password must have atleast 4 characters
     */
  body("password")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Enter Password")
    .bail()
    .isLength({ min: 4 })
    .withMessage("Password must have atleast 4 characters ")
    .bail(),

  /*------------validation for Confirm Password--------------*/
  /**
   * confirm password field cannot be empty
   * must match with password field value
   */
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

// module.exports.manufacturerRegisterValidator = [
//   /*------------validation for Name--------------*/

//   /*
//      check if name exists first
//      name cannot be null
//      name cannot contain number or special characters
//      name must have atleast 2 characters
//     */

//   body("name")
//     .if(body("name").exists())
//     .not()
//     .isEmpty()
//     .trim()
//     .withMessage("Enter name")
//     .bail()
//     .matches(/^[A-Za-z\s]+$/)
//     .withMessage("Name cannot contain number or special characters")
//     .bail()
//     .isLength({ min: 2 })
//     .withMessage("Name must have atleast 2 characters")
//     .bail(),

//   /*------------validation for plan--------------*/
//   /**
//    * plan field cannot be empty
//    * chose plan between available options only
//    */

//   body("plan")
//     .if(body("plan").exists())
//     .not()
//     .bail()
//     .isEmpty()
//     .trim()
//     .withMessage("Enter plan")
//     .isIn(["basic", "intermediate", "enterprise"])
//     .withMessage(
//       "Invalid plan type. Please choose plan between basic, intermediate, or enterprise."
//     )
//     .bail(),
// ];


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
    .bail(),

];

module.exports.confirmOrderValidation = [

  body("orderId")
    .not()
    .isEmpty()
    .withMessage("Enter Order Id")
    .bail()
    .isString()
    .withMessage("Order ID must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Enter OrderId")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Please enter valid order ID.")
    .bail(),
]

module.exports.updateStatusValidation = [
  body("orderId")
     .isString()
     .withMessage("Order ID must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter your Order ID")
     .bail()
     .isLength({ min: 2})
     .withMessage("Please enter a valid Order ID")
     .bail(),

  body("status")
     .isString()
     .withMessage("status must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter your status")
     .bail()
     .isLength({ min: 2})
     .withMessage("Please enter a valid status")
     .bail()
     .custom(async (value, {req})=>{
      value = value.toLowerCase();
        if(value != 'processed' && value != "readyToShip" && value != "shipped"){
          throw new Error("Invalid entry for status");
        }
        req.body.status = value;
     }),
];

module.exports.jwtAuthenticationMiddleware = async (req, res, next) => {
  console.log("jwtAuthenticationMiddleware");
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
              const distributorFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", data.data.email, true);
              console.log("distributorFromCC ",distributorFromCC);

              if(distributorFromCC.success == "false"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.requireLogin, ResponseStatus: responseStatus.failure })
              }

              if(distributorFromCC.data[0].role != 'distributor'){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              if(distributorFromCC.data[0].profileStatus != "active"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              req.email = data.data.email;
              req.profileStatus = distributorFromCC.data[0].profileStatus;
              next();
          }
      })

  } catch (error) {
      return res.status(statusCode.Bad_request).json({ Messages: error.message, ResponseStatus: responseStatus.failure })
  }
};
