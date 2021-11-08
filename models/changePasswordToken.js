const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    email: { 
        type: String,
         required: true,
        },
    password: {
        type: String,
        minlength: [8,'min length of password must be 8'],
        required: true,
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

module.exports = new mongoose.model("ForgetPasswordToken",tokenSchema);