const student = require("../models/student.model");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisismytoken");
    const Student = await student.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!Student) {
      throw new Error();
    }

    req.token = token;
    req.User = Student;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please Authenticate" });
  }
};

module.exports = auth;
