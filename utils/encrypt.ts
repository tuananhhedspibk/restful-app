import * as bcrypt from 'bcrypt';
import md5 from 'md5';

import * as jwt from 'jsonwebtoken';
import { config } from '@config/jwt';
import { z } from 'zod';

const SALT_ROUND = 10;

export type AuthTokenParams = z.infer<typeof AuthenTokenParamsSchema>;
export const AuthenTokenParamsSchema = z.object({
  userId: z.string(),
  email: z.string(),
});

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
    expiresIn: '7D',
  });
};

export const verifyJWT = (jwtToken: string): [boolean, any, Error] => {
  let decoded: jwt.JwtPayload | string;

  try {
    decoded = jwt.verify(jwtToken, config.secrete);

    return [true, decoded, null];
  } catch (err) {
    return [false, null, err];
  }
};
