const { Router } = require('express');
const customerController = requrie('../controller/customerController');

const router = Router();


router.post('/customer/register', customerController.register);

module.exports = router;
