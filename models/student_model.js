const express = require('express');
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
    regno: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    features:{
        type: Array,
    },
});

module.exports = new mongoose.model("Student",studentSchema);