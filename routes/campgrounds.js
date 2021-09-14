const express = require('express');
const router = express.Router();
const multer = require('multer'); //for parsing multipart/form-data
const { storage } = require('../cloudinary'); // storage location for our images
const upload = multer({ storage }); // tells multer where to store our images
const catchAsync = require('../utilities/catchAsync');

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const campgrounds = require('../controllers/campgrounds');

//=======================================================================
// CAMPGROUND ROUTES (check the controllers folder for route logic)
//=======================================================================

// prettier-ignore
router.route('/')
	//INDEX ROUTE
	.get(catchAsync(campgrounds.index))
	//CREATE ROUTE
    //This is to upload our Campground images to Cloudinary website
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));

//NEW ROUTE
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// prettier-ignore
router.route('/:id')
    //SHOW ROUTE
    .get(catchAsync(campgrounds.showCampground))
    //UPDATE ROUTE
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    //DELETE ROUTE
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//EDIT ROUTE
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
