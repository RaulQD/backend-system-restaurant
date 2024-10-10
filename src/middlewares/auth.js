import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.js'
import { body } from 'express-validator';

export const validateToken = async (req, res, next) => {
  // OBTENER EL TOKEN DESDE EL HEADER DE AUTORIZACIÓN
  const authorization = req.headers.authorization;

  // SI NO HAY UN TOKEN, RETORNAR ERROR
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o formato incorrecto' });
  }
  // SEPARA EL TOKEN DEL BEARER
  const token = authorization.split(' ')[1]
  console.log('token : ', token)
  try {
    // DECODIFICAR EL TOKEN
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    console.log('decoded :', decoded)
    const user = await UserModel.findByUserId(decoded.id)
    console.log('user', user);
    if (!user) {
      const error = new Error('No autorizado')
      return res.status(401).json({ error: error.message })
    }
    req.user = user

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  next();

}

export const loginValidation = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
]