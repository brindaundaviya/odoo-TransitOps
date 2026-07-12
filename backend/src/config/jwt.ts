import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  algorithm: 'HS256' as const,
};

export const bcryptConfig = {
  saltRounds: env.BCRYPT_SALT_ROUNDS,
};
