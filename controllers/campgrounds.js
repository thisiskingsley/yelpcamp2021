//MVC (or Model–View–Controller)is a software design pattern commonly used for developing user interfaces that divide the related program logic.
//This is the Controller part where all of the main logic happens. We essentially take all the logic from the routes file and place them hear to "clean up the code."
//It's not neccessary.

const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

//INDEX ROUTE
module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

//NEW ROUTE
module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

//CREATE ROUTE
module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.author = req.user._id;
	campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
	await campground.save();
	//Show's success message after saving new campground
	req.flash('success', 'Successfully made a new campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

//SHOW ROUTE
module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id)
		//To populate the entire "reviews" field from the Campground model AND the specific "author" for that review, we need to created a nested .populate() method.
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		//populate the one author of the Campground
		.populate('author');
	if (!campground) {
		req.flash('error', 'Campground does not exist!');
		return res.redirect('/campgrounds');
	}
	res.render(`campgrounds/show`, { campground });
};

//EDIT ROUTE
module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground) {
		req.flash('error', 'Campground does not exist!');
		return res.redirect('/campgrounds');
	}
	res.render(`campgrounds/edit`, { campground });
};

//UPDATE ROUTE
module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	//Add on uploaded images
	const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
	campground.images.push(...imgs);
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	campground.save();
	req.flash('success', 'Successfully updated campground!');
	res.redirect(`/campgrounds/${campground._id}`);
};

//DELETE ROUTE
module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Succesfully deleted campground!');
	res.redirect('/campgrounds');
};
