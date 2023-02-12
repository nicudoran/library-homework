const jwt = require("jsonwebtoken");
require("dotenv").config();

const TOKEN_KEY = process.env.TOKEN_KEY;
const isAuthenticated = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    console.log("Error on authentication: ", err);
    return res.status(401).json({ message: "Token is invalid" });
  }
  return next();
};

const hasRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have the required role to access this endpoint",
      });
    }
    next();
  };

module.exports = {
  isAuthenticated,
  hasRole,
};
