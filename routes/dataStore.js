const express = require("express");
const router = express.Router();
const Position = require("../models/Position");

router.get("/:id", async (req, res) => {
   try {
      const move = await Position.findById(req.params.id);
      res.json(move);
   } catch (err) {
      res.json(err);
   }
});

router.post("/find", async (req, res) => {
   try {
      const move = await Position.findOne({
         user: req.body.user,
         fen: req.body.fen,
      });
      res.json(move);
   } catch (err) {
      res.json(err);
   }
});

router.delete("/delete", async (req, res) => {
   try {
      deleteMoveAndChildren(req.body.username, req.body.fenToDelete, req.body.userColor);
      await removeFromParent(req.body.username, req.body.fenToDelete, req.body.parentFen, req.body.userColor);
      res.json(await Position.findOne({ user: req.body.username, fen: req.body.parentFen }))
   } catch (err) {
      res.json(err);
   }
});

const deleteMoveAndChildren = async (user, fen, userColor) => {
   const move = await Position.findOne({
      user: user,
      fen: fen
   })
   if (!move) return
   if (userColor == "white") {
      move.nextMovesWhite.forEach(move => {
         deleteMoveAndChildren(user, move.fen, userColor );
      });
   } else {
      move.nextMovesBlack.forEach(move => {
         deleteMoveAndChildren(user, move.fen, userColor );
      });
   }
   await Position.deleteOne({ user: user, fen: fen})
}

const removeFromParent = async (user, fenToDelete, parentFen, userColor) => {
   if (userColor == "white") {
      await Position.updateOne(
         { user: user, fen: parentFen },
         {
            $pull: {
               nextMovesWhite: {
                  fen: fenToDelete
               },
            },
         }
      );
   } else {
      await Position.updateOne(
         { user: user, fen: parentFen },
         {
            $pull: {
               nextMovesBlack: {
                  fen: fenToDelete
               },
            },
         }
      );
   }
}

router.post("/root", async (req, res) => {
   const move = new Position({
      user: req.body.user,
      fen: req.body.fen,
   });
   try {
      const savedMove = await move.save();
      res.json(savedMove._id);
   } catch (err) {
      res.json(err);
   }
});

router.post("/save", async (req, res) => {

   const saveBoard = async (currentFen, nextFen, move, piece, userColor) => {
      if (userColor == "w") {
         await new Position({
            user: req.body.user,
            fen: currentFen,
            nextMovesWhite: [{
               fen: nextFen,
               move: move,
               piece: piece,
               numOfKids: newMoveCount
            }],
            nextMovesBlack: []
         }).save()
      } else {
         await new Position({
            user: req.body.user,
            fen: currentFen,
            nextMovesWhite: [],
            nextMovesBlack: [{
               fen: nextFen,
               move: move,
               piece: piece,
               numOfKids: newMoveCount
            }]
         }).save()
      }
   }

   const updateKids = async (board, move, newMoveCount, userColor) => {
      let childIsSaved = false;
      const savedMoveKids = userColor == "w" ? board.nextMovesWhite : board.nextMovesBlack
      for (let i = 0; i < savedMoveKids.length; i++) {
         if (move == savedMoveKids[i].move) {
            if (userColor == "w") {
               await Position.updateOne(
                  { _id: board._id },
                  { $inc: { 'nextMovesWhite.$[kid].numOfKids': newMoveCount } },
                  { arrayFilters: [{ 'kid.move': move }] }
               )
            } else {
               await Position.updateOne(
                  { _id: board._id },
                  { $inc: { 'nextMovesBlack.$[kid].numOfKids': newMoveCount } },
                  { arrayFilters: [{ 'kid.move': move }] }
               )
            }
            childIsSaved = true
            break
         }
      }
      return childIsSaved
   }

   const addKid = async (boardID, boardToSave, newMoveCount, userColor) => {
      if (userColor == "w") {
         await Position.updateOne(
            { _id: boardID },
            {
               $push: {
                  nextMovesWhite: {
                     fen: boardToSave.fen,
                     move: boardToSave.move,
                     piece: boardToSave.piece,
                     numOfKids: newMoveCount
                  },
               },
            }
         )
      } else {
         await Position.updateOne(
            { _id: boardID },
            {
               $push: {
                  nextMovesBlack: {
                     fen: boardToSave.fen,
                     move: boardToSave.move,
                     piece: boardToSave.piece,
                     numOfKids: newMoveCount
                  },
               },
            }
         )
      }
   }

   let newMoveCount = 0;
   const movesToBeSaved = req.body.moves;
   try {
      for (let i = movesToBeSaved.length - 1; i >= 1; i--) {
         const savedMove = await Position.findOne({
            user: req.body.user,
            fen: movesToBeSaved[i - 1].fen,
         })

         // board is not saved
         if (!savedMove) {
            await saveBoard(movesToBeSaved[i - 1].fen, movesToBeSaved[i].fen, movesToBeSaved[i].move, movesToBeSaved[i].piece, req.body.userColor)
            newMoveCount++
            continue
         }

         // board and child are saved
         if (await updateKids(savedMove, movesToBeSaved[i].move, newMoveCount, req.body.userColor)) continue

         // just board is saved
         await addKid(savedMove._id, movesToBeSaved[i], newMoveCount, req.body.userColor)
         newMoveCount++
      }
      // update root
      const root = await Position.findOne({
         user: req.body.user,
         fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"
      })
      const hadKid = await updateKids(root, movesToBeSaved[0].move, newMoveCount, req.body.userColor)
      if (!hadKid) await addKid(root._id, movesToBeSaved[0], newMoveCount, req.body.userColor)
      const updatedRoot = await Position.findOne({
         user: req.body.user,
         fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -"
      })
      res.json(updatedRoot)
   } catch (err) {
      console.log("error:", err.message)
      res.json(err.message)
   }
})

module.exports = router;
