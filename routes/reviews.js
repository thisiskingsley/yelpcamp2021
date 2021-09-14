const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utilities/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const reviews = require('../controllers/reviews');

//=======================================================================
// REVIEW ROUTES
//=======================================================================

//CREATE ROUTE
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//DELETE ROUTE
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
