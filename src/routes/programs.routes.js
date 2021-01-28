const express = require("express");
const task = require("../models/programs.model");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/admin.auth");
require("dotenv").config({ path: "variables.env" });
const router = new express.Router();

//create a new program
router.post("/programs/create", authAdmin, async (req, res) => {
  const tasks = new task({
    ...req.body,
    owner: req.User._id,
  });
  try {
    await tasks.save();
    res.status(201).send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Get all programs
router.get("/programs", authAdmin, async (req, res) => {
  try {
    const tasks = await task.find({});
    res.status(201).send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the programs route
router.get("/students/programs", auth, async (req, res) => {
  try {
    const tasks = await task.find({});
    res.status(201).send(tasks);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the programs route
router.get("/students/programs/:id", auth, async (req, res) => {
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

//An admin will only see programs created by them
router.get("/programs/:id", authAdmin, async (req, res) => {
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

router.patch("/programs/:id", authAdmin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["program_id", "program_title"];
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

    if (!task) {
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

router.delete("/programs/:id", authAdmin, async (req, res) => {
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
