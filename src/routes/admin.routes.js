const express = require("express");
const user = require("../Models/admin.model");
const auth = require("../Middleware/admin.auth");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();

router.post("/admin-register", async (req, res) => {
  const users = new user(req.body);

  try {
    await users.save();
    const token = await users.generateAuthToken();
    res.status(201).send({ users, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const users = await user.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await users.generateAuthToken();
    res.send({
      users,
      token,
    });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/admin/logout", auth, async (req, res) => {
  try {
    req.User.tokens = req.User.tokens.filter((tokens) => {
      return tokens.token !== req.token;
    });
    await req.User.save();

    res.send();
  } catch (e) {
    res.status(500).save();
  }
});

router.post("/admin/logoutAll", auth, async (req, res) => {
  try {
    req.User.tokens = [];
    await req.User.save();
    res.send();
  } catch (e) {
    res.status(500).save();
  }
});

router.get("/admin/me", auth, async (req, res) => {
  res.send(req.User);
});

router.patch("/admin/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "phone_number",
    "department",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Updates" });
  }

  try {
    updates.forEach((update) => (req.User[update] = req.body[update]));
    await req.User.save();

    res.send(req.User);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/admin/me", auth, async (req, res) => {
  try {
    await req.User.remove();
    res.send(req.User);
  } catch (e) {
    res.status(500).send(e);
  }
});
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image file"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/admin/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    //instead of passing the image directly we will be using sharp to make some changes
    req.User.avatar = buffer;
    //req.User.avatar = req.file.buffer
    await req.User.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/admin/me/avatar", auth, async (req, res) => {
  req.User.avatar = undefined;
  await req.User.save();
  res.send();
});

router.get("/admin/:id/avatar", auth, async (req, res) => {
  try {
    const User = await user.findById(req.params.id);
    if (!User || !User.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png ");
    res.send(User.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
