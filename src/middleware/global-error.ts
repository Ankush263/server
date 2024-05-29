import { AppError } from '../utils/appError';
import { CastError, MongooseError } from 'mongoose';
import { NextFunction, Response, Request } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

interface CustomError extends MongooseError {
	status: string;
	error: string;
	message: string;
	stack: string;
	statusCode: number;
	isOperational: boolean;
}

const handleCastErrorDB = (err: CastError) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 401);
};

const handleDuplicateFieldsDB = (err: any) => {
	const value = Object.keys(err.keyValue)[0];
	const message = `Duplicate field value ${value}, Please use another value.`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
	const errors = Object.values(err.errors).map((el: any) => el.message);

	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = (err: JsonWebTokenError) =>
	new AppError(`Invalid token, Please log in again`, 401);

const handleJWTExpiredError = (err: JsonWebTokenError) =>
	new AppError(`Your token has expired!, Please log in again`, 401);

const sendErrorDev = (err: CustomError, res: Response) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

const sendErrorProd = (err: CustomError, res: Response) => {
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});
	} else {
		console.error('ERROR', err);
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
};

export const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	res.set('Access-Control-Allow-Origin', '*');

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = err;
		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
		if (error.name === 'TokenExpiredError')
			error = handleJWTExpiredError(error);
		sendErrorProd(error, res);
	}
};
