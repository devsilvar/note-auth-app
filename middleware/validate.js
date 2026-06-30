const Joi = require('joi');

const validateSchema = (schema, data) => {
    return schema.validate(data, {
        abortEarly: false
    });
};

module.exports = validateSchema;