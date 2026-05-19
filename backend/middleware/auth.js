const { auth } = require("express-oauth2-jwt-bearer");
const jwksRsa = require("jwks-rsa");
const jwt = require("jsonwebtoken");

// Validates Auth0 JWT on REST routes
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: "RS256",
});

// Validate JWT for Socket.IO handshake
const verifySocketToken = async (token) => {
  const jwksClient = jwksRsa({
    cache: true,
    rateLimit: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  });

  return new Promise((resolve, reject) => {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return reject(new Error("Invalid token"));

    jwksClient.getSigningKey(decoded.header.kid, (err, key) => {
      if (err) return reject(err);
      const signingKey = key.getPublicKey();
      jwt.verify(
        token,
        signingKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: `https://${process.env.AUTH0_DOMAIN}/`,
          algorithms: ["RS256"],
        },
        (err, payload) => {
          if (err) return reject(err);
          resolve(payload);
        }
      );
    });
  });
};

module.exports = { checkJwt, verifySocketToken };