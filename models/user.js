const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
});

UserSchema.plugin(passportLocalMongoose); //by plugging in passportLocalMongoose, we actually don't have to specify a username or passowrd in our UserSchema model.

module.exports = mongoose.model('User', UserSchema);
