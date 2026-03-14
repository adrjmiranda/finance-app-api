import { ERROR_CODES } from '#/shared/constants/errors/codes/codes.js';

export class AppError extends Error {
	public readonly code: keyof typeof ERROR_CODES;
	public readonly status: number;

	constructor(code: keyof typeof ERROR_CODES, status: number) {
		super(code);
		this.code = code;
		this.status = status;
	}
}
