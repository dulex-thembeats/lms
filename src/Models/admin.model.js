const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "variables.env" });

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },

  phone_number: {
    type: String,
    required: true,
  },

  department: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("password cannot be accepted as password");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//this is a virtual property that is not stored on the database but an important property for the database to know which user owns which task
adminSchema.virtual("tasks", {
  ref: "task",
  // this is where the local data is stored
  localField: "_id",
  // this is what sets the relationship
  foreignField: "owner",
});

// there is another method where you will use a declared function instead of the toJSON object..
adminSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

adminSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

//custom comparison for login
adminSchema.statics.findByCredentials = async (email, password) => {
  const User = await admin.findOne({ email });
  if (!User) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, User.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return User;
};

// hash the plain text password before saving
adminSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const admin = mongoose.model("admin", adminSchema);

module.exports = admin;
