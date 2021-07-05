const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const router = require("./auth");

router.use(cookieParser());

module.exports = function(req, res, next) {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send("User not logged in!");
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token!");
  }
};
