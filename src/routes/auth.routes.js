import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { handleInputErrors } from "../middlewares/validation.js";
import { userValidation } from "../middlewares/user.js";
import { loginValidation, validatetoken } from "../middlewares/auth.js";
import { upload } from "../helpers/multer.js";


const routes = Router();

routes.post('/account', upload.single('profile_picture_url'), userValidation, handleInputErrors, AuthController.createAccount)
routes.post('/login',  loginValidation, AuthController.login)

export default routes;