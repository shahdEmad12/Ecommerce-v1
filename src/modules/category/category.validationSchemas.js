import joi from 'joi'
import { generalRules } from '../../utils/general.validation.rule.js'

export const addCategory = {
    Headers: generalRules.headersRules,
}

export const updateCategorySchema = {
    params: joi.object({
        categoryId: generalRules.dbId
    }),
    Headers: generalRules.headersRules,
}