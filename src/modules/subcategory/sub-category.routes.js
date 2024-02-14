import { Router } from "express"
import expressAsyncHandler from "express-async-handler"

import { endPointsRoles } from "./sub-category.endpoints.js"
import {multerMiddleHost} from '../../middlewares/multer.js'
import * as subCategoryController from './sub-category.controller.js'
import {auth} from '../../middlewares/auth.middleware.js'
import {allowedExtensions} from '../../utils/allowed-extensions.js'

const router = Router()

router.post('/:categoryId',
    auth(endPointsRoles.SUB_CREATOR),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))

router.put('/:subCategoryId',
    auth(endPointsRoles.SUB_CREATOR),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))

router.delete('/:subCategoryId',
    auth(endPointsRoles.SUB_CREATOR),
    expressAsyncHandler(subCategoryController.deleteSubCategories))

router.get('/',
    expressAsyncHandler(subCategoryController.SubCategoriesWithBrand))
export default router