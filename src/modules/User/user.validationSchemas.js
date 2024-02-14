import joi from 'joi'

export const updateUserSchema = {
    body: joi.object({
        username: joi.string().optional(),
        email: joi.string().email().optional(),
        password: joi.string().optional(),
        age: joi.number().optional(),
        role: joi.string().valid(...Object.values(systemRoles)).default(systemRoles.USER),
        phoneNumbers: joi.array().optional(),
        addresses: joi.array().optional()
    }),
    headers: generalRules.headersRules,
}
export const authSchema = {
    headers: generalRules.headersRules,
}