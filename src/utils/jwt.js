import jwt from 'jsonwebtoken';

export const generateJWT = (user) => {
  const payload = {
    id: user.id,
    role_name:user.role_name,
  };
 
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '8h'
  })
  return token;
}