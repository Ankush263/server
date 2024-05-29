import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (
	req: Request,
	res: Response,
	next: NextFunction
) => Promise<unknown>;

export const catchAsync = (asyncFunction: AsyncFunction) => {
	return (req: Request, res: Response, next: NextFunction) => {
		asyncFunction(req, res, next).catch((err: unknown) => {
			next(err);
		});
	};
};
