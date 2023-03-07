const express = require("express");
const router = express.Router();
const Move = require("../models/Move");

router.get("/:id", async (req, res) => {
   try {
      const move = await Move.findById(req.params.id);
      res.json(move);
   } catch (err) {
      res.json(err);
   }
});

router.delete("/:id", async (req, res) => {
   try {
      const removedMove = await Move.remove({ _id: req.params.id });
      res.json(removedMove);
   } catch (err) {
      res.json(err);
   }
});

router.post("/", async (req, res) => {
   const move = new Move({
      move: req.body.move,
      piece: req.body.piece,
   });

   try {
      const savedMove = await move.save();
      res.json(savedMove._id);
   } catch (err) {
      res.json(err);
   }
});

router.patch("/add/:id", async (req, res) => {
   try {
      const updatedMove = await Move.updateOne(
         { _id: req.params.id },
         {
            $push: {
               childData: {
                  id: req.body.id,
                  move: req.body.move,
                  piece: req.body.piece,
               },
            },
         }
      );
      res.json(updatedMove);
   } catch (err) {
      res.json(err);
   }
});

router.patch("/remove/:id", async (req, res) => {
   try {
      const updatedMove = await Move.updateOne(
         { _id: req.params.id },
         {
            $pull: {
               childData: {
                  id: req.body.id,
                  move: req.body.move,
                  piece: req.body.piece,
               },
            },
         }
      );
      res.json(updatedMove);
   } catch (err) {
      res.json(err);
   }
});

module.exports = router;
