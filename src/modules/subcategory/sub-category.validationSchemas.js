import joi from 'joi'
import { generalRules } from '../../utils/general.validation.rule.js'

export const addSubCategorySchema = {
    params: joi.object({
        categoryId: generalRules.dbId
    }),
    Headers: generalRules.headersRules,
}

export const subCategorySchema = {
    params: joi.object({
        subCategoryId: generalRules.dbId
    }),
    Headers: generalRules.headersRules,
}