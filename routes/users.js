const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

const users = require('../controllers/users');

//=======================================================================
// USER ROUTES
//=======================================================================

// prettier-ignore
router.route('/register')
	//NEW USER FORM
	.get(users.renderRegisterForm)
	//CREATE NEW USER
	.post(catchAsync(users.register));

// prettier-ignore
router.route('/login')
	//LOGIN FORM
	.get(users.renderLoginForm)
	//AUTHENTICATE LOGIN
	.post(passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
		}),
		users.login
	);

//LOGOUT
router.get('/logout', users.logout);

module.exports = router;
