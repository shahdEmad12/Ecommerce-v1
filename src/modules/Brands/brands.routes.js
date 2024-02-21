import { Router } from "express"
import expressAsyncHandler from "express-async-handler"

import { endPointsRoles } from './brands.endpoints.js'
import {multerMiddleHost} from '../../middlewares/multer.js'
import {auth} from '../../middlewares/auth.middleware.js'
import {allowedExtensions} from '../../utils/allowed-extensions.js'
import * as brandController from '../Brands/brands.controller.js'
import { validationMiddleware } from "../../middlewares/validation.middleware.js"
import * as validationSchemas from './brands.validationSchemas.js'

const router = Router()

router.post('/', auth(endPointsRoles.ADD_BRAND),
    validationMiddleware(validationSchemas.addBrand),
    multerMiddleHost({extensions: allowedExtensions.image}).single('image'),
    expressAsyncHandler(brandController.addBrand))

router.put('/:brandId', auth(endPointsRoles.ADD_BRAND),
    validationMiddleware(validationSchemas.brandSchema),
    multerMiddleHost({extensions: allowedExtensions.image}).single('image'),
    expressAsyncHandler(brandController.updateBrand))

router.delete('/delete/:brandId', validationMiddleware(validationSchemas.brandSchema),auth(endPointsRoles.ADD_BRAND), expressAsyncHandler(brandController.deleteBrand));


router.get('/', expressAsyncHandler(brandController.getAllBrands))

export default router