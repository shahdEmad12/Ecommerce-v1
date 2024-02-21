import { Router } from 'express'
import expressAsyncHandler from 'express-async-handler'

import * as productController from './product.controller.js'
import { auth } from '../../middlewares/auth.middleware.js'
import { multerMiddleHost } from '../../middlewares/multer.js'
import { allowedExtensions } from '../../utils/allowed-extensions.js'
import { endPointsRoles } from './product.endpoints.js'
import { validationMiddleware } from '../../middlewares/validation.middleware.js'
import * as validationSchemas from './products.validationSchemas.js'
const router = Router()



router.post('/',
    auth(endPointsRoles.ADD_PRODUCT),
    validationMiddleware(validationSchemas.addProductSchema),
    multerMiddleHost({ extensions: allowedExtensions.image }).array('image', 3),
    expressAsyncHandler(productController.addProduct)
)


router.put('/:productId',
    auth(endPointsRoles.ADD_PRODUCT),
    validationMiddleware(validationSchemas.productSchema),
    multerMiddleHost({ extensions: allowedExtensions.image }).single('image'),
    expressAsyncHandler(productController.updateProduct)
)

router.delete('/:productId',
    auth(endPointsRoles.ADD_PRODUCT), 
    validationMiddleware(validationSchemas.productSchema), 
    expressAsyncHandler(productController.deleteProduct)
)

router.get('/byid/:productId',
    expressAsyncHandler(productController.getProductById)
)

router.get('/search',
    expressAsyncHandler(productController.searchProducts)
)

router.get('/allproducts',
    expressAsyncHandler(productController.getAllProducts)
)

router.get('/filter',
    expressAsyncHandler(productController.filterProducts)
)

export default router