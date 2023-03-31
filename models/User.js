const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
   {
      username: {
         type: String,
         required: true,
         max: 255,
         min: 4
      },
      password: {
         type: String,
         required: true,
         max: 1024,
         min: 4
      },
      rootID: {
         type: String,
         required: true
      },
      dateCreated: {
         type: Date,
         default: Date.now
      },
      token: String
   },
   {
      versionKey: false
   }
);

module.exports = mongoose.model('User', UserSchema);