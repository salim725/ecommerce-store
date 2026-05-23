import Joi from 'joi'

const objectIdField = Joi.string().length(24).hex().required()
    .messages({
        'string.length': 'ID must be 24 characters',
        'string.hex': 'ID must be a valid MongoDB ObjectId',
        'any.required': 'ID is required'
    })

export const objectIdSchema = Joi.object({ id: objectIdField })

export const addrIdParamSchema = Joi.object({ addrId: objectIdField })

export const productIdParamSchema = Joi.object({ productId: objectIdField })