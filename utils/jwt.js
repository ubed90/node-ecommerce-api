const JWT = require("jsonwebtoken");


const createToken = ({ payLoad }) => {
    const token = JWT.sign(payLoad, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME })

    return token;
}

const isTokenValid = ({ token }) => JWT.verify(token, process.env.JWT_SECRET);


const attachCookiesToResponse = ({ res, user }) => {
    const token = createToken({ payLoad: user });

    const oneDay = 1000 * 60 * 60 * 24;
    
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
        signed: true
    })
}

module.exports = {
    createToken,
    isTokenValid,
    attachCookiesToResponse
}