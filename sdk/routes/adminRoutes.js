
const express= require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const {validateExpressValidatorResult} = require('../helper/validationError.js');
const {adminRegistrationValidation, loginValidation, jwtAuthenticationMiddleware, getUsersValidation, updateStatusValidation, getUsersByRoleValidation, deleteUserByIdValidation} = require('../middlewares/adminValidation.js');

router.post('/login', loginValidation, validateExpressValidatorResult, adminController.login);
router.post('/register', adminRegistrationValidation, validateExpressValidatorResult, adminController.register);
router.get('/getUsers', jwtAuthenticationMiddleware, getUsersValidation, validateExpressValidatorResult, adminController.getUsers);
router.put('/changeStatus', jwtAuthenticationMiddleware, updateStatusValidation, validateExpressValidatorResult, adminController.changeStatus);
router.get('/getUsersByRole', jwtAuthenticationMiddleware, getUsersByRoleValidation, validateExpressValidatorResult, adminController.getUsersByRole);
// router.put('/deleteUserById', jwtAuthenticationMiddleware, deleteUserByIdValidation, validateExpressValidatorResult, adminController.deleteUserById);
router.get('/getRecordsByDocType', jwtAuthenticationMiddleware, adminController.getRecordsByDocType);
router.get('/getHistoryByKey', jwtAuthenticationMiddleware, adminController.getHistoryByKey);



module.exports = router;