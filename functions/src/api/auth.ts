import express from 'express';
import kakaoController from '../controller/kakaoController';
const router = express.Router();

router.post('/kakaoLogin', kakaoController);

module.exports = router;
