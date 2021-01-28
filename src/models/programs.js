const mongoose = require("mongoose");
// const validator = require("validator");

const programSchema = new mongoose.Schema({
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

const program = mongoose.model("program", programSchema);

module.exports = program;
