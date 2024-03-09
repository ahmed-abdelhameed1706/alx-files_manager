import bodyParser from 'body-parser';
import { getStats, getStatus } from '../controllers/AppController';
import { postNew } from '../controllers/UsersController';

const express = require('express');

const router = express.Router();

router.use(bodyParser.json());
router.get('/status', getStatus);
router.get('/stats', getStats);

router.post('/users', postNew);

export default router;
