const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/MiniProj1';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    age: Number,
    password: String,
    profilepic: {
        type: String,
        default: 'default.jpeg'
    },  
    email: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

module.exports = mongoose.model('user', userSchema);
