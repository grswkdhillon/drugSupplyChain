
const express= require('express');
const router = express.Router();

const manufacturerController = require('../controllers/manufacturerController');

const {manufacturerRegistrationValidation, loginValidation, manufacturerDrugValidation, updateDrugStockValidation, confirmOrderValidation, jwtAuthenticationMiddleware, updateStatusValidation} = require('../middlewares/manufacturerValidation.js');
const {validateExpressValidatorResult} = require('../helper/validationError.js');

// router.use(jwtAuthenticationMiddleware);


router.post('/register', manufacturerRegistrationValidation, validateExpressValidatorResult, manufacturerController.register);
router.post('/login', loginValidation, validateExpressValidatorResult, manufacturerController.login);
router.post('/addDrug', jwtAuthenticationMiddleware, manufacturerDrugValidation, validateExpressValidatorResult,manufacturerController.addDrug);
router.get('/getDrugs', jwtAuthenticationMiddleware, manufacturerController.getDrugs)
router.get('/showOrders', jwtAuthenticationMiddleware, manufacturerController.showOrders);
router.put('/confirmOrder', jwtAuthenticationMiddleware, confirmOrderValidation, validateExpressValidatorResult,manufacturerController.confirmOrder);
router.get('/receivedOrders', jwtAuthenticationMiddleware, manufacturerController.receivedOrders);
router.put('/updateStatus', jwtAuthenticationMiddleware, updateStatusValidation, validateExpressValidatorResult,manufacturerController.updateStatus);


module.exports = router;
