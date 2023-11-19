
const express= require('express');
const router = express.Router();

const qaController = require('../controllers/qaController');

const {qaRegistrationValidation, loginValidation} = require('../middlewares/qualityAnalystsValidation.js');
const {validateExpressValidatorResult} = require('../helper/validationError.js');
const {jwtAuthenticationMiddleware} = require('../middlewares/jwtAuthorization');


// router.use(jwtAuthenticationMiddleware);


router.post('/register', qaRegistrationValidation, validateExpressValidatorResult, qaController.register);
router.post('/login', loginValidation, validateExpressValidatorResult, qaController.login);
// router.get('/manufacturer/checkRegister', manufacturerController.simpleRegister);


module.exports = router;
