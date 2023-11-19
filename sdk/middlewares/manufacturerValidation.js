const { body } = require("express-validator");
const { messages, responseStatus, statusCode } = require("../core/constant/constant");
const jwt = require('jsonwebtoken');
const chaincode = require("../services/fabric/chaincode");
const Manufacturer = require("../models/Manufacturer");

const MAXAGE = process.env.TOKEN_AGE;
const TOKENSECRET = process.env.JWT_SECRET_KEY;

/* Validation during registration */

module.exports.manufacturerRegistrationValidation = [

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

  body("businessRegisterationNo")
    .not()
    .isEmpty()
    .withMessage("Please enter business registeration number")
    .bail()
    .isString()
    .withMessage("Business Registeration number must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter business registeration number")
    .bail()
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("business registeration number can contain numbers and alphabets only")
    .bail()
    .isLength({ min: 21, max: 21 })
    .withMessage("Please enter a valid Business Registeration number")
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
   .bail(),
 
]



module.exports.manufacturerDrugValidation = [
  body("drugId")
     .isString()
     .withMessage("DrugID must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter your drug ID")
     .bail()
     .isLength({ min: 2, max: 20 })
     .withMessage("Please enter a valid Drug name")
     .bail(),

  body("drugName")
     .isString()
     .withMessage("Drug name must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter your drug name")
     .bail()
     .isLength({ min: 2, max: 255 })
     .withMessage("Please enter a valid Drug name")
     .bail(),
 
  body("drugDesc")
    .not()
    .isEmpty()
    .withMessage("Please provide drug description")
    .bail()
    .isString()
    .withMessage("Drug description must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Drug Description")
    .bail()
    .isLength({ min: 2, max: 2000 })
    .withMessage("Please provide a valid Drug Description")
    .bail(),
  
  body("activeIngredients")
    .notEmpty()
    .withMessage("Please enter Active Ingredients")
    .bail()
    .isArray({min: 1})
    .withMessage("Active Ingredients must me in an array")
    .bail(),
    // .custom(async (value, { req }) => {
    //   for (let index in value){
    //     value[index].ingredient = value[index].ingredient.trim();
    //     if(value[index].ingredient === ''){
    //       throw new Error("cannot pass empty strings");
    //     }

    //     value[index].quantity = value[index].quantity.trim();
    //     if(value[index].quantity === ''){
    //       throw new Error("cannot pass empty strings");
    //     }
    //   }
    // }),

  body("formulation")
    .not()
    .isEmpty()
    .withMessage("Please enter drug formulation")
    .bail()
    .isString()
    .withMessage("drug formulatino must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter drug formulation")
    .bail()
    .isLength({ min: 2, max: 255 })
    .withMessage("Please enter a valid drug formulation")
    .bail(),

  body("manufacturingProcess")
    .not()
    .isEmpty()
    .withMessage("Please enter the manufacturing process")
    .bail()
    .isString()
    .withMessage("Manufacturing process must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Manufacturing process")
    .bail()
    .isLength({ min: 2, max: 2000 })
    .withMessage("Please enter a valid Manufacturing process")
    .bail(),

  body("clinicalTrials")
    .not()
    .isEmpty()
    .withMessage("Please enter the clinical trials")
    .bail()
    .isString()
    .withMessage("Clinical trials must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Clinical trials")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Please enter a valid Clinical trials entry")
    .bail(),

  body("pharmacokinetics")
    .not()
    .isEmpty()
    .withMessage("Please enter the Pharmacokinetics")
    .bail()
    .isString()
    .withMessage("Pharmacokinetics must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Pharmacokinetics")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Please enter a valid Pharmacokinetics entry")
    .bail(),

  body("pharmacodynamics")
    .not()
    .isEmpty()
    .withMessage("Please enter the Pharmacodynamics")
    .bail()
    .isString()
    .withMessage("Pharmacodynamics must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter Pharmacodynamics")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Please enter a valid Pharmacodynamics entry")
    .bail(),

  body("adverseReactions")
    .not()
    .isEmpty()
    .withMessage("Please enter the Adverse Reactions")
    .bail()
    .isString()
    .withMessage("Adverse Reactions must be of type string.")
    .bail()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter the Adverse Reaction of your drug")
    .bail()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Please enter a valid adverse reaction entry")
    .bail(),

  body("shelfLife")
    .not()
    .isEmpty()
    .withMessage("Please enter shelf life in years")
    .bail()
    .isNumeric()
    .withMessage("shelf life must be of type number.")
    .bail()
    .matches(/^\d+$/)
    .withMessage("shelf life(in years) can contain numbers only")
    .bail()
    .isLength({ min: 0.1, max: 100 })
    .withMessage("Please enter a valid shelf life.")
    .bail(),

  body("packaging.unit")
    .not()
    .isEmpty()
    .withMessage("Please enter the package unit (mg,ml)")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Please enter the package unit (mg,ml)")
    .bail()
    .isString()
    .withMessage("unit must be of type string.")
    .bail()
    .custom(async (value, { req }) => {
      if(value !== "mg" && value !== "ml"){
        throw new Error("Invalid unit");
      }
  }),

  body("packaging.quantity")
    .not()
    .isEmpty()
    .withMessage("Please enter the package quantity")
    .bail()
    .isNumeric()
    .withMessage("unit must be of type number.")
    .bail(),
  
  body("fdaRegulations")
    .not()
    .isEmpty()
    .withMessage("Please check if your drug meets fda regulations")
    .bail()
    .isBoolean()
    .withMessage("FDA regulation entry must of boolean type")
    .bail(),

  body("gmpGuidlines")
    .not()
    .isEmpty()
    .withMessage("Please check if the drug manufacturing process is under the GMP guildlines")
    .bail()
    .isBoolean()
    .withMessage("GMP guidlines entry must of boolean type")
    .bail(),

  // body("stock")
  //   .not()
  //   .isEmpty()
  //   .withMessage("Please enter the stock quantity")
  //   .bail()
  //   .isInt()
  //   .withMessage("stock must be of type number.")
  //   .bail()
  //   .custom(async (value, {req }) => {
  //     if(value < 0){
  //       throw new Error("Stock must equal or greater than 0.");
  //     }
  //   }),
];

