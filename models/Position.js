const mongoose = require("mongoose");

const NextMoveSchema = new mongoose.Schema(
   {
      fen: {
         type: String,
         required: true,
      },
      move: {
         type: String,
         required: true,
      },
      piece: {
         type: String,
         required: true,
      },
      numOfKids: {
         type: Number,
         required: true
      }
   },
   {
      _id: false, versionKey: false
   }
);

const PositionSchema = new mongoose.Schema(
   {
      user: {
         type: String,
         required: true,
      },
      fen: {
         type: String,
         required: true,
      },
      nextMovesWhite: [NextMoveSchema],
      nextMovesBlack: [NextMoveSchema]
   },
   {
      versionKey: false
   }
);

module.exports = mongoose.model("Position", PositionSchema);
