const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
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
    whiteRootID: {
        type: String,
        required: true
    },
    blackRootID: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    token: String
});

module.exports = mongoose.model('User', UserSchema);