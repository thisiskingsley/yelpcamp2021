const Campground = require('../models/campground');
const Review = require('../models/review');

//CREATE ROUTE
module.exports.createReview = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const newReview = new Review(req.body.review);
	newReview.author = req.user._id;
	campground.reviews.push(newReview);
	await newReview.save();
	await campground.save();
	req.flash('success', 'Created new review');
	res.redirect(`/campgrounds/${campground._id}`);
};

//DELETE ROUTE
module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	//find the specific campground id and update it by removing ($pull) the
	//specific reviewId from the reviews array in the Campground model.
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	//Then delete that specific reviewId from the Review model altogether.
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully deleted review');
	res.redirect(`/campgrounds/${id}`);
};
