const mongoose = require("mongoose");
// const validator = require("validator");

const assignmentSchema = new mongoose.Schema({
  assignment_id: {
    type: String,
    default: "01",
    // required: true,
  },

  assignment_title: {
    type: String,
    // required: true,
    default: "New Assignment",
  },

  assignment_file: {
    type: String,
    // required: true,
  },

  assignment_file_id: {
    type: String,
    // required: true,
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

const assignment = mongoose.model("assignment", assignmentSchema);

module.exports = assignment;
