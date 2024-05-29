import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { router } from '../src/routes/index';
import { globalErrorHandler } from './middleware/global-error';
import pool from './pool';

const app: Express = express();

app.use(cors());
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api/v1', router);

app.use(globalErrorHandler as express.ErrorRequestHandler);

export default app;
