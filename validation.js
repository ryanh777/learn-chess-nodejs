const Joi = require('joi');

const registerValidation =  (data) => {
    const schema = Joi.object({
        username: Joi.string()
                .min(4)
                .required(),
        password: Joi.string()
                .min(4)
                .required(),
        rootID: Joi.string()
                .required(),
    })
    return schema.validate(data)
}

const loginValidation =  (data) => {
	const schema = Joi.object({
		username: Joi.string()
				.min(4)
				.required(),
		password: Joi.string()
				.min(4)
				.required()
	})
	return schema.validate(data)
}


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;