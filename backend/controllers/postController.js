const Post = require('../models/Post');

// Get all posts, with the featured post first
exports.getPosts = async (req, res) => {
    try {
        // Find the single featured post
        const featuredPost = await Post.findOne({ isFeatured: true });
        // Find all other posts, sorted by newest first, excluding the featured one if it exists
        const otherPosts = await Post.find({ _id: { $ne: featuredPost?._id } }).sort({ createdAt: -1 });

        const posts = featuredPost ? [featuredPost, ...otherPosts] : otherPosts;
        
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a post
exports.createPost = async (req, res) => {
    try {
        const postData = req.body;
        // If this post is being featured, un-feature all other posts first
        if (postData.isFeatured) {
            await Post.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
        }
        const newPost = new Post(postData);
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const postData = req.body;
        // If this post is being featured, un-feature all other posts first
        if (postData.isFeatured) {
            await Post.updateMany({ _id: { $ne: req.params.id }, isFeatured: true }, { $set: { isFeatured: false } });
        }
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, postData, { new: true });
        if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};