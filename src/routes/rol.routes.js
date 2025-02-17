import { Router } from "express";
import { authorizeRole, validateToken } from "../middlewares/auth.js";
import { RolController } from "../controllers/RolController.js";


const routes = Router();


routes.get('/', validateToken, authorizeRole(['administrador']), RolController.getRoles);


export default routes;