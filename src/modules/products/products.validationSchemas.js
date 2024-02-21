import joi from 'joi'

import {generalRules} from '../../utils/general.validation.rule.js'

export const addProductSchema = {
    query: joi.object({
        categoryId: generalRules.dbId,
        subCategoryId: generalRules.dbId,
        brandId: generalRules.dbId
    }),
    Headers: generalRules.headersRules
}

export const productSchema= {
    query: joi.object({
        productId: generalRules.dbId
    }),
    Headers: generalRules.headersRules
}

export const getProductByIdSchema= {
    query: joi.object({
        productId: generalRules.dbId
    })
}

export const getProductSchema= {
    query: joi.object({
        page: joi.number(),
        size: joi.number()
    }),
    Headers: generalRules.headersRules
}
