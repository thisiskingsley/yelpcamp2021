if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override'); //not necessary for React.
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('MongoDB Connected...');
});

// prettier-ignore

//EJS Tool for Layout Boilerplates
app.engine('ejs', ejsMate);
//Body-Parser Middleware (for parsing <form> data from a POST request.)
app.use(express.urlencoded({ extended: true }));
//Body-Parser (for parsing JSON data from a POST request)
app.use(express.json());
//Allows us to send PUT/DELETE Requests from our <form>
app.use(methodOverride('_method'));
//Serves our static assets for images, custom style sheets, and JS scripts
app.use(express.static(path.join(__dirname, 'public')));
//Sanitizes user input to prevent MongoDB Operation Injection.
app.use(mongoSanitize());
//Mongo-Store for session storage
const secret = process.env.SECRET || 'thisshouldmaybebeabettersecret';
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60, //only resave the session, if no change has been made, after 24 hours (time is in seconds, not milliseconds)
	crypto: {
		secret,
	},
});

//Express-Session
const sessionConfig = {
	store, //our mongo session store.
	name: 'session', //the name of the cookie.
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true, //this cookie cannot be accessed through client-side scripting. Just extra security.
		// secure: true, //this cookie can only be configured over HTTPS(secure) vs HTTP.
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // this cookie expires in a week. Date.now() is in milliseconds.
		maxAge: 1000 * 60 * 60 * 24 * 7, //this cookie can only be a week old
	},
};
app.use(session(sessionConfig));
//Helmet initialization: It helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());

const scriptSrcUrls = [
	'https://cdn.jsdelivr.net',
	'https://api.tiles.mapbox.com',
	'https://api.mapbox.com',
	'https://kit.fontawesome.com',
	'https://cdnjs.cloudflare.com',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com',
	'https://cdn.jsdelivr.net',
	'https://api.mapbox.com',
	'https://api.tiles.mapbox.com',
	'https://fonts.googleapis.com',
	'https://use.fontawesome.com',
];
const connectSrcUrls = ['https://api.mapbox.com', 'https://*.tiles.mapbox.com', 'https://events.mapbox.com'];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			childSrc: ['blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/drvwsbwup/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				'https://images.unsplash.com',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
		},
	})
);

//Passport initialization. Make sure we type these lines AFTER Express-Session.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //gets a user into a session.
passport.deserializeUser(User.deserializeUser()); //gets a user out of a session.

//Connect-Flash for temporarily displaying error/success messages
app.use(flash());
//Middleware to have global access to the Current User and Flash messages on any page/template without having to pass in a message variable in every res.render() method.
//We put this BEFORE our route handlers below: app.use('/campgrounds', campgrounds), app.use('/campgrounds/:id/review', reviews)
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//Refactored routes into separate files (routes folder)
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//ROOT ROUTE
app.get('/', (req, res) => {
	res.render('home');
});

//EXECUTE FOR ANY KIND OF ROUTE (app.all()) TO ANY PATH/URL ('*')
app.all('*', (req, res, next) => {
	next(new ExpressError('PAGE NOT FOUND', 404));
});

//Error Handling signature
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'OH BOY, SOMETHING WENT WRONG!';
	res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`SERVING ON PORT ${port}`);
});
