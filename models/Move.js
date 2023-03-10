const mongoose = require("mongoose");

const ChildSchema = mongoose.Schema(
   {
      id: String,
      move: String,
      piece: String,
   },
   {
      _id: false,
   }
);

const MoveSchema = mongoose.Schema({
   user: {
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
   childData: [ChildSchema],
});

module.exports = mongoose.model("Move", MoveSchema);
