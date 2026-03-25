const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const getUserInfo = async (req, res) => {
  const userId = req.user.userId;
  try {
    const getUser = await userModel.findUserByUserId(userId);
    if (!getUser) {
      logger.warn({ userId }, 'User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info({ userId }, 'Fetched user info successfully');
    res.status(200).json(getUser);
  } catch (err) {
    logger.error({ err, userId }, 'Error fetching user info');
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateUsername = async (req, res) => {
  const userId = req.user.userId;
  const { newUsername } = req.body;

  if (!newUsername || newUsername.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }

  try {
    const existing = await userModel.findUserByUsername(newUsername.trim());
    if (existing) {
      return res.status(409).json({ error: 'Username is already taken.' });
    }
    const updated = await userModel.updateUsername(userId, newUsername.trim());
    logger.info({ userId, newUsername }, 'Username updated');
    res.status(200).json({ message: 'Username updated successfully.', username: updated.username });
  } catch (err) {
    logger.error({ err, userId }, 'Error updating username');
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updatePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await userModel.findPasswordHashById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashed);

    logger.info({ userId }, 'Password updated');
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    logger.error({ err, userId }, 'Error updating password');
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateAvatar = async (req, res) => {
  const userId = req.user.userId;
  const { avatarBase64 } = req.body;

  if (!avatarBase64) {
    return res.status(400).json({ error: 'Avatar data is required.' });
  }

  // Limit size to ~2MB in base64
  if (avatarBase64.length > 2_800_000) {
    return res.status(400).json({ error: 'Image too large. Max 2MB.' });
  }

  try {
    const updated = await userModel.updateAvatar(userId, avatarBase64);
    logger.info({ userId }, 'Avatar updated');
    res.status(200).json({ message: 'Avatar updated successfully.', avatar_url: updated.avatar_url });
  } catch (err) {
    logger.error({ err, userId }, 'Error updating avatar');
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getUserInfo, updateUsername, updatePassword, updateAvatar };
