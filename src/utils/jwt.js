import jwt from 'jsonwebtoken';

export const generateJWT = (user) => {
  const payload = {
    id: user.id,
  };
 
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: '2h'
  })
  return token;
}