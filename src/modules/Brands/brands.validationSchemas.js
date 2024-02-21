import joi from 'joi'
import { generalRules } from '../../utils/general.validation.rule.js'

export const addBrand = {
    Headers: generalRules.headersRules,
}

export const brandSchema = {
    params: joi.object({
        brandId: generalRules.dbId
    }),
    Headers: generalRules.headersRules,
}
