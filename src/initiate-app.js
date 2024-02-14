import db_connection from '../DB/connection.js'
import { globalResponse } from './middlewares/global-response.middleware.js'

import * as routers from '../src/modules/index.routes.js'
import { rollbackUploadedFiles } from './middlewares/rollback-uploaded-files.middleware.js'
import { rollbackSavedDocuments } from './middlewares/rollback-saved-documents.middleware.js'

export const initiateApp = (app,express) => {
    const port = process.env.port
    app.use(express.json())

    db_connection()
    app.use('/user', routers.userRouter)
    app.use('/auth', routers.authRouter)
    app.use('/category', routers.categoryRouter) 
    app.use('/subcategory', routers.subCategoryRouter)
    app.use('/brand', routers.brandRouter)
    app.use('/product', routers.productRouter) 

    app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments)
    app.listen(port, ()=> console.log(`server running on ${port}`))
}