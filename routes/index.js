import { getStats, getStatus } from '../controllers/AppController';
import { postNew, getMe } from '../controllers/UsersController';
import { getConnect, getDisconnect } from '../controllers/AuthController';
import postUpload from '../controllers/FilesController';

const express = require('express');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/status', getStatus);
router.get('/stats', getStats);

router.post('/users', postNew);

router.get('/connect', getConnect);
router.get('/disconnect', getDisconnect);
router.get('/users/me', getMe);

router.post('/files', postUpload);

export default router;
