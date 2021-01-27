const mongoose = require("mongoose");
// const validator = require("validator");

const courseSchema = new mongoose.Schema({
  course_id: {
    type: String,
    required: true,
  },

  course_file: {
    type: String,
    required: true,
  },

  course_title: {
    type: String,
    required: true,
    default: "my_course_tilte",
  },

  course_code: {
    type: String,
    required: true,
    default: "101",
  },

  department_id: {
    type: String,
    required: true,
    default: "00",
  },

  program_id: {
    type: String,
    required: true,
    default: "00",
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

const course = mongoose.model("course", courseSchema);

module.exports = course;
