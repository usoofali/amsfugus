const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    email: { 
        type: String,
         required: true,
        },
    password: {
        type: String,
        minlength: [8,'Min length of password must be 8'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    regno: {
        type: String,
    },
    features:{
        type: Array,
    },
    username: {
        type: String,
    },
    lecturerId : {
        type: String,

    },
    token: { 
        type: String,
         required: true 
        },
    createdAt: { 
        type: Date,
         required: true, 
         default: Date.now,
          expires: 43200 
        }
});

module.exports = new mongoose.model("Token",tokenSchema);