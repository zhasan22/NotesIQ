const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/info', verifyToken, profileController.getUserInfo);
router.patch('/username', verifyToken, profileController.updateUsername);
router.patch('/password', verifyToken, profileController.updatePassword);
router.patch('/avatar', verifyToken, profileController.updateAvatar);

module.exports = router;
