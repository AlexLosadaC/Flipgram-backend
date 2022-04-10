
const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {

    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: "req.body.image.public_id",
                url: "req.body.image.url",
            },
            owner: req.user_id,
        };

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.push(post._id);

        await user.save();

        res.status(201).json({
            success: true,
            post,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.deletePost = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: true, message: "Flipp no encontrado" })
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "No es tu Fl!p" })
        }

        await post.remove();

        const user = await User.findById(req.params._id);

        const index = user.posts.indexOf(req.params.id);

        user.posts.splice(index, 1);

        await user.save();

        res.status(200).json({ success: true, message: "Fl!p borrado" })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


exports.likeAndUnlikePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: true, message: "Flip no encontrado" })
        }

        if (post.likes.includes(req.user._id)) {

            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index, 1);

            await post.save();

            return res.status(200).json({ success: true, message: "Te dejó de gustar" })
        }

        else {
            post.likes.push(req.user._id);

            await post.save();

            return res.status(200).json({ success: true, message: "Te gusta" })
        };


    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}


exports.getPostOffFollowing = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        const posts = await User.find({
            owner: {
                $in: user.following,
            }
        })

        res.status(200).json({ success: true, posts })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.updateCaption = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            {
                return res.status(404).json({ success: false, message: "No existe ese fl!p" })
            }
        }
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, message: "Ese fl!p no es tuyo" })
        }
        post.caption = req.body.caption
        await post.save();
        res.status(200).json({ success: true, message: "Has cambiado el fl!p" })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.addComment = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: "Flip no encontrado" })
        }

        let commentIndex = -1

        post.comments.forEach((item, index) => {
            if (item.user.toString() === req.user._id.toString()) {
                commentIndex = index;
            }
        })
        if (commentIndex !== -1) {

            post.comments[commentIndex].comment = req.body.comment;

            await post.save();

            return res.status(200).json({ success: true, message: "Fl!p comentado" });

        } else {
            post.comments.push({

                user: req.user._id,

                comment: req.body.comment

            });

            await post.save();
            return res.status(200).json({ success: true, message: "Fl!p comentado" })
        }


    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.deleteComment = async (req, res) => {

    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: "No existe ese Fl!p" })
        }

        if (post.owner.toString() === req.user._id.toString) {
            if (req.body.commentId == undefined) {
                return res.status(400).json({ success: false, message: "El id de ese comentario es necesario" })
            }

            post.comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1)
                }
            });

            await post.save();

            return res.status(200).json({ success: true, message: "Comentario seleccionado eliminado" })

        } else {

            post.comments.forEach((item, index) => {
                if (item.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1)
                }
            });

            await post.save();
            res.status(200).json({ success: true, message: "Comentario borrado" })

        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}