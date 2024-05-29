import app from './src/app';
import pool from './src/pool';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8000;

const connect = async () => {
	try {
		await pool.connect({
			host: process.env.HOST,
			port: 5432,
			database: process.env.DATABASE,
			user: process.env.USER,
			password: process.env.PASSWORD,
			ssl: {
				rejectUnauthorized: false,
			},
		});

		app.listen(port, () => {
			console.log(`You are listening to the port ${port}`);
		});
	} catch (error) {
		console.error(error);
	}
};

connect();
