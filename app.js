const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const userModel = require('./models/user');
const postModel = require('./models/post');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multerconfig = require('./config/multerconfig');
const path = require('path');
const upload = require('./config/multerconfig');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

function isLoggedIn(req, res, next){
    if(!req.cookies.token){
        res.redirect("/login");
    }
    else{
        let data = jwt.verify(req.cookies.token, "secret");    
        req.user = data;
        next();
    }
}

app.get("/", function(req, res){
    res.render("index");
})

app.get("/profile/upload", isLoggedIn, function(req, res){
    res.render("profileupload");
})

app.post("/upload", isLoggedIn, upload.single("image"), async function(req, res){
    let user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save()
    res.redirect("/profile");
})

app.post("/upload", function(req, res){
    console.log(req.file);
})

app.post("/register", async function(req, res){
    let {name, username, age, password, email} = req.body;
    let user = await userModel.findOne({email});
    if(user){
        res.status(500).send("User already registered");
    }
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(password, salt, async function(err, hash){
            let user = await userModel.create({
                name,
                username,
                email,
                age,
                password: hash
            })
            let token = jwt.sign({email: email, userid: user._id}, "secret");
            res.cookie("token", token);
            res.redirect("/profile");
        })
    })
})

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/profile", isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    let allPosts = await postModel.find().populate("user");
    res.render("profile", {user, allPosts});
})

app.get("/likePost/:id", isLoggedIn, async function(req,res){
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect("/profile");
})

app.get("/deletePost/:id", isLoggedIn, async function(req,res){
    let post = await postModel.deleteOne({_id: req.params.id});
    res.redirect("/profile");
})

app.post("/login", async function(req, res){
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user){
        res.status(500).send("Something went wrong");
    }
    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "secret");
            res.cookie("token", token);
            res.redirect("/profile");
        }
        else{
            res.redirect("/login");
        }
    })
})

app.post("/post", isLoggedIn , async function(req,res){
    let user = await userModel.findOne({email: req.user.email});
    let post = await postModel.create({
        user: req.user.userid,
        content: req.body.post
    })
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
})

app.get("/logout", function(req, res) {
    res.clearCookie("token");
    res.redirect("/login");
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log(`Server started at port ${port}`);
});