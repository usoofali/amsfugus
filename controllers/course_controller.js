const course_model = require('../models/course_model');
const student_model = require('../models/student_model');
const lecturer_model = require('../models/lecturer_model');
const mailer=require('./../utills/mailer')
const mongoose = require('mongoose');
const { enroll } = require('./student_controller');

module.exports = {
    create: async (req, res) => {
        try{
        const enroll_code=Math.floor(100000 + Math.random() * 900000)
        let course = new course_model({
        course_id:req.body.course_id,
        name: req.body.name,
        admin_id: mongoose.Types.ObjectId(req.body.admin_id),
        sessioncount:0,
        session: 0,
        enroll:enroll_code
        })
        const result= await course.save()
        const admin = await lecturer_model.findById(mongoose.Types.ObjectId(req.body.admin_id))
        mailer.codeMailer(admin.email,admin.name,req.body.name,req.body.course_id,enroll_code)
        
        res.status(200).json({ success: true, result: result})
      }
    
        catch(err) {
          console.log(err)
          res.status(501).json({ success: false, message:"Something went wrong"})
            }
    },
    
    close:async(req, res) => {
      try {
        var c_id= mongoose.Types.ObjectId(req.params.c_id)
        course_model.findByIdAndUpdate(c_id,{$set:{allowEnroll:false}})
        res.status(200).json({success:true,message: "enrollment closed"})
      }
      catch (err)
      {
        console.log(err)
        res.status(501).json({ success: false, message:"Something went wrong"})
      }
},
   
    get: async (req, res) =>{
        try
        {
        const result= await course_model.find({admin_id:req.params.id})
        res.status(200).json({ success: true, result:result})
    }
          catch(err){
            console.log(err)
            res.status(501).json({ success: false, message:"Something went wrong"})
          }
        },

    start_session: async (req, res) => {
        try{
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
              }
            var code=Math.floor(100000 + Math.random() * 900000)
            var id= mongoose.Types.ObjectId(req.params.id)
            await course_model.findByIdAndUpdate(id, {$set:{session:code,"attendance.$[].marked":false}})
            console.log("Lecture session started succesfully.")
            console.log('Session Code: '+code)
            res.status(200).json({ success: true, result:code})
            await sleep(7200000)
            await course_model.findByIdAndUpdate(id, {$set:{session:0}})
    }
      catch(err) {
        console.log(err)
          res.status(501).json({ success: false, message:"Something went wrong"})
      }
    },
     stop_session: async (req, res) => {
      try{
            var id= mongoose.Types.ObjectId(req.params.id)
            await course_model.findByIdAndUpdate(id, {$inc:{sessioncount:1}})
            await course_model.findByIdAndUpdate(id, {$set:{session:0}})
            res.status(200).json({ success: true, result:code})
    }
      catch(err) {
        console.log(err)
        res.status(501).json({ success: false, message:"Something went wrong"})
      }
    },

    delete: async (req,res)=> {
        try{
            var id= mongoose.Types.ObjectId(req.params.id)
            const result=await course_model.findByIdAndDelete(id)
            res.status(200).json({ success: true, result: result})
        }
          catch(err){
            console.log(err)
            res.status(501).json({ success: false, message:"Something went wrong"})
        }
        },

    course_home: async (req,res)=> {
      try{
        var c_id= mongoose.Types.ObjectId(req.params.id)
        const all  = await course_model.find({_id:c_id})
        var name_arr=[]
        var username_arr=[]
        var regno_arr=[]
        var attendance_arr=[]
        for(i in all[0].attendance)
        {
          const stud=await student_model.find({_id:all[0].attendance[i].Id})
          username_arr.push(stud[0].username)
          name_arr.push(all[0].attendance[i].name)
          regno_arr.push(all[0].attendance[i].regno)
          if(all[0].sessioncount !==0)
          {
          var num=Number(all[0].attendance[i].attendance)/(all[0].sessioncount)
          attendance_arr.push(Number(num.toPrecision(4)))
          }
          else{
            attendance_arr.push(0)
          }
        }
          res.status(200).json({name:name_arr,
                                regno:regno_arr,
                                username:username_arr,
                                attendance:attendance_arr})
      }
      catch(err){
        console.log(err)
        res.status(501).json({ success: false, message:"Something went wrong"})
    }
    },

    course_verification: async (req,res)=> {
      try{
        var c_id= mongoose.Types.ObjectId(req.params.id)
        const all  = await course_model.find({_id:c_id})
        var regno_arr=[]
        var features_arr=[]
        var id_arr=[]
        for(i in all[0].attendance)
        {
          id_arr.push(all[0].attendance[i].Id)
          regno_arr.push(all[0].attendance[i].regno)
          features_arr.push(all[0].attendance[i].features)
        }
          res.status(200).json({id:id_arr,
                                regno:regno_arr,
                              features:features_arr})
      }
      catch(err){
        console.log(err)
        res.status(501).json({ success: false, message:"Something went wrong"})
    }
    },

}