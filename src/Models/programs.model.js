const mongoose = require("mongoose");
const validator = require("validator");

const programsSchema = new mongoose.Schema({
  program_id: {
    type: String,
    required: true,
  },

  program_title: {
    type: String,
    required: true,
  },
});

const programs = mongoose.model("programs", programsSchema);

module.exports = programs;
