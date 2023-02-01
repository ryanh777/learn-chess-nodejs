const mongoose = require('mongoose');

const StudentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true,
        min: 0,
        max: 12
    }
})

module.exports = mongoose.model('Student', StudentSchema, 'Students');