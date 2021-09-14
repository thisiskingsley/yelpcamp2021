const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('MongoDB Connected...');
});

// prettier-ignore
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '6136466a79c0b11845cd9f39',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Provident dolore non quae blanditiis nihil odio necessitatibus consectetur vel. Exercitationem unde dolorum necessitatibus blanditiis quisquam, laboriosam ea labore ut dolor reiciendis.',
			price,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/drvwsbwup/image/upload/v1631241816/YelpCamp/htr4gjbgqaorkb1hqx9j.jpg',
					filename: 'YelpCamp/htr4gjbgqaorkb1hqx9j',
				},
				{
					url: 'https://res.cloudinary.com/drvwsbwup/image/upload/v1631252808/YelpCamp/lxyicrai8u5p0fgcyhie.jpg',
					filename: 'YelpCamp/xddoy2rfanmvjfqwwdsi',
				},
			],
		});

		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
