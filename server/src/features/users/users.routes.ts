import { Router } from 'express';
import * as usersController from './users.controller.js';

const router = Router();

router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);

export default router;