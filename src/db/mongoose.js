const mongoose = require("mongoose");
const validator = require("validator");
require("dotenv").config({ path: "variables.env" });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("You're connected to mongodb");
    //👍🔥🔥🔥🔥🔥🔥
  })
  .catch((e) => {
    console.log("couldn't connect to database", e);
    //🤦‍♂️ 🤦 🤦
  });
