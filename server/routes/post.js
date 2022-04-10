const express = require('express');
const { createPost, likeAndUnlikePost, deletePost, getPostOffFollowing, updateCaption, addComment, deleteComment } = require('../controllers/post');
const { isAuthenticated } = require('../middlewares/auth')
const router = express.Router()

router.route("/post/upload").post(isAuthenticated, createPost);

router.route("/post/:id").get(isAuthenticated, likeAndUnlikePost);

router.route("/post/:id/")
    .get(isAuthenticated, likeAndUnlikePost)
    .put(isAuthenticated, updateCaption)
    .delete(isAuthenticated, deletePost);

router.route("/posts").get(isAuthenticated, getPostOffFollowing);

router.route("/posts/comment/:id").put(isAuthenticated, addComment).delete(isAuthenticated, deleteComment);

module.exports = router;