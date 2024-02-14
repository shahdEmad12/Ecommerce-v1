import joi from 'joi'

export const addBrand = {
    body: joi.object({
        name: joi.string().required(),
    }),
    Headers: generalRules.headersRules,
}

export const updateBrandSchema = {
    body: joi.object({
        name: joi.string(),
        oldPublicId: joi.string(),
    }),
    params: joi.object({
        brandId: joi.string().required()
    }),
    Headers: generalRules.headersRules,
}

export const deleteBrandSchema = {
    params: joi.object({
        brandId: joi.string().required()
    }),
    Headers: generalRules.headersRules,
}