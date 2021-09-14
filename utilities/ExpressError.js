//The custom Error class we created for catching/handling errors.
//Here we're able to manipulate the error message and status code.
class ExpressError extends Error {
	constructor(message, statusCode) {
		super();
		this.message = message;
		this.statusCode = statusCode;
	}
}

module.exports = ExpressError;
