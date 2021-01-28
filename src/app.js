const express = require("express");
require("./db/mongoose");
const student_route = require("./routes/student");
const admin_route = require("./routes/admin");
const assignment_route = require("./routes/assignment");
const cors = require("cors");
const course_route = require("./routes/course");
const programs_route = require("./routes/programs");
require("dotenv").config({ path: "variables.env" });

const app = express();
const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//    req.status(503).send('Website under maintenance will back soon');
// })

app.use(express.json());
app.use(cors());
app.use(student_route);
app.use(admin_route);
app.use(assignment_route);
app.use(course_route);
app.use(programs_route);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
