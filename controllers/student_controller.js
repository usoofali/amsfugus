const course_model = require('../models/course_model');
const student_model = require('../models/student_model');
const mongoose = require('mongoose');
module.exports = {
    enroll:async(req, res) => {
        try {
            var c_id= mongoose.Types.ObjectId(req.params.c_id)
            var s_id= mongoose.Types.ObjectId(req.params.s_id)
            var e_code=req.params.code

          const result=await course_model.findById(c_id)
          const stud_quer=await student_model.find({"_id":s_id})
          const name_curr=stud_quer[0].name
          const features_curr=stud_quer[0].features
          const regno_curr=stud_quer[0].regno
          if(result.enroll==e_code)
          {
            const isMarked=await course_model.find({"_id":c_id, "attendance.Id" : s_id},async (err, docs) =>{ 
              
              if (err){ 
                  console.log(err); 
              } 
              else{ 
                  if(docs.length === 0)
                  {
                  await course_model.updateOne({"_id":c_id},
                  {$addToSet:{"attendance":{Id:s_id,
                                            name:name_curr,
                                            regno:regno_curr,
                                            attendance: 0,
                                            marked:false,
                                            features:features_curr}}})
                  res.status(200).json({ success: true,message:"enrolled" })
                  }
                  else
                  {
                    res.json({ success: false,message:"Already enrolled" })
                  }
              } 
          }); 
          
        }
          else
        {
          res.json({ success: false,message:"Wrong Code" })
        }
        }
        catch (err) {
            res.status(501).json({success: false,message: "Something Went Wrong"})
        }
    },


    attend:async(req, res) => {
      try {
            var c_id=mongoose.Types.ObjectId(req.body.cid)
            var s_id= req.body.sids
            var code=req.body.sessioncode
            
            var canBeMarked=true
            var result=await course_model.find({"_id":c_id})
            
            for(var k=0; k<s_id.length; k++){
                std = mongoose.Types.ObjectId(s_id[k])
                for(j in result[0].attendance)
                {
                  if(String(result[0].attendance[j].Id) === String(std))
                  {
                    console.log(result[0].attendance[j].name)
                    console.log(result[0].attendance[j].regno)
                    console.log("Marking attendance for the student above......")
                    if(result[0].attendance[j].marked)
                    {
                      canBeMarked=false
                    }
                    }
                }
                if(result[0].session != 0)
                {
                if (code == result[0].session && canBeMarked )
                {
                  await course_model.findOneAndUpdate(
                    {"_id":c_id, "attendance.Id" : std},
                    {$inc : {"attendance.$.attendance" : 1},$set:{"attendance.$.marked" : true}}
                    )
              }
                else
                {
                  res.json({ success: false, message:"Wrong code Or Already Marked" })
                }
              }
              else{
                res.json({ success: false, message:"Not accepting at the moment" })
              }
              
          }
            try{
                await course_model.findByIdAndUpdate(c_id, {$inc:{sessioncount:1}})
                await course_model.findByIdAndUpdate(c_id, {$set:{session:0}})
                res.status(200).json({ success: true, result:code})
                console.log("Lecture Session ended successfully.");
            }
            catch(err) {
            console.log(err)
            res.status(501).json({ success: false, message:"Something went wrong"})
            }
          
        }
        catch (err) {
            res.status(501).json({success: false,message: err.message})
        }
        },

    all: async (req, res) => {
        try {
          const all  = await course_model.find()
          res.json(all)
        } 
        catch (err) {
          res.status(500).json({message: err.message})
        }
      },

    student_home: async (req,res)=> {
      try{
        var s_id= mongoose.Types.ObjectId(req.params.id)
        const all  = await course_model.find({"attendance.Id":s_id})
        // console.log(s_id)
        // console.log(all)

        result={}
        var course_ids=[]
        var course_name=[]
        var attendance_ratio=[]
        for(i in all)
        {
          for(j in all[i].attendance)
          {
            console.log(all[i].attendance[j].Id)
            console.log(s_id)
            console.log(all[i].attendance[j].Id === s_id)
            if(String(all[i].attendance[j].Id) === String(s_id))
            {
              course_ids.push(all[i].course_id)
              course_name.push(all[i].name)
              if(all[i].sessioncount !== 0)
              {
              attendance_ratio.push(all[i].attendance[j].attendance/all[i].sessioncount)
              }
              else
              {
                attendance_ratio.push(0)
              }
              }
          }
          
        }
        console.log({Id:course_ids,
          names:course_name,
          attendance:attendance_ratio})
        res.status(200).json({Id:course_ids,
                              names:course_name,
                              attendance:attendance_ratio})
      }
      catch(err){
          res.json({ success: false, result: err})
    }
    },
}