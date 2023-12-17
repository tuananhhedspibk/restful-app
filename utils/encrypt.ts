import * as bcrypt from 'bcrypt';
import md5 from 'md5';

import * as jwt from 'jsonwebtoken';
import { config } from '@config/jwt';

const SALT_ROUND = 10;

export const hashString = (source: string): string => {
  return md5(source);
};

export const hashPassword = (barePassword: string, salt: string): string => {
  return bcrypt.hashSync(barePassword, salt);
};

export const randomlyGenerateSalt = (): string => {
  return bcrypt.genSaltSync(SALT_ROUND);
};

export const generateJWT = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, config.secrete, {
    expiresIn: config.expireTime,
  });
};
