import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByCurrentUser = await User.findById(userId).select("following");

        const users = await User.aggregate([
            { $match: { _id: { $ne: userId } } },
            { $sample: { size: 10 } }
        ]);

        const filteredUsers = users.filter(user => !usersFollowedByCurrentUser.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const followOrUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;

        const currentUser = await User.findById(req.user._id);
        const userToModify = await User.findById(id);

        if (id === req.user._id.toString()) return res.status(400).json({ error: "You can't follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(404).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: id
            });

            await newNotification.save();

            // TODO: Return the id of the user as the response

            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { username, fullName, email, currentPassword, newPassword, bio, link } = req.body;
        let { profileImg, coverImg } = req.body;

        const userId = req.user._id;

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Password updating
        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)) return res.status(400).json({ error: "Please provide both current and new password" });

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });

            if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters long" });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // ProfileImg updating
        if (profileImg) {
            if (user.profileImg) await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }

        // CoverImg updating
        if (coverImg) {
            if (user.coverImg) await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        user.username = username || user.username;
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}