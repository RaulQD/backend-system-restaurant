import jwt from 'jsonwebtoken'
import { UserModel } from '../models/user.js'
import { body } from 'express-validator';

const ERROR_MESSAGES = {
  TOKEN_MISSING: 'Token no proporcionado o formato incorrecto',
  USER_NOT_FOUND: 'Usuario no autorizado o no encontrado',
  TOKEN_INVALID: 'Token inválido o expirado',
  TOKEN_EXPIRED: 'Token expirado'
};

export const validateToken = async (req, res, next) => {
  // OBTENER EL TOKEN DESDE EL HEADER DE AUTORIZACIÓN
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error(ERROR_MESSAGES.TOKEN_MISSING);
    return res.status(401).json({
      message: error.message,
      status: false
    })
  }
  const [, token] = bearer.split(' ');
  if (!token) {
    return res.status(401).json({
      message: ERROR_MESSAGES.TOKEN_MISSING,
      status: false
    })
  }
  try {
    // DECODIFICAR EL TOKEN
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    if (!decoded.id) throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
    // Buscar usuario en la base de datos
    const user = await UserModel.findByUserId(decoded.id)
    if (!user) {
      return res.status(401).json({
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        status: false
      })
    }
    req.user = user
    next()
  } catch (error) {
    // Verificar si el token ha expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED, status: false });
    }
    // Manejar otros errores del token
    return res.status(401).json({ message: error.message, status: false });
  }
}
// Middleware para validar roles
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};

export const loginValidation = [
  body('username')
    .notEmpty().withMessage('El nombre de usuario es requerido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
]