module.exports.confirmOrderValidation = [
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
];


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
     .not()
     .isEmpty()
     .withMessage("Please enter your status")
     .bail()
     .isString()
     .withMessage("status must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter your status")
     .bail()
     .isLength({ min: 2, max: 50})
     .withMessage("Please enter a valid status")
     .bail()
     .custom(async (value, {req})=>{
      // value = value.toLowerCase();
        if( value != 'processed' && value != 'underQualityCheck' && value != "readyToShip" && value != "cancelled" && value != "shipped"){
          throw new Error("Invalid entry for status");
        }
        if( value == "cancelled" ){
          
          var cancelledReason = req.body.cancelledReason;
          if(cancelledReason == undefined){
            throw new Error("Please enter the cancelling reason");
          }
        }
        req.body.status = value;
     }),

    body("cancelledReason")
     .optional()
     .isString()
     .withMessage("reason must be of type string.")
     .bail()
     .trim()
     .not()
     .isEmpty()
     .withMessage("Please enter the reason to cancel this order")
     .bail()
     .isLength({ min: 10, max: 2000 })
     .withMessage("Please enter a valid reason")
     .bail(),
];


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
              const manufacturerFromCC = await chaincode.invokeChaincode("fetchRecordWithEmail", data.data.email, true);
              console.log("manufacturerFromCC ",manufacturerFromCC);

              if(manufacturerFromCC.success == "false"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.requireLogin, ResponseStatus: responseStatus.failure })
              }

              if(manufacturerFromCC.data[0].role != "manufacturer"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              if(manufacturerFromCC.data[0].profileStatus != "active"){
                return res.status(statusCode.Bad_request).json({ Messages: messages.statusError, ResponseStatus: responseStatus.failure })
              }

              req.email = data.data.email;
              req.profileStatus = manufacturerFromCC.data[0].profileStatus;
              next();
          }
      })

  } catch (error) {
      return res.status(statusCode.Bad_request).json({ Messages: error.message, ResponseStatus: responseStatus.failure })
  }
};
