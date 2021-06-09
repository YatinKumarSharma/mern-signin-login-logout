const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const employeeSchema = mongoose.Schema({
   
    email:{
        type:String,
        required:true,
        unique:true,
    },
   
    password:{
        type:String,
        required:true,
    },
    tokens:[{
        token:{
            type:String,
            required:true,

        }
    }]
    
})

employeeSchema.methods.generateAuthToken = async function(){
    try{
        // console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token})
        await this.save()
        return token
    }
    catch(error){
        console.log(error);


    }
}

employeeSchema.pre("save",async function(next){
   if (this.isModified("password")) {
    //    console.log(`the current password is ${this.password}`);
       this.password = await bcrypt.hash(this.password,10);
    //    console.log(`the current password is ${this.password}`);
       this.isModified()
   }
   next();
})

const Register = new mongoose.model("register",employeeSchema);

module.exports = Register;