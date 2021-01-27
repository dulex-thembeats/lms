const express = require("express");
require("./db/mongoose");
const studentRoute = require("./routes/student.routes");
const adminRoute = require("./routes/admin.routes");
const assignmentRoute = require("./routes/assignment.routes");
// const courseRoute = require("./routes/course.routes");
// const programsRoute = require("./routes/program.routes");
require("dotenv").config({ path: "variables.env" });

const app = express();
const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//    req.status(503).send('Website under maintenance will back soon');
// })

app.use(express.json());
app.use(studentRoute);
app.use(adminRoute);
app.use(assignmentRoute);
// app.use(courseRoute);
// app.use(programsRoute);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
