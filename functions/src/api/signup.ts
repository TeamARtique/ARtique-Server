import express from 'express';
import userSignupController from '../controller/userSignupController';
const router = express.Router();

router.post('/signup', userSignupController);

module.exports = router;