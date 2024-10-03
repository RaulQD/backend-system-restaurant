import jwt from 'jsonwebtoken';

export const generateToken = (payload) => {
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  return token;
}