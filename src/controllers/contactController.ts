import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';
import { ContactRepo } from '../repo/contact-repo';
import dotenv from 'dotenv';
import { NextFunction, Response, Request } from 'express';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { ContactInterface } from '../repo/contact-repo';

dotenv.config();

export const createContact2 = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { phoneNumber, email } = req.body;

		const existingContact: any = await ContactRepo.findByEmailOrPhone(
			email,
			phoneNumber
		);

		if (existingContact.length === 0) {
			const contact: any = await ContactRepo.create(
				phoneNumber,
				email,
				'primary'
			);

			return res.json({
				contact: {
					primaryContactId: contact.id,
					emails: [contact.email],
					phoneNumbers: [contact.phonenumber],
					secondaryContactIds: [],
				},
			});
		}

		let primaryContact = existingContact.find(
			(contact: { linkprecedence: string }) =>
				contact.linkprecedence === 'primary'
		);

		console.log('primaryContact: ', primaryContact);

		if (!primaryContact) {
			await ContactRepo.updateToPrimary(existingContact[0].id);
		}

		const secondaryContacts = existingContact.filter(
			(contact: { id: number }) => contact.id !== primaryContact.id
		);

		await Promise.all(
			secondaryContacts.map(async (contact: { id: number }) => {
				await ContactRepo.updateToSecondery(primaryContact.id, contact.id);
			})
		);

		return res.json({
			contact: {
				primaryContactId: primaryContact.id,
				emails: [
					primaryContact.email,
					...secondaryContacts
						.map((contact: { email: string }) => contact.email)
						.filter(Boolean),
				],
				phoneNumbers: [
					primaryContact.phonenumber,
					...secondaryContacts
						.map((contact: { phonenumber: string }) => contact.phonenumber)
						.filter(Boolean),
				],
				secondaryContactIds: secondaryContacts.map(
					(contact: { id: number }) => contact.id
				),
			},
		});
	}
);

export const createContact = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { phoneNumber, email } = req.body;

		const existingContact: any = await ContactRepo.findByEmailOrPhone(
			email,
			phoneNumber
		);

		if (existingContact.length > 0) {
			const contact: any = await ContactRepo.create(
				phoneNumber,
				email,
				'secondery'
			);
		}

		const contact: any = await ContactRepo.create(
			phoneNumber,
			email,
			'primary'
		);

		return res.json({
			contact: {
				primaryContactId: contact.id,
				emails: [contact.email],
				phoneNumbers: [contact.phonenumber],
				secondaryContactIds: [],
			},
		});

		// let primaryContact = existingContact.find(
		// 	(contact: { linkprecedence: string }) =>
		// 		contact.linkprecedence === 'primary'
		// );

		// console.log('primaryContact: ', primaryContact);

		// if (!primaryContact) {
		// 	await ContactRepo.updateToPrimary(existingContact[0].id);
		// }

		// const secondaryContacts = existingContact.filter(
		// 	(contact: { id: number }) => contact.id !== primaryContact.id
		// );

		// await Promise.all(
		// 	secondaryContacts.map(async (contact: { id: number }) => {
		// 		await ContactRepo.updateToSecondery(primaryContact.id, contact.id);
		// 	})
		// );

		// return res.json({
		// 	contact: {
		// 		primaryContactId: primaryContact.id,
		// 		emails: [
		// 			primaryContact.email,
		// 			...secondaryContacts
		// 				.map((contact: { email: string }) => contact.email)
		// 				.filter(Boolean),
		// 		],
		// 		phoneNumbers: [
		// 			primaryContact.phonenumber,
		// 			...secondaryContacts
		// 				.map((contact: { phonenumber: string }) => contact.phonenumber)
		// 				.filter(Boolean),
		// 		],
		// 		secondaryContactIds: secondaryContacts.map(
		// 			(contact: { id: number }) => contact.id
		// 		),
		// 	},
		// });
	}
);
