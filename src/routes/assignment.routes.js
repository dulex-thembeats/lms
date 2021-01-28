const express = require("express");
const task = require("../models/assignment.model");
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
  "/assignment/create",
  authAdmin,
  upload.single("upload"),
  async (req, res) => {
    const File = req.file.path;
    cloudinary.uploader.upload(File, async (result) => {
      const tasks = new task({
        ...req.body,
        assignment_file: result.url,
        assignment_file_id: result.public_id,
        owner: req.User._id,
      });

      try {
        await tasks.save();
        res.status(201).send(tasks);
      } catch (e) {
        res.status(400).send(e);
      }
    });
  }
);

router.get("/assignments", authAdmin, async (req, res) => {
  try {
    const tasks = await task.find({});
    res.status(201).send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/assignments/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const tasks = await task.findOne({ _id, owner: req.User._id });

    if (!tasks) {
      return res.status(404).send();
    }
    res.send(tasks);
  } catch (e) {
    res.status(500).send();
  }
});

//Students access to the assigment route
router.get("/students/assignments", auth, async (req, res) => {
  try {
    const tasks = await task.find({});
    res.status(201).send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the assigment route
router.get("/students/assignments/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const tasks = await task.findOne({ _id, owner: req.User._id });

    if (!tasks) {
      return res.status(404).send();
    }
    res.send(tasks);
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
    const tasks = await task.findOne({
      _id: req.params.id,
      owner: req.User._id,
    });

    if (!tasks) {
      return res.status(404).send();
    }

    updates.forEach((update) => (tasks[update] = req.body[update]));
    await tasks.save();
    res.send(tasks);
  } catch (e) {
    //for clarity sake
    res.status(400).send("You can't alter because it wasn't created by you", e);
  }
});

router.delete("/assignments/:id", authAdmin, async (req, res) => {
  const _id = req.params.id;
  const tasks = await task.findOneAndDelete({ _id, owner: req.User._id });
  try {
    if (!tasks) {
      res.status(400).send();
    }
    res.send(tasks);
  } catch (e) {
    //for clarity sake
    res.status(500).send("You can't alter because it wasn't created by you", e);
  }
});

module.exports = router;
