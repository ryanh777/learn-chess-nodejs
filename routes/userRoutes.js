const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { registerValidation, loginValidation } = require("../validation");
const verify = require("./verifyToken");
const router = express.Router();

router.get("/", verify, async (req, res) => {
   try {
      const user = await User.findOne({ _id: req.user._id });
      const simpleUser = {
         username: user.username,
         whiteRootID: user.whiteRootID,
         blackRootID: user.blackRootID,
      };
      res.status(200).send(simpleUser);
   } catch (err) {
      res.status(400).send(err);
   }
});

router.post("/exists", async (req, res) => {
   try {
      const userExist = await User.findOne({ username: req.body.username });
      if (userExist) return res.status(400).send("Username already exists");
      res.status(200).send();
   } catch (err) {
      res.status(400).send(err);
   }
})

router.post("/register", async (req, res) => {
   const { error } = registerValidation(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   const userExist = await User.findOne({ username: req.body.username });
   if (userExist) return res.status(400).send("Username already exists");

   try {
      const hashedPass = await bcrypt.hash(req.body.password, 10);
      const user = new User({
         username: req.body.username,
         password: hashedPass,
         whiteRootID: req.body.whiteRootID,
         blackRootID: req.body.blackRootID,
      });
      await user.save();
      res.status(200).send();
   } catch (err) {
      res.status(400).send(err);
   }
});

router.post("/login", async (req, res) => {
   const { error } = loginValidation(req.body);
   if (error) return res.status(400).send(error.details[0].message);

   const user = await User.findOne({ username: req.body.username });
   if (!user) return res.status(400).send("Could not find username");

   const validPass = await bcrypt.compare(req.body.password, user.password);
   if (!validPass) return res.status(400).send("Invalid password");

   const token = jwt.sign({ _id: user._id }, process.env.SECRET_TOKEN);
   const response = {
      token: token,
      whiteRootID: user.whiteRootID,
      blackRootID: user.blackRootID,
   };
   res.header("auth-token", token).status(200).send(response);
});

router.patch("/:username", verify, async (req, res) => {
   try {
      const updatedPost = await User.updateOne(
         { username: req.params.username },
         { $set: { moveList: req.body.moveList } }
      );
      res.json(updatedPost);
   } catch (err) {
      res.json(err);
   }
});

module.exports = router;
