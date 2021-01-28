const students = require("../models/student");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisismytoken");
    const student = await students.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!student) {
      throw new Error();
    }

    req.token = token;
    req.User = student;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
