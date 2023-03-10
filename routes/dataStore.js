const express = require("express");
const router = express.Router();
const Move = require("../models/Move");

router.get("/:id", async (req, res) => {
   try {
      const move = await Move.findById(req.params.id);
      res.json({ id: move._id, move: move.move, piece: move.piece, childData: move.childData});
   } catch (err) {
      res.json(err);
   }
});

router.delete("/:id", async (req, res) => {
   try {
      deleteMoveAndChildren(req.body.id);
      removeFromParent(req.params.id, req.body);
      res.status(200)
   } catch (err) {
      res.json(err);
   }
});

const deleteMoveAndChildren = async (id) => {
   const move = await Move.findById(id)
   move.childData.forEach(item => {
      deleteMoveAndChildren(item.id);
   });
   await Move.deleteOne({ _id: move.id })
}

const removeFromParent = async (parentID, body) => {
   await Move.updateOne(
      { _id: parentID },
      {
         $pull: {
            childData: {
               id: body.id,
               move: body.move,
               piece: body.piece,
            },
         },
      }
   );
}

router.post("/", async (req, res) => {
   const move = new Move({
      user: req.body.user,
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

module.exports = router;
