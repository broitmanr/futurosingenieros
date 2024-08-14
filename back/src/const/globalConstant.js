const dotenv = require('dotenv')
dotenv.config();

PORT = process.env.PORT || 5000;
JWT_SECRET = process.env.JWTSECRET;

module.exports = {PORT,JWT_SECRET}