// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Helper: remove sensitive fields before sending user to client
 */
function safeUserObject(user) {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;
  return obj;
}

/**
 * GET PROFILE
 */
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * UPDATE PROFILE
 * Accepts: name, bio, location, occupation, dateOfBirth, avatar
 */
const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { name, bio, location, occupation, dateOfBirth, avatar } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Basic validation & sanitization
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Invalid name' });
      }
      user.name = name.trim();
    }

    if (bio !== undefined) {
      if (bio !== null && typeof bio !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid bio' });
      }
      user.bio = bio === null ? '' : String(bio).trim();
    }

    if (location !== undefined) {
      if (location !== null && typeof location !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid location' });
      }
      user.location = location === null ? '' : String(location).trim();
    }

    if (occupation !== undefined) {
      if (occupation !== null && typeof occupation !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid occupation' });
      }
      user.occupation = occupation === null ? '' : String(occupation).trim();
    }

    if (dateOfBirth !== undefined) {
      // Accept ISO date string or null to clear
      if (dateOfBirth === null || dateOfBirth === '') {
        user.dateOfBirth = null;
      } else {
        const d = new Date(dateOfBirth);
        if (Number.isNaN(d.getTime())) {
          return res.status(400).json({ success: false, message: 'Invalid dateOfBirth' });
        }
        user.dateOfBirth = d;
      }
    }

    if (avatar !== undefined) {
      if (avatar !== null && typeof avatar !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid avatar' });
      }
      user.avatar = avatar === null ? '' : String(avatar).trim();
    }

    await user.save();

    const safe = safeUserObject(user);
    res.json({ success: true, data: safe });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * UPDATE SETTINGS
 * Merges incoming settings with existing settings object.
 * Only merges plain objects; prevents accidental overwrite with non-object.
 */
const updateSettings = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
      return res.status(400).json({ success: false, message: 'Invalid settings payload' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.settings = { ...(user.settings || {}), ...incoming };
    await user.save();

    res.json({ success: true, data: user.settings });
  } catch (err) {
    console.error('updateSettings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * CHANGE PASSWORD
 * Requires: currentPassword, newPassword
 * - Validates presence
 * - Verifies current password
 * - Prevents reusing same password
 * - Hashes with configurable salt rounds
 */
const changePassword = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ success: false, message: 'New password must be different from current password' });
    }

    const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET STATS
 * Placeholder — implement real logic as needed.
 */
const getStats = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Example: return simple counts or computed stats later
    const stats = {
      postsCount: 0,
      followersCount: 0,
      followingCount: 0
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateSettings,
  changePassword,
  getStats
};