import { container } from 'tsyringe';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';
import { JasonWebTokenProvider } from '#/shared/containers/providers/TokenProvider/implementations/JSONWebTokenProvider.js';

container.registerSingleton<ITokenProvider>(
	'TokenProvider',
	JasonWebTokenProvider
);
