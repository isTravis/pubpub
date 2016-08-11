const app = require('../api');
const Journal = require('../models').Journal;
const Link = require('../models').Link;
const Tag = require('../models').Tag;

export function createTag(req, res) {
	if (!req.user) { return res.status(403).json('Not Logged In'); }

	const now = new Date().getTime();

	const tag = new Tag({
		title: req.body.title,
		journal: req.body.journalID,
		createDate: now,
	});


	tag.save()
	.then(function(newTag) {
		if (!req.body.journalID) { return undefined; }
		return [newTag, Journal.update({ _id: req.body.journalID }, { $push: { collections: {$each: [newTag._id], $position: 0}} }).exec()];
	})
	.spread(function(newTag, journalUpdateResult) { // Send response
		return res.status(201).json(newTag);
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});
}
app.post('/createTag', createTag);

export function updateTag(req, res) {
	if (!req.user) { return res.status(403).json('Not Logged In'); }

	const tagID = req.body.tagID;
	
	Tag.findOne({_id: tagID}).exec()
	.then(function(tag) {
		tag.title = req.body.tagData.title;
		return tag.save();
	})
	.then(function(savedResult) {
		return res.status(201).json(savedResult);
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});
}
app.post('/updateTag', updateTag);


export function deleteTag(req, res) {
	if (!req.user) { return res.status(403).json('Not Logged In'); }
	// Set tag inactive, remove tag from journal list, set links inactive

	const now = new Date().getTime();
	const userID = req.user._id;
	const tagID = req.body.tagID;
	
	Tag.findOne({_id: tagID}).exec()
	.then(function(tag) {
		tag.inactive = true;
		tag.inactiveBy = userID;
		tag.inactiveDate = now;
		tag.inactiveNote = '';
		return tag.save();
	})
	.then(function(savedResult) {
		// Remove tag from Journal's Collections
		return Journal.update({ _id: savedResult.journal }, { $pull: { collections: tagID} }).exec();
	})
	.then(function() {
		// Set Links to be inactive that were using given tag
		return Link.update({ source: tagID }, {$set: { inactive: true, inactiveBy: userID, inactiveDate: now, inactiveNote: ''}}, {multi: true}).exec();
	})
	.then(function() {
		return res.status(201).json(tagID);
	})
	.catch(function(error) {
		console.log('error', error);
		return res.status(500).json(error);
	});
}
app.post('/deleteTag', deleteTag);
