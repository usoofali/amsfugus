const express = require('express');
const mongoose = require('mongoose');

const lecturerSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    lecturerId : {
        type: String,
        required: true,
    },
});

module.exports = new mongoose.model("Lecturer",lecturerSchema);