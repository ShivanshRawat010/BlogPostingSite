const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/MiniProj1');

const userSchema = mongoose.Schema({
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
})

module.exports = mongoose.model('user', userSchema);