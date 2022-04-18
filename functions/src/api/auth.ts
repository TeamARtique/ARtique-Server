import express from 'express';
import kakaoController from '../controller/auth/kakaoController';
const router = express.Router();

router.post('/kakaoLogin', kakaoController);

module.exports = router;
