const { body } = require("express-validator");
const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const jwt = require("jsonwebtoken");
const chaincode = require('../services/fabric/chaincode');



/* Validation during registration */

module.exports.retailerRegistrationValidation = [
  /*------------validation for Name--------------*/

  /*
     name cannot be null
     name cannot contain number or special characters
     name must have atleast 2 characters
  */

  body("fullName")
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .isString()
    .withMessage("Name must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter your name")
    .bail()
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Street number can contain aphabets only")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid name")
    .bail(),

  body("storeName")
    .not()
    .isEmpty()
    .withMessage("Please enter your shop name")
    .bail()
    .isString()
    .withMessage("Shop name must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter your shop name")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid shop name")
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

  body("gstin")
    .not()
    .isEmpty()
    .withMessage("Please enter gstin number")
    .bail()
    .isString()
    .withMessage("gst number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter gstin number")
    .bail()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("gstin number can contain numbers and alphabets only")
    .bail()
    .isLength({ min: 15, max: 15 })
    .withMessage("Please enter a valid gstin number")
    .bail(),

  body("pancard")
    .not()
    .isEmpty()
    .withMessage("Please enter pancard number")
    .bail()
    .isString()
    .withMessage("pancard number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter pancard number")
    .bail()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("pancard number can contain numbers and alphabets only")
    .bail()
    .isLength({ min: 10, max: 10 })
    .withMessage("Please enter a valid pancard number")
    .bail(),

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


module.exports.retailerPlaceOrderValidation = [
  /*------------validation for Name--------------*/

  /*
     name cannot be null
     name cannot contain number or special characters
     name must have atleast 2 characters
  */

  // body("drugId")
  // .bail()
  // .trim()
  // .not()
  // .isEmpty()
  // .withMessage("Please enter your drug ID")
  // ,

  // body("quantity")
  //   .not()
  //   .isEmpty()
  //   .withMessage("Please enter your quantity")
  //   .bail()
  //   .isNumeric()
  //   .withMessage("Shop name must be of type nummber.")
  //   .bail()
  //   .isLength({ min: 1, max: 1000 })
  //   .withMessage("Please enter a valid quatity.")
  //   .bail(),

  body("deliveryAddress.streetNo")
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

  body("deliveryAddress.state")
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

  body("deliveryAddress.city")
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

  body("deliveryAddress.pincode")
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

]


module.exports.orderValidation = [

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
              const retailerFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", data.data.email, true);
              console.log("retailerFromCC ",retailerFromCC);

              if(retailerFromCC.success == "false"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.requireLogin, ResponseStatus: responseStatus.failure })
              }

              if(retailerFromCC.data[0].role != 'retailer'){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              if(retailerFromCC.data[0].profileStatus != "active"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              req.email = data.data.email;
              req.profileStatus = retailerFromCC.data[0].profileStatus;
              next();
          }
      })

  } catch (error) {
      return res.status(statusCode.Bad_request).json({ Messages: error.message, ResponseStatus: responseStatus.failure })
  }
};
