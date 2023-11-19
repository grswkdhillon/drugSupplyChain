const express= require('express');
const router = express.Router();

const distributorController = require('../controllers/distributorController');
const userController = require('../controllers/userController');

const {distributorRegistrationValidation, loginValidation, confirmOrderValidation, jwtAuthenticationMiddleware} = require('../middlewares/distributorValidation.js');
const {validateExpressValidatorResult} = require('../helper/validationError.js');



// router.use(jwtAuthenticationMiddleware);


router.post('/register', distributorRegistrationValidation, validateExpressValidatorResult, distributorController.register);
router.post('/login', loginValidation, validateExpressValidatorResult, distributorController.login);
router.get('/showOrders', jwtAuthenticationMiddleware, distributorController.showOrders);
router.put('/confirmOrder', jwtAuthenticationMiddleware, confirmOrderValidation, validateExpressValidatorResult, distributorController.confirmOrder);
router.get('/receivedOrders', jwtAuthenticationMiddleware, distributorController.receivedOrders);
router.get('/placedOrders', jwtAuthenticationMiddleware, distributorController.placedOrders);
router.put('/confirmDelivery', jwtAuthenticationMiddleware, confirmOrderValidation, validateExpressValidatorResult,distributorController.confirmDelivery);
router.get('/getAllOrdersBySuperId', jwtAuthenticationMiddleware, distributorController.getAllOrdersBySuperId);


module.exports = router;
