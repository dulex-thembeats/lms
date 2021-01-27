const mongoose = require("mongoose");
const validator = require("validator");

mongoose
  .connect("mongodb://127.0.0.1:27017/lms_George", {
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
