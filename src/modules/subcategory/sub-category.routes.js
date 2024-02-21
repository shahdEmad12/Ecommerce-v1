import { Router } from "express"
import expressAsyncHandler from "express-async-handler"

import { endPointsRoles } from "./sub-category.endpoints.js"
import {multerMiddleHost} from '../../middlewares/multer.js'
import * as subCategoryController from './sub-category.controller.js'
import {auth} from '../../middlewares/auth.middleware.js'
import {allowedExtensions} from '../../utils/allowed-extensions.js'
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import * as validationSchemas from './sub-category.validationSchemas.js'

const router = Router()

router.post('/:categoryId',
    auth(endPointsRoles.SUB_CREATOR),
    validationMiddleware(validationSchemas.addSubCategory),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))

router.put('/:subCategoryId',
    auth(endPointsRoles.SUB_CREATOR),
    validationMiddleware(validationSchemas.subCategorySchema),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))

router.delete('/:subCategoryId',
    auth(endPointsRoles.SUB_CREATOR),
    validationMiddleware(validationSchemas.subCategorySchema),
    expressAsyncHandler(subCategoryController.deleteSubCategories))

router.get('/',
    expressAsyncHandler(subCategoryController.SubCategoriesWithBrand))
export default router