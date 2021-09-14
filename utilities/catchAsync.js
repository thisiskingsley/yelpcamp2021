//function we use to wrap around Async functions and handle errors,
//without having to type "try/catch" for every single Async function.
module.exports = func => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};
