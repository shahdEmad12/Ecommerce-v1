import joi from 'joi'

export const addCategory = {
    body: joi.object({
        name: joi.string().required(),
    }),
    Headers: generalRules.headersRules,
}

export const updateCategorySchema = {
    body: joi.object({
        name: joi.string(),
        oldPublicId: joi.string(),
    }),
    params: joi.object({
        categoryId: joi.string().required(),
    }),
    Headers: generalRules.headersRules,
}