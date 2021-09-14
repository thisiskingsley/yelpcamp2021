const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

//middleware to see if the user is Logged in before they can reach a private route.
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		//store the url they are requesting!
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be signed in!');
		return res.redirect('/login');
	}
	next();
};

//middleware that we created using the Joi library (schemas.js) to quickly
//validate our models BEFORE the data gets submitted to the database.
module.exports.validateCampground = (req, res, next) => {
	// server-side validations to the campground model
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		//if there is an error, map over each Error object, pull out the message from
		//each object, and combine them in a "," separated array. Then throw the
		//error message. Else, go to the next middleware.
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

module.exports.validateReview = (req, res, next) => {
	//server-side validations to the review model
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		//if there is an error, map over each Error object, pull out the message from
		//each object, and combine them in a "," separated array. Then throw the
		//error message. Else, go to the next middleware.
		const msg = error.details.map(el => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

//middleware that checks to see if the user who's trying to manipulate (edit/delete) a Campground is the author of that Campground.
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

//middleware that checks to see if the user who's trying delete a Review is the author of that Review.
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash('error', 'You do not have permission to do that!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};
