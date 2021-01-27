const express = require("express");
const Task = require("../models/assignment.model");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/admin.auth");
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
    if (!file.originalname.match(/\.(pdf|docx|pptx|jpg|jpeg|png)$/)) {
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

router.get("/assignments", authAdmin, async (req, res) => {
  try {
    const task = await Task.find({});
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the assigment route
router.get("/students-assignments", auth, async (req, res) => {
  try {
    const task = await Task.find({});
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the assigment route
router.get("/assignments/:id", async (req, res) => {
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
});

router.get("/assignments/:id", async (req, res) => {
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
});

router.patch("/assignments/:id", authAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["assignment_id", "assignment_title"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Updates" });
  }

  try {
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

router.delete("/assignments/:id", authAdmin, async (req, res) => {
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
