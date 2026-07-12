import bcrypt from 'bcrypt';
import { bcryptConfig } from '../config/jwt';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, bcryptConfig.saltRounds);
};

export const comparePassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};
