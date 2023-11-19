const { body } = require("express-validator");

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