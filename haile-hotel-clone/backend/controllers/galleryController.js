import Gallery from '../models/Gallery.js';

export const getGallery = async (req, res) => {
  try {
    const { category, featured } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const gallery = await Gallery.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
