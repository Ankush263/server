import { createContact } from '../controllers/contactController';
import { Router } from 'express';

export const router = Router();

router.route('/').post(createContact);
