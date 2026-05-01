import { container } from 'tsyringe';

import { JasonWebTokenProvider } from '#/shared/containers/providers/TokenProvider/implementations/JSONWebTokenProvider.js';
import type { ITokenProvider } from '#/shared/containers/providers/TokenProvider/models/ITokenProvider.js';

container.registerSingleton<ITokenProvider>(
  'TokenProvider',
  JasonWebTokenProvider
);
