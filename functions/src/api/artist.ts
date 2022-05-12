import express from 'express';
import artistController from '../controller/artist/artistController';
const { checkUser } = require("../middleware/auth");
const router = express.Router();

/* [GET] */
router.get('/:artistId', checkUser, artistController);

module.exports = router;
