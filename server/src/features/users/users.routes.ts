import { Router } from 'express';
import * as usersController from './users.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', usersController.createUser);
router.post('/sync', requireAuth, usersController.syncUser);
router.get('/:id', usersController.getUserById);

export default router;
