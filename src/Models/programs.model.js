const mongoose = require("mongoose");
// const validator = require("validator");

const programsSchema = new mongoose.Schema({
  program_id: {
    type: String,
    required: true,
  },

  program_title: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: "user",
  },
});

const programs = mongoose.model("programs", programsSchema);

module.exports = programs;
