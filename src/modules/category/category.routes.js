import { Router } from "express"
const router = Router()
import expressAsyncHandler from "express-async-handler"

import { endPointsRoles } from "./category.endpoints.js"
import {multerMiddleHost} from '../../middlewares/multer.js'
import * as categoryController from './category.controller.js'
import {auth} from '../../middlewares/auth.middleware.js'
import {allowedExtensions} from '../../utils/allowed-extensions.js'


router.post('/add', auth(endPointsRoles.ADD_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'),
                expressAsyncHandler(categoryController.addCategory))

router.put('/:categoryId', auth(endPointsRoles.ADD_CATEGORY), multerMiddleHost({extensions: allowedExtensions.image}).single('image'),
                expressAsyncHandler(categoryController.updateCategory))

router.get('/', expressAsyncHandler(categoryController.getAllCategories))

router.delete('/:categoryId', auth(endPointsRoles.ADD_CATEGORY), expressAsyncHandler(categoryController.deleteCategories))

export default router