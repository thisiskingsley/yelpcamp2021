const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;
//This allows virtuals to be converted to JSON and included in res.json().
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

//This is for the image thumbnails
ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_150');
});

const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ImageSchema],
		geometry: {
			type: {
				type: String,
				enum: ['Point'],
				required: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		description: String,
		location: String,
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Review',
			},
		],
	},
	opts
);

//This is for the Campground popups in the cluster map on the Index pagea to have the right Campground info.
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
		<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
		<p>${this.description.substring(0, 30)}...</p>
	`;
});

//After (.post()) we delete a Campground, this function will also delete the Reviews associated to that Campground ID.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
	if (doc) {
		await Review.deleteOne({
			_id: {
				$in: doc.reviews,
			},
		});
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);
