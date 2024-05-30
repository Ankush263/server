import pool from '../pool';
import { toCamelCase } from './utils/to-camel-case';

export interface ContactInterface {
	id: number;
	email: string;
	phoneNumber: string;
}

export class ContactRepo {
	static async create(
		phoneNumber: string,
		email: string,
		linkPrecedence: string
	) {
		const { rows } = await pool.query(
			`
        INSERT INTO contact(phoneNumber, email, linkPrecedence)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
			[phoneNumber, email, linkPrecedence]
		);
		return toCamelCase(rows)[0];
	}

	static async findByEmailOrPhone(email: string, phoneNumber: string) {
		const { rows } = await pool.query(
			`
				SELECT * FROM contact WHERE email IN ($1) OR phonenumber IN ($2)
      `,
			[email, phoneNumber]
		);
		return toCamelCase(rows);
	}

	static async findByEmailAndPhone(email: string, phoneNumber: string) {
		const { rows } = await pool.query(
			`
				SELECT * FROM contact WHERE email IN ($1) AND phonenumber IN ($2)
      `,
			[email, phoneNumber]
		);
		return toCamelCase(rows);
	}

	static async updateToPrimary(id: number) {
		const { rows } = await pool.query(
			`
				UPDATE contact SET linkPrecedence = $1 WHERE id = $2
			`,
			['primary', id]
		);
		return toCamelCase(rows);
	}

	static async updateToSecondery(linkedId: number, id: number) {
		const { rows } = await pool.query(
			`
				UPDATE contact SET linkedId = $1, linkPrecedence = $2 WHERE id = $3
			`,
			[linkedId, 'secondary', id]
		);
		return toCamelCase(rows);
	}
}
