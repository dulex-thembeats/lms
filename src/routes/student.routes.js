const express = require("express");
const user = require("../Models/student.model");
const auth = require("../Middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const router = new express.Router();

router.post("/students_register", async (req, res) => {
  const users = new user(req.body);

  try {
    await users.save();
    const token = await users.generateAuthToken();
    res.status(201).send({ users, token });
  } catch (e) {
    res.status(400).send(e);
  }

  // users.save().then(() =>{
  //     res.status(201).send(users);
  // }).catch((e) => {
  //     res.status(400).send("Error!", e);
  // })
});

router.post("/students/login", async (req, res) => {
  try {
    const users = await user.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await users.generateAuthToken();
    res.status(201).send({
      users,
      token,
    });
  } catch (e) {
    res.status(400).send("Invalid Username or Password Details");
  }
});

router.post("/students/logout", auth, async (req, res) => {
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

router.post("/students/logoutAll", auth, async (req, res) => {
  try {
    req.User.tokens = [];
    await req.User.save();
    res.send();
  } catch (e) {
    res.status(500).save();
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.User);

  // try{
  //     const users = await user.find({})
  //     res.send(users);
  // }catch(e){
  //     res.status(400).send('Err!', e)
  // }

  // user.find({}).then((users) => {
  //     res.send(users)
  // }).catch((e) => {
  //     console.log("Error!", e);
  // })
});

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const users = await user.findById({_id})
//         if(!users){
//             return res.status(404).send()
//         }
//         res.send(users)
//     } catch (e) {
//         res.status(500).send('Err!', e)
//     }
//     user.findById({_id}).then((user) => {
//         if(!user){
//         return res.status(404).send()
//         }
//         res.send(user);
//     }).catch((e) => {
//         res.status(500).send("Error!", e);
//     })
// })
router.patch("/students/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "program_id",
    "department_id",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ Error: "Invalid Updates" });
  }

  try {
    //No longer useful since we've a stored user session
    //const users = await user.findByIdAndUpdate(req.params.id)
    updates.forEach((update) => (req.User[update] = req.body[update]));
    await req.User.save();

    res.send(req.User);
    //const users = await user.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
    //crucial for mostly returned data from database.
    // if(!users){
    //   return  res.status(404).send()
    // }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/students/me", auth, async (req, res) => {
  try {
    await req.User.remove();
    res.send(req.User);
  } catch (e) {
    res.status(500).send(e);
  }
  // This is a method we use to do it
  // const users = await user.findByIdAndDelete(req.user._id);
  // try {
  //     if(!users){
  //         res.status(400).send()
  //     }
  //  res.send(users)
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
  "/students/me/avatar",
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

router.delete("/students/me/avatar", auth, async (req, res) => {
  req.User.avatar = undefined;
  await req.User.save();
  res.send();
});

router.get("/students/:id/avatar", auth, async (req, res) => {
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

//This is a way of deleting a user by passing his id to the method on request i.e .params.id
// router.delete('/users/:id', async(req, res) => {
//     const users = await user.findByIdAndDelete(req.params.id);
//     try {
//         if(!users){
//             res.status(400).send()
//         }
//         res.send(users)
//     } catch (e) {
//         res.status(500).send(e);
//     }
// })

module.exports = router;
