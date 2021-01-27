const mongoose = require("mongoose");
const validator = require("validator");

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
  },

  course_code: {
    type: String,
    required: true,
  },

  department_id: {
    type: String,
    required: true,
  },

  program_id: {
    type: String,
    required: true,
  },
});

const course = mongoose.model("course", courseSchema);

module.exports = course;
