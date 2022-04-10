const User = require('../models/User');
const Post = require('../models/Post');
const { sendEmail } = require('../middlewares/sendEmail');
const crypto = require('crypto');
exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        let user = await user.findOne({ email });
        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "Ya existe ese usuario" });
        }

        user = await User.create({
            name,
            email,
            password,
            avatar: { public_id: "sample_id", url: "sampleurl" }
        });

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options)
            .json({
                success: true,
                user,
                token,
            });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,

        })
    }
};

exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) return res.status(400).json({
            success: false,
            message: "No existe ese Fl!pper"
        })

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "No coincide ningún Fl!pper"
            })
        }

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options)
            .json({
                success: true,
                user,
                token,
            });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.logout = async (req, res) => {

    try {
        res.status(200).cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: "Hasta otra"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.followUser = async (req, res) => {

    try {

        const userToFollow = await User.findById(req.params.id);

        const loggedInUser = await User.findById(req.params._id);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "Flipper no encontrado"
            })
        }

        if (loggedInUser.following.includes(userToFollow._id)) {

            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);

            loggedInUser.following.splice(indexFollowing, 1);

            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);

            userToFollow.followers.splice(indexFollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({ success: true, message: "Desfl!peado" })
        }

        else {
            loggedInUser.following.push(userToFollow._id);

            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({ success: true, message: "Fl!peado" })

        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
exports.updatePassword = async (req, res) => {

    try {

        const user = await User.findById(req.params._id);

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Rellene los campos"
            })
        }

        const isMatch = await User.matchPassword(oldPassword);

        if (!isMatch) {
            res.status(400).json({
                success: false,
                message: "Contraseña incorrecta"
            });
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({ success: true, message: "Contraseña cambiada correctamente" });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.updateProfile = async (req, res) => {

    try {

        const user = await User.findById(req.params._id);

        const { name, email } = req.body;

        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        await user.save();

        res.status(200).json({ success: true, message: "Fl!pper cambiado" })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.deleteMyProfile = async (req, res) => {

    try {

        const user = await User.findById(req.params._id);

        const posts = user.posts

        const followers = user.followers;

        const following = user.following;

        const userId = user._id;

        await user.remove();

        res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })

        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        for (let i = 0; i < followers.length; i++) {

            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);

            follower.following.splice(index, 1)

            await follower.save();
        }

        for (let i = 0; i < following.length; i++) {

            const follows = await User.findById(following[i]);

            const index = follows.following.indexOf(userId);

            follows.following.splice(index, 1)

            await follower.save();
        }

        res.status(200).json({ success: true, message: "Echaremos de menos tus fl!ps" })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.myProfile = async (req, res) => {

    try {

        const user = await User.findById(req.params._id).populate('posts')

        res.status(200).json({ success: true, user })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getUserProfile = async (req, res) => {

    try {

        const user = await User.findById(req.params._id).populate("posts");

        if (!user) {
            return res.status(404).json({ success: false, message: "Fl!pper no encontrado" })
        }

        res.status(200).json({ success: true, user })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllUsers = async (req, res) => {

    try {

        const users = await User.find({})

        res.status(200).json({ success: true, users })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.forgotPassword = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json({ success: false, message: "Fl!pper no encontrado" })
        }

        const resetPasswordToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset${ressetPasswordToken}`;

        const message = `Cambie su contraseña clicando en el link: ${resetUrl}`;

        try {
            await sendEmail({ email: user.email, subject: "Cambio de contraseña", message });
            res.status(200).json({ success: true, message: `Email enviado a ${user.email}` })

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(500).json({
                success: false,
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.resetPassword = async (req, res) => {

    try {

        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

        if (!user) {
            return res.status(401).json({ success: false, message: "Token inválido o expirado" })
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined;

        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Contraseña actualizada" })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}