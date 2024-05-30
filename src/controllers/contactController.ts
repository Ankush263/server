import { catchAsync } from '../utils/catchAsync';
import { ContactRepo } from '../repo/contact-repo';
import dotenv from 'dotenv';
import { NextFunction, Response, Request } from 'express';

dotenv.config();

export const createContact = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { phoneNumber, email } = req.body;

		const returnDetails = (
			primaryContact: {
				id: number;
				email: string;
				phonenumber: string;
			},
			secondaryContacts: any
		) => {
			return res.json({
				contact: {
					primaryContactId: primaryContact.id,
					emails: Array.from(
						new Set(
							[
								primaryContact.email,
								...secondaryContacts.map((contact: any) => contact.email),
							].filter(Boolean)
						)
					),
					phoneNumbers: Array.from(
						new Set(
							[
								primaryContact.phonenumber,
								...secondaryContacts.map((contact: any) => contact.phonenumber),
							].filter(Boolean)
						)
					),
					secondaryContactIds: secondaryContacts.map(
						(contact: { id: number }) => contact.id
					),
				},
			});
		};

		let primaryContact: any;
		let secondaryContacts: any;
		let existingContact: any;

		existingContact = await ContactRepo.findByEmailOrPhone(email, phoneNumber);

		// If there is no existing contact, then create a new one
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

		/*
		If there are some existing contact
			Check if that contact is Already exists or not
				If yes, then return that contact 
		*/

		const exactContact: any = await ContactRepo.findByEmailAndPhone(
			email,
			phoneNumber
		);

		if (exactContact.length > 0) {
			primaryContact = existingContact.find(
				(contact: { linkprecedence: string }) =>
					contact.linkprecedence === 'primary'
			);

			secondaryContacts = (
				await ContactRepo.findByEmailOrPhone(email, phoneNumber)
			).filter((contact: { id: number }) => contact.id !== primaryContact.id);

			return returnDetails(primaryContact, secondaryContacts);
		}

		primaryContact = existingContact.find(
			(contact: { linkprecedence: string }) =>
				contact.linkprecedence === 'primary'
		);

		secondaryContacts = (
			await ContactRepo.findByEmailOrPhone(email, phoneNumber)
		).filter((contact: { id: number }) => contact.id !== primaryContact.id);

		if (secondaryContacts.length > 0) {
			await Promise.all(
				secondaryContacts.map(
					async (contact: { id: number; linkprecedence: string }) => {
						if (contact.linkprecedence === 'primary') {
							await ContactRepo.updateToSecondery(
								primaryContact.id,
								contact.id
							);
						}
					}
				)
			);

			return returnDetails(primaryContact, secondaryContacts);
		}

		// Create a new secondary contact

		const newSecondaryContact: any = await ContactRepo.create(
			phoneNumber,
			email,
			'secondary'
		);

		await ContactRepo.updateToSecondery(
			primaryContact.id,
			newSecondaryContact.id
		);

		secondaryContacts = (
			await ContactRepo.findByEmailOrPhone(email, phoneNumber)
		).filter((contact: { id: number }) => contact.id !== primaryContact.id);

		return returnDetails(primaryContact, secondaryContacts);
	}
);
