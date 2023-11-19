const express= require('express');
const router = express.Router();

const retailerController = require('../controllers/retailerController');

const {retailerRegistrationValidation, loginValidation, jwtAuthenticationMiddleware, retailerPlaceOrderValidation, orderValidation} = require('../middlewares/retailerValidation.js');
const {validateExpressValidatorResult} = require('../helper/validationError.js');



router.post('/register', retailerRegistrationValidation, validateExpressValidatorResult, retailerController.register);
router.post('/login', loginValidation, validateExpressValidatorResult, retailerController.login);
router.get('/showDrugs', jwtAuthenticationMiddleware,retailerController.showDrugs);
router.post('/placeOrder', jwtAuthenticationMiddleware, retailerPlaceOrderValidation, validateExpressValidatorResult, retailerController.placeOrder);
router.get('/myOrders', jwtAuthenticationMiddleware, retailerController.myOrders);
router.delete('/cancelMyOrder', jwtAuthenticationMiddleware, orderValidation, validateExpressValidatorResult, retailerController.cancelMyOrder);
router.put('/confirmDelivery', jwtAuthenticationMiddleware, orderValidation, validateExpressValidatorResult, retailerController.confirmDelivery);
router.get('/getOrderByOrderId/', jwtAuthenticationMiddleware, retailerController.getOrderByOrderId);
router.get('/findDrugByName/', jwtAuthenticationMiddleware, retailerController.findDrugByName);


module.exports = router;
