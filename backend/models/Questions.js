// backend/models/Question.js
import mongoose, { mongo } from "mongoose";

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  category:{type:String,enum:["Javascript","react","HTML","CSS"],default:"Javascript"},
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  starterCode: { type: String, default: "// starter code\n" },
  assets:{
    type:{type:String,default:"image"},  //"image" | "file" | "link"
    url:{type:String,default:""}
    },
  examples:[
    {
      input:{type:String},
      output:{type:String},
      explannation:{type:String},
    }
  ],
  testCases:[
    {
      input:{
        type:mongoose.Schema.Types.Mixed,
        required:true,
      },
      expectedOutput:{
        type:mongoose.Schema.Types.Mixed,
        required:true,
      }
    }
  ],
  author:{ type:mongoose.Schema.Types.ObjectId,ref:"User"},
  isPremium:{type:Boolean,default:false},
  likes:{type:Number,default:0},
  attempts:{type:Number,default:0},
  solved:{type:Number,default:0},
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);

