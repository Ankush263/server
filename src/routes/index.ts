import { Router } from 'express';
import { router as contactRouter } from './contact.routes';

export const router = Router();

router.use('/contact', contactRouter);
