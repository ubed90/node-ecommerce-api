// * Impots
const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");


const register = async (req, res) => {
    const { email, name, password } = req.body;

    const emailExists = await User.findOne({ email })

    if(email && emailExists) {
        throw new CustomError.BadRequestError("Email Aready Exists.");
    }

    // ! Make First Documents as Admin Default
    const isFirstAccount = await User.countDocuments({}) === 0;

    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });

    // * Token
    const tokenUser = createTokenUser(user);


    // * Create Token and Attach cookie to response
    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).send({ user: tokenUser });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        throw new CustomError.BadRequestError("Email or password is required");
    }

    const user = await User.findOne({ email });

    if(!user) {
        throw new CustomError.BadRequestError("Invalid Credentials")
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect) {
        throw new CustomError.BadRequestError("Invalid Credentials");
    }

    const tokenUser = createTokenUser(user);

    attachCookiesToResponse({ res, user: tokenUser })


    return res.status(StatusCodes.OK).json({ user: tokenUser });
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    return res.status(StatusCodes.OK).json({ msg: "User logged out." })
}


module.exports = {
    register,
    login,
    logout
}