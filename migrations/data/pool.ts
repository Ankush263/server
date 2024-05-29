import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new pg.Pool({
	host: process.env.HOST,
	port: 5432,
	database: process.env.DATABASE,
	user: process.env.USER,
	password: process.env.PASSWORD,
});
