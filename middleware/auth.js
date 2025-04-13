// middleware/auth.js - MVP
const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 middleware configuration
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
});

module.exports = { checkJwt };