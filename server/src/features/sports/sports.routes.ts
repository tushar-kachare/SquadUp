import {Router} from 'express';
import * as sportsController from './sports.controller.js';

const router = Router();

router.get('/', sportsController.getAllSports);

export default router;