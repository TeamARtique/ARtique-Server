import express from 'express';
import kakaoController from '../controller/auth/kakaoController';
import renewalTokenController from '../controller/auth/renewalTokenController';
const router = express.Router();

router.post('/kakaoLogin', kakaoController);
router.post('/token', renewalTokenController);

module.exports = router;
