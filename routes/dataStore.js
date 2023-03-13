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

router.post("/root", async (req, res) => {
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

router.post("/", async (req, res) => {
   try {
      const moves = req.body.moves;
      const lastInMoves = moves[moves.length - 1];
      const moveWithoutChildren = new Move({
         user: lastInMoves.user,
         move: lastInMoves.move,
         piece: lastInMoves.piece
      });
      let postedMoveID = await moveWithoutChildren.save();

      for (let i = moves.length - 2; i >= 0; i--) {
         const moveToBeSaved = new Move({
            user: moves[i].user,
            move: moves[i].move,
            piece: moves[i].piece,
            childData: {
               id: postedMoveID._id.valueOf(),
               move: moves[i+1].move,
               piece: moves[i+1].piece
            }
         })
         postedMoveID = await moveToBeSaved.save();
      }
      
      await Move.updateOne(
         { _id: req.body.lastSavedMoveID },
            {
               $push: {
                  childData: {
                     id: postedMoveID._id.valueOf(),
                     move: moves[0].move,
                     piece: moves[0].piece,
                  },
               },
            }
      )
      res.json('success').status(200)
   } catch (err) {
      res.json(err)
   }
})

module.exports = router;
