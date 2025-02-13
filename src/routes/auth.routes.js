import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { userValidation } from "../middlewares/user.js";
import { loginValidation, validateToken } from "../middlewares/auth.js";
import { upload } from "../helpers/multer.js";


const routes = Router();

routes.get('/profile', validateToken, AuthController.getProfile);
routes.post('/account', upload.single('image'), userValidation, handleInputErrors, AuthController.createAccount)
routes.post('/login',  loginValidation, AuthController.login)

export default routes;