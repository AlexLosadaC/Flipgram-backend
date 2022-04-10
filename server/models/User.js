const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Ingrese un nombre"],
    },
    avatar: {
        public_id: String,
        url: String,
    },
    email: {
        type: String,
        required: [true, "Ingrese un correo"],
        unique: [true, "Correo en uso"],
    },
    password: {
        type: String,
        required: [true, "Ingrese una contraseña"],
        minlength: [6, "Contraseña mínima: 6 caracteres"],
        select: false,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    follower: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    next();
});

userSchema.methods.matchPassword = async function (password) {


    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {

    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET);

};


userSchema.methods.getResetPasswordToken = function () {

    const resetToken = cryptorandomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordToken = Date.now() + 10 * 60 * 1000;

    return resetToken;
}



module.exports = mongoose.model("User", userSchema);