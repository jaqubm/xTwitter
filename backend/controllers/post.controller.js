import { v2 as cloudinary } from "cloudinary";

import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post
            .find()
            .sort({ createdAt: -1 })
            .populate("user", "username profileImg")
            .populate("comments.user", "username profileImg");

        if (posts.length === 0) return res.status(200).json([]);

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: "Internal Server error" });
        console.error(error.message);
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const following = user.following;

        const feedPosts = await Post
            .find({ user: { $in: following } })
            .sort({ createdAt: -1 })
            .populate("user", "username profileImg")
            .populate("comments.user", "username profileImg");

        res.status(200).json(feedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal Server error" });
        console.error(error.message);
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const likedPosts = await Post
            .find({ _id: { $in: user.likedPosts } })
            .populate("user", "username profileImg")
            .populate("comments.user", "username profileImg");

        res.status(200).json(likedPosts);
    } catch (error) {
        res.status(500).json({ error: "Internal Server error" });
        console.error(error.message);
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Post
            .find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate("user", "username profileImg")
            .populate("comments.user", "username profileImg");

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Internal Server error" });
        console.error(error.message);
    }
}

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!text && !img) return res.status(400).json({ error: "Text or image is required" });

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: "Internal Server error" });
        console.error(error.message);
    }
}

export const likeOrUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

            await Notification.findOneAndDelete({ from: userId, to: post.user, type: "like" });

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());

            res.status(200).json(updatedLikes);
        } else {
            post.likes.push(userId);
            await post.save();
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
            });

            await notification.save();

            const updatedLikes = post.likes;

            res.status(200).json(updatedLikes);
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server error" });
        console.error(error.message);
    }
}

export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if (!text) return res.status(400).json({ message: "Text is required" });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const newComment = {
            user: userId,
            text,
        }

        post.comments.push(newComment);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Internal Server error" });
        console.error(error.message);
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: "You are not authorized to delete this post" });

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server error" });
        console.error(error.message);
    }
}