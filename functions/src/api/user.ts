import express from 'express';
import getUserController from '../controller/getUserController';
const router = express.Router();

router.get('/getUser', getUserController);

module.exports = router;