const mongoose = require('mongoose');
const Schema = mongoose.Schema
const course_Schema = new Schema({
course_id: {type: String,unique:true},
name: String,
admin_id: String,
sessioncount: Number,
session: Number,
enroll:Number,
attendance:
{
    type: Array,
    of: {
        Id:{type:mongoose.Types.ObjectId,unique:true},
        name:String,
        regno:String,
        attendance:Number,
        marked:Boolean,
        features:Array,
    }
}
})
module.exports = mongoose.model('course', course_Schema)