import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const payload = {
    id: user.id_user,
    username: user.username,
    role: user.role_name
  };

  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  return token;
}