const express = require("express");
const Task = require("../Models/programs.model");
const auth = require("../Middleware/auth");
const authAdmin = require("../Middleware/admin.auth");
require("dotenv").config({ path: "variables.env" });
const router = new express.Router();

router.post("/create_programs", authAdmin, async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/programs", authAdmin, async (req, res) => {
  try {
    const task = await Task.find({});
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the assigment route
router.get("/students-programs", auth, async (req, res) => {
  try {
    const task = await Task.find({});
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Students access to the assigment route
router.get("/students-programs/:id", auth, async (req, res) => {
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

router.get("/programs/:id", authAdmin, async (req, res) => {
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

router.delete("/programs/:id", authAdmin, async (req, res) => {
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
