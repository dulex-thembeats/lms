const express = require("express");
const Task = require("../Models/assignment.model");
const auth = require("../Middleware/auth");
const authAdmin = require("../Middleware/admin.auth");
const multer = require("multer");
const cloudinary = require("cloudinary");
require("dotenv").config({ path: "variables.env" });
const router = new express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const upload = multer({
  dest: "myuploads/",
  limits: {
    fileSize: 3000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(pdf|docx|pptx)$/)) {
      return cb(new Error("Please upload an image file"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/create_assignment",
  authAdmin,
  upload.single("upload"),
  async (req, res) => {
    const File = req.file.path;
    cloudinary.uploader.upload(File, async (result) => {
      const task = new Task({
        ...req.body,
        assignment_file: result.url,
        assignment_file_id: result.public_id,
        owner: req.User._id,
      });

      try {
        await task.save();
        res.status(201).send(task);
      } catch (e) {
        res.status(400).send(e);
      }
    });
  }
);

router.get("/assignments", async (req, res) => {
  try {
    const match = {};
    const sort = {};

    if (req.query.completed) {
      match.completed = req.query.completed == "true";
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    await req.User.populate({
      path: "tasks",
      match,
      //you can set it directly or use a variable to assign the completed value
      //:{completed: false}
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    }).execPopulate();
    res.send(req.User.tasks);
  } catch (e) {
    res.status(400).send("Err!", e);
  }
});

router.get("/tasks/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.User._id });

    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
  //we're a bit limited using byId so another  option will be better
  //const tasks = await task.findById({_id})

  // task.findById({_id}).then((task) => {
  //     if(!task){
  //       return  res.status(404).send()
  //     }
  //     res.send(task)
  // }).catch((e) => {
  //     res.status(500).send("Error", e);
  // })
});

router.patch("/tasks/:id", authAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Updates" });
  }

  try {
    //this is a very limited method
    //const tasks = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    //const task = await Task.findById(req.params.id)
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.User._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  //this is very limited for our purposes
  //const tasks = await Task.findByIdAndDelete(req.params.id);
  const _id = req.params.id;
  const tasks = await Task.findOneAndDelete({ _id, owner: req.User._id });
  try {
    if (!tasks) {
      res.status(400).send();
    }
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
