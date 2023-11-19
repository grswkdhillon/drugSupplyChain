const jwt = require('jsonwebtoken');
const Manufacturer = require('../models/Manufacturer.js');

const {
    messages,
    responseStatus,
    statusCode,
} = require("../core/constant/constant.js");


module.exports.jwtAuthenticationMiddleware = async (req, res, next) => {
    try {
        let jwt_token = req.headers.authorization;
        console.log(jwt_token,"jwt_token");

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
                const manufacturer = await Manufacturer.findById(data.email);
                // to use userId in future for manipulation 
                req.email = data.email;
                next()
            }
        })

    } catch (error) {
        return res.status(statusCode.Bad_request).json({ Messages: error.message, ResponseStatus: responseStatus.failure })
    }
};

// // Create refresh token
// export const createRefreshToken = (userId) => {
//     const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: '7d' });
//     return refreshToken;
// };