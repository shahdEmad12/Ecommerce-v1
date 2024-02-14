import joi from 'joi'

export const addSubCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
    }),
    params: joi.object({
        categoryId: joi.string().required()
    }),
    Headers: generalRules.headersRules,
}

export const updateSubCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
        oldPublicId: joi.string().required()
    }),
    params: joi.object({
        subCategoryId: joi.string().required()
    }),
    Headers: generalRules.headersRules,
}

export const deleteSubCategorySchema = {
    params: joi.object({
        subCategoryId: joi.string().required()
    }),
    Headers: generalRules.headersRules,
}