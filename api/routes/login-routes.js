const app = require('../api');
const passport = require('passport');

const User = require('../models').User;
const Notification = require('../models').Notification;
const Promise = require('bluebird');
const readFile = Promise.promisify(require('fs').readFile);
import {sendResetEmail} from '../services/emails';

export function login(req, res) {
	// Load the app language data and login the user if a login cookie exists
	const loginData = req.user
		? {
			_id: req.user._id,
			email: req.user.email,
			name: req.user.name,
			firstName: req.user.firstName,
			lastName: req.user.lastName,
			username: req.user.username,
			image: req.user.image,
			settings: req.user.settings,
			following: req.user.following,
			assets: req.user.assets,
			locale: req.user.locale,
			verifiedEmail: req.user.verifiedEmail,
			bio: req.user.bio,
			publicEmail: req.user.publicEmail,
			website: req.user.website,
			github: req.user.github,
			orcid: req.user.orcid,
			twitter: req.user.twitter,
			googleScholar: req.user.googleScholar,
		}
		: {};
	const locale = loginData.locale || 'en';
	
	const tasks = [
		readFile(__dirname + '/../../translations/languages/' + locale + '.json', 'utf8'), // Load the language data
		Notification.find({recipient: loginData._id, read: false}).count().exec() // Query for the notifcation count
	];

	// Run all tasks and return app and login data
	Promise.all(tasks).then(function(results) {
		const languageObject = JSON.parse(results[0]);
		const notificationCount = results[1];

		return res.status(201).json({
			languageData: {
				locale: locale,
				languageObject: languageObject,
			},
			loginData: {
				...loginData,
				notificationCount: notificationCount
			}
		});
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});

}
app.post('/login', passport.authenticate('local'), login);


// When a user logs out
export function logout(req, res) {
	req.logout();
	res.status(201).json(true);
}
app.get('/logout', logout);


export function requestReset(req, res) {
	User.findOne({email: req.body.email}).exec(function(err, user) {

		if (!user) {
			return res.status(201).json('User Not Found');
		}

		let resetHash = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for ( let index = 0; index < 12; index++) {
			resetHash += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		const expiration = Date.now() + 1000 * 60 * 60 * 24; // Expires in 24 hours.

		User.update({ email: req.body.email }, { resetHash: resetHash, resetHashExpiration: expiration }, function(errUserUpdate, result) {if (errUserUpdate) return console.log(errUserUpdate);});

		// Send reset email
		sendResetEmail(user.email, resetHash, user.username, function(errSendRest, success) {
			if (errSendRest) { console.log(errSendRest); return res.status(500).json(errSendRest); }
			return res.status(201).json(success);
		});

	});

}
app.post('/requestReset', requestReset);

export function checkResetHash(req, res) {
	User.findOne({resetHash: req.body.resetHash, username: req.body.username}).exec(function(err, user) {
		const currentTime = Date.now();
		if (!user || user.resetHashExpiration < currentTime) {
			return res.status(201).json('invalid');
		}

		return res.status(201).json('valid');
	});
}
app.post('/checkResetHash', checkResetHash);

export function passwordReset(req, res) {
	User.findOne({resetHash: req.body.resetHash, username: req.body.username}).exec(function(err, user) {
		const currentTime = Date.now();
		if (!user || user.resetHashExpiration < currentTime) {
			return res.status(201).json('invalid');
		}

		// Update user
		user.setPassword(req.body.password, function() {
			user.resetHash = '';
			user.resetHashExpiration = currentTime;
			user.save();
			return res.status(201).json('success');
		});
	});
}
app.post('/passwordReset', passwordReset);

export function changePassword(req, res) {
	// Add handle wrong password
	// Done in reducer but no reaction to 401 error
	const userID = req.user ? req.user._id : undefined;
	if (!userID) { return res.status(403).json('Not authorized to edit this user'); }

	if (req.body.newPassword != req.body.conPassword) {
		return res.status(403).json('New Passwords do not match');
	}

	// No backend password validation

	// Call User method to change password
	User.findOne({email: req.user.email}).exec(function(err, user) {

		if (!user) {
			return res.status(403).json('Server Error: User Not Found');
		}

		user.setPassword(req.body.newPassword, function(){
			user.save();
           	return res.status(201).json('Password Change Successful');
		})
	});
}
app.post('/changePassword', passport.authenticate('local'), changePassword);
