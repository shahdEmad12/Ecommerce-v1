
import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import {auth} from '../../middlewares/auth.middleware.js'
import { endPointsRoles } from "./user.endpoints.js";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import * as userController from '../User/user.controller.js'
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validationSchemas from './user.validationSchemas.js'
const router = Router();

router.put('/update', auth(endPointsRoles.USER), 
validationMiddleware(validationSchemas.updateUserSchema),
    multerMiddleHost({extentions: allowedExtensions.image}).single(),
    expressAsyncHandler(userController.updateUser)
    )

router.delete('/', auth(endPointsRoles.USER), 
    validationMiddleware(validationSchemas.authSchema),
    expressAsyncHandler(userController.deleteUser)
    )

router.get('/userprofile', auth(endPointsRoles.USER), 
    expressAsyncHandler(userController.getUserProfile)
    )


export default router;