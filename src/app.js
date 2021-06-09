require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require('./db/conn');
const path = require("path");
const jwt = require('jsonwebtoken');
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const register = require("./models/register");
const cookieParser = require("cookie-parser");
const auth = require('./middleware/auth');
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.set("views", template_path);
app.use(express.static('views/images'))
app.set("view engine", "hbs");
hbs.registerPartials(partials_path);
app.use(express.json());
app.use(cookieParser())

app.use(express.urlencoded({ extended: false }));
// console.log(process.env.SECRET_KEY);

app.get("/", (req, res) => {
    res.render("index");
})

app.get("/secret", auth ,(req, res) => {
    // console.log(` nice cookie ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/logout", auth ,async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currElement)=>{
            return currElement.token !=req.token

        })
        res.clearCookie("jwt")
        console.log("logout succesfully");
        await req.user.save()
        res.render("login")
    } catch (error) {
        res.status(500).send(error);
    }
  
})
app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/register", (req, res) => {
    res.render("register");
})




app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {


            const registerEmployee = new register({

                email: req.body.email,

                password: req.body.password

            }

            )
            // console.log("the success part" + registerEmployee);
            const token = await registerEmployee.generateAuthToken()
            // console.log("the token part " + token);
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            })

            //password hash

            const registered = await registerEmployee.save();
            return res.status(201).render("login");
    
        }
        else {

            res.send("password not matched");
         

        }
        res.send(registered);
    } catch (error) {
        res.status(404).send(error)
    }

}
)
//login check
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken()
        console.log("the token part " + token);
        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 600000),
            httpOnly: true
        })

        

        if (isMatch) {
            res.status(201).render("index")
        }
        else {
            res.send("password are not matching")
        }


    }
    catch (error) {
        res.status(400).send("invalid")
    }
})

app.listen(port, () => {
    console.log("succesfully port");
})