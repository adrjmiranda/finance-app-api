export interface ITokenPayload {
	sub: string;
}

export interface ITokenProvider {
	generate(payload: object, subject: string, expiresIn: string): string;
	verify(token: string): ITokenPayload;
}
