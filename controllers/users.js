const User = require('../models/user');

//NEW USER FORM
module.exports.renderRegisterForm = (req, res) => {
	res.render('users/register');
};

//CREATE NEW USER
module.exports.register = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registeredUser = await User.register(user, password);
		//keeps the user logged in after registering.
		req.login(registeredUser, err => {
			if (err) {
				return next(err);
			} else {
				req.flash('success', 'Welcome to Yelp Camp!');
				res.redirect('/campgrounds');
			}
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

//LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
	res.render('users/login');
};

//AUTHENTICATE LOGIN
module.exports.login = (req, res) => {
	req.flash('success', 'Welcome back!');
	//after logging in, user gets redirected to the page they WANTED to view before being sent to login page, OR, if they're coming from the homepage, they'll just be redirected to the homepage.
	const redirectUrl = req.session.returnTo || '/campgrounds';
	// deletes the url from thier session after being redirected.
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

//LOGOUT
module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/campgrounds');
};
