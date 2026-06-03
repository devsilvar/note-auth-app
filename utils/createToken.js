const jwt = require("jsonwebtoken")

const createToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
};



// dvvsdvdsvds.vsdvdsvdsvds.dvdsvdsvsdv
module.exports = createToken